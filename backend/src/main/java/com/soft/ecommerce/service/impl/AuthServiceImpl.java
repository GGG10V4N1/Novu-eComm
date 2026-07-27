package com.soft.ecommerce.service.impl;

import com.soft.ecommerce.config.AppConstants;
import com.soft.ecommerce.exception.APIException;
import com.soft.ecommerce.model.AppRole;
import com.soft.ecommerce.model.Role;
import com.soft.ecommerce.model.User;
import com.soft.ecommerce.payload.AuthenticationResult;
import com.soft.ecommerce.payload.PageResponse;
import com.soft.ecommerce.payload.UserDTO;
import com.soft.ecommerce.repository.RoleRepository;
import com.soft.ecommerce.repository.UserRepository;
import com.soft.ecommerce.security.jwt.JwtUtils;
import com.soft.ecommerce.security.request.LoginRequest;
import com.soft.ecommerce.security.request.SignUpRequest;
import com.soft.ecommerce.security.request.UpdateEmailRequest;
import com.soft.ecommerce.security.request.UpdatePasswordRequest;
import com.soft.ecommerce.security.response.MessageResponse;
import com.soft.ecommerce.security.response.UserInfoResponse;
import com.soft.ecommerce.security.services.UserDetailsImpl;
import com.soft.ecommerce.service.api.AuthService;
import com.soft.ecommerce.utils.AuthUtil;
import com.soft.ecommerce.utils.RefactorMethods;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder encoder;
    private final ModelMapper modelMapper;
    private final AuthUtil authUtil;

    public AuthServiceImpl(AuthenticationManager authenticationManager, JwtUtils jwtUtils, UserRepository userRepository, RoleRepository roleRepository,
                           PasswordEncoder encoder, ModelMapper modelMapper, AuthUtil authUtil) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.encoder = encoder;
        this.modelMapper = modelMapper;
        this.authUtil = authUtil;
    }

    @Override
    public AuthenticationResult login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                                                                            loginRequest.getUsername(),
                                                                            loginRequest.getPassword()) );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(userDetails);

        List<String> roles = userDetails.getAuthorities()
                                        .stream()
                                        .map(item -> item.getAuthority())
                                        .toList();

        UserInfoResponse userInfoResponse = UserInfoResponse.builder()
                                                             .id(userDetails.getId())
                                                             .jwtToken(jwtUtils.generateTokenFromUsername(userDetails.getUsername()))
                                                             .username(userDetails.getUsername())
                                                             .email(userDetails.getEmail())
                                                             .roles(roles)
                                                             .build();

        return new AuthenticationResult(userInfoResponse,jwtCookie);
    }

    @Override
    public ResponseCookie logoutUser() {
        return jwtUtils.getCleanJwtCookie();
    }

    @Override
    public ResponseEntity<MessageResponse> register(SignUpRequest signUpRequest) {
        if (userRepository.existsByUsernameIgnoreCase(signUpRequest.getUsername())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse("Error: Username" +
                                                                      signUpRequest.getUsername() + "is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse("Error: Email " +
                                                                      signUpRequest.getEmail() + "is already in use!"));
        }
        //new user
        User user = User.builder()
                        .username(signUpRequest.getUsername())
                        .email(signUpRequest.getEmail())
                        .password(encoder.encode(signUpRequest.getPassword()))
                        .build();

        Set<String> strRoles = signUpRequest.getRoles();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null) {
            Role userRole = roleRepository.findByName(AppRole.ROLE_USER)
                                          .orElseThrow(
                                               () -> new APIException("Error: Role is not found.")
                                          );
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role) {
                    case "admin":
                        Role adminRole = roleRepository.findByName(AppRole.ROLE_ADMIN)
                                                       .orElseThrow(() -> new APIException("Error: Role is not found."));
                        roles.add(adminRole);
                        break;
                    case "seller":
                        Role sellerRole = roleRepository.findByName(AppRole.ROLE_SELLER)
                                                        .orElseThrow(() -> new APIException("Error: Role is not found."));
                        roles.add(sellerRole);
                        break;
                    default:
                        Role userRole = roleRepository.findByName(AppRole.ROLE_USER)
                                                      .orElseThrow(() -> new APIException("Error: Role is not found."));
                        roles.add(userRole);
                }
            });
        }

        user.setRoles(roles);
        userRepository.save(user);
        return ResponseEntity.status(HttpStatus.OK).body(new MessageResponse("User registered successfully!"));
    }

    @Override
    public UserInfoResponse getCurrentUserDetails(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        List<String> roles = userDetails.getAuthorities()
                                        .stream()
                                        .map(item -> item.getAuthority())
                                        .toList();

        return UserInfoResponse.builder()
                               .id(userDetails.getId())
                               .username(userDetails.getUsername())
                               .roles(roles)
                               .build();
    }

    @Override
    public PageResponse<UserDTO> getAllSellers(Integer pageNumber) {
        Pageable pageDetails = RefactorMethods.buildPageable(pageNumber,
                                                          Integer.parseInt(AppConstants.PAGE_SIZE),
                                                          AppConstants.SORT_USERS_BY,
                                                  "desc");
        Page<User> usersPage = userRepository.findByRoleName(AppRole.ROLE_SELLER, pageDetails);

        return RefactorMethods.getPageResponse(usersPage,
                                          user -> modelMapper.map(user,UserDTO.class),
                                  "NO SELLERS FOUNDED");
    }

    @Override
    public UserInfoResponse updatePassword(UpdatePasswordRequest request) {
        User user = authUtil.loggedInUser();

        if (!encoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new APIException("Current password is incorrect");
        }

        if (encoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new APIException("New password must be different from the current one");
        }

        user.setPassword(encoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return buildUserInfoResponse(user);
    }

    @Override
    public UserInfoResponse updateEmail(UpdateEmailRequest request) {
        User user = authUtil.loggedInUser();

        if (!encoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new APIException("Current password is incorrect");
        }

        if (userRepository.existsByEmail(request.getNewEmail())) {
            throw new APIException("Email " + request.getNewEmail() + " is already in use");
        }

        if (request.getNewEmail().equalsIgnoreCase(user.getEmail())) {
            throw new APIException("New email must be different from the current one");
        }

        user.setEmail(request.getNewEmail());
        userRepository.save(user);

        return buildUserInfoResponse(user);
    }

    private UserInfoResponse buildUserInfoResponse(User user) {
        List<String> roles = user.getRoles()
                                 .stream()
                                 .map(role -> role.getName().name())
                                 .toList();

        return UserInfoResponse.builder()
                               .id(user.getId())
                               .username(user.getUsername())
                               .email(user.getEmail())
                               .roles(roles)
                               .build();
    }
}
