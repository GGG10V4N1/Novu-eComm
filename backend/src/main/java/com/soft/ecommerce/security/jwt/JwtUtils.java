package com.soft.ecommerce.security.jwt;

import com.soft.ecommerce.security.services.UserDetailsImpl;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.io.Decoders;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.web.util.WebUtils;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${spring.app.jwtSecret}")
    private String jwtSecret;
    @Value("${spring.app.jwtExpirationMs}")
    private Integer jwtExpirationMs;
    @Value("${spring.ecom.app.jwtCookieName}")
    private String jwtCookie;
    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;
    @Value("${app.cookie.same-site:lax}")
    private String cookieSameSite;
    @Value("${app.cookie.domain:}")
    private String cookieDomain;

    public String getJwtFromCookies(HttpServletRequest request) {
        Cookie cookie = WebUtils.getCookie(request, jwtCookie);
        if (cookie != null) return cookie.getValue();
        return null;
    }

    public String getJwtFromHeader(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    public ResponseCookie generateJwtCookie(UserDetailsImpl mainUser) {
        String jwt = generateTokenFromUsername(mainUser.getUsername());
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(jwtCookie, jwt)
                .path("/")
                .maxAge(24 * 60 * 60)
                .httpOnly(false)
                .secure(cookieSecure)
                .sameSite(cookieSameSite);
        if (cookieDomain != null && !cookieDomain.isEmpty()) {
            builder.domain(cookieDomain);
        }
        return builder.build();
    }

    public ResponseCookie getCleanJwtCookie() {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(jwtCookie, null)
                .path("/")
                .maxAge(0)
                .secure(cookieSecure)
                .sameSite(cookieSameSite);
        if (cookieDomain != null && !cookieDomain.isEmpty()) {
            builder.domain(cookieDomain);
        }
        return builder.build();
    }

    public String generateTokenFromUsername(String username) {
        return Jwts.builder()
                   .subject(username)
                   .issuedAt(new Date())
                   .expiration(new Date((new Date()).getTime() + jwtExpirationMs))
                   .signWith(key())
                   .compact();
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parser()
                   .verifyWith((SecretKey) key())
                   .build()
                   .parseSignedClaims(token)
                   .getPayload()
                   .getSubject();
    }

    private Key key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parser()
                .verifyWith((SecretKey) key())
                .build()
                .parseSignedClaims(authToken);
            return true;
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }
}
