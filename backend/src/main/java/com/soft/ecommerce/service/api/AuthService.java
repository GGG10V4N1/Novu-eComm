package com.soft.ecommerce.service.api;

import com.soft.ecommerce.payload.AuthenticationResult;
import com.soft.ecommerce.payload.PageResponse;
import com.soft.ecommerce.payload.UserDTO;
import com.soft.ecommerce.security.request.LoginRequest;
import com.soft.ecommerce.security.request.SignUpRequest;
import com.soft.ecommerce.security.request.UpdateEmailRequest;
import com.soft.ecommerce.security.request.UpdatePasswordRequest;
import com.soft.ecommerce.security.response.MessageResponse;
import com.soft.ecommerce.security.response.UserInfoResponse;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

public interface AuthService {
    AuthenticationResult login(LoginRequest loginRequest);
    ResponseCookie logoutUser();
    ResponseEntity<MessageResponse> register(SignUpRequest signUpRequest);
    UserInfoResponse getCurrentUserDetails(Authentication authentication);
    PageResponse<UserDTO> getAllSellers(Integer pageNumber);
    UserInfoResponse updatePassword(UpdatePasswordRequest request);
    UserInfoResponse updateEmail(UpdateEmailRequest request);
}
