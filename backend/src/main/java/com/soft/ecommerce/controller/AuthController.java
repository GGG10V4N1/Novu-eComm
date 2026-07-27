package com.soft.ecommerce.controller;

import com.soft.ecommerce.config.AppConstants;
import com.soft.ecommerce.payload.AuthenticationResult;
import com.soft.ecommerce.payload.PageResponse;
import com.soft.ecommerce.payload.UserDTO;
import com.soft.ecommerce.security.request.LoginRequest;
import com.soft.ecommerce.security.request.SignUpRequest;
import com.soft.ecommerce.security.request.UpdateEmailRequest;
import com.soft.ecommerce.security.request.UpdatePasswordRequest;
import com.soft.ecommerce.security.response.MessageResponse;
import com.soft.ecommerce.security.response.UserInfoResponse;
import com.soft.ecommerce.service.api.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

//finished
@RestController
@RequestMapping("/ecomApi/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signin")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequest loginRequest) {

        AuthenticationResult result = authService.login(loginRequest);
        return ResponseEntity.status(HttpStatus.OK)
                             .header(HttpHeaders.SET_COOKIE, result.getJwtCookie().toString() )
                             .body(result.getResponse());
    }

    @PostMapping("/signout")
    public ResponseEntity<?> logoutUser(){

        ResponseCookie cookie = authService.logoutUser();
        return ResponseEntity.status(HttpStatus.OK)
                             .header(HttpHeaders.SET_COOKIE, cookie.toString())
                             .body(new MessageResponse("You've been signed out!"));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signupUser(@Valid @RequestBody SignUpRequest signUpRequest) {
        return authService.register(signUpRequest);
    }

    @GetMapping("/username")
    public ResponseEntity<String> currentUsername(Authentication authentication){
        if (authentication != null) return ResponseEntity.status(HttpStatus.OK).body(authentication.getName());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("NOT FOUND USER");
    }


    @GetMapping("/user")
    public ResponseEntity<?> getUserDetails(Authentication authentication){
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserInfoResponse userInfoResponse = authService.getCurrentUserDetails(authentication);
        return ResponseEntity.status(HttpStatus.OK).body(userInfoResponse);
    }


    @GetMapping("/sellers")
    public ResponseEntity<?> getAllSellers(@RequestParam(name = "pageNumber",
                                                         defaultValue = AppConstants.PAGE_NUMBER,
                                                         required = false) Integer pageNumber) {

        PageResponse<UserDTO> userResponse = authService.getAllSellers(pageNumber);
        return ResponseEntity.status(HttpStatus.OK).body(userResponse);
    }

    @PutMapping("/password")
    public ResponseEntity<UserInfoResponse> updatePassword(@Valid @RequestBody UpdatePasswordRequest request) {

        UserInfoResponse response = authService.updatePassword(request);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @PutMapping("/email")
    public ResponseEntity<UserInfoResponse> updateEmail(@Valid @RequestBody UpdateEmailRequest request) {

        UserInfoResponse response = authService.updateEmail(request);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }


}
