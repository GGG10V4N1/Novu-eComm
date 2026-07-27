package com.soft.ecommerce.security.config;

import com.soft.ecommerce.model.AppRole;
import com.soft.ecommerce.model.Role;
import com.soft.ecommerce.model.User;
import com.soft.ecommerce.repository.RoleRepository;
import com.soft.ecommerce.repository.UserRepository;
import com.soft.ecommerce.security.jwt.AuthEntryPointJwt;
import com.soft.ecommerce.security.jwt.AuthTokenFilter;
import com.soft.ecommerce.security.services.UserDetailsServiceImpl;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Set;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig implements WebMvcConfigurer {

    private final UserDetailsServiceImpl userDetailsService;
    private final AuthEntryPointJwt unauthorizedHandler;

    public WebSecurityConfig(UserDetailsServiceImpl userDetailsService,AuthEntryPointJwt unauthorizedHandler) {
        this.userDetailsService = userDetailsService;
        this.unauthorizedHandler = unauthorizedHandler;
    }

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        //authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .cors(cors -> {})
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth ->
                        auth.requestMatchers("/ecomApi/auth/**").permitAll()
                                .requestMatchers("/v3/api-docs/**").permitAll()
                                .requestMatchers("/h2-console/**").permitAll()
                                .requestMatchers("/ecomApi/admin/**").hasRole("ADMIN")
                                .requestMatchers("/ecomApi/seller/**").hasAnyRole("ADMIN","SELLER")
                                //.requestMatchers("/api/admin/**").permitAll()
                                .requestMatchers("/ecomApi/public/**").permitAll()
                                .requestMatchers("/swagger-ui/**").permitAll()
                                .requestMatchers("/ecomApi/test/**").permitAll()
                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                .anyRequest().authenticated()
                );

        http.authenticationProvider(authenticationProvider());

        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);
        http.headers(headers -> headers.frameOptions(
                HeadersConfigurer.FrameOptionsConfig::sameOrigin));

        return http.build();
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web -> web.ignoring().requestMatchers("/v2/api-docs",
                "/configuration/ui",
                "/swagger-resources/**",
                "/configuration/security",
                "/swagger-ui.html",
                "/webjars/**"));
    }

    @Bean
    public CommandLineRunner initData(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Retrieve or create roles
            Role userRole = roleRepository.findByName(AppRole.ROLE_USER)
                                          .orElseGet(() -> {
                                            Role newUserRole = new Role(null,AppRole.ROLE_USER);
                                            return roleRepository.save(newUserRole);
                                          });

            Role sellerRole = roleRepository.findByName(AppRole.ROLE_SELLER)
                                            .orElseGet(() -> {
                                                Role newSellerRole = new Role(null,AppRole.ROLE_SELLER);
                                                return roleRepository.save(newSellerRole);
                                            });

            Role adminRole = roleRepository.findByName(AppRole.ROLE_ADMIN)
                                           .orElseGet(() -> {
                                               Role newAdminRole = new Role(null,AppRole.ROLE_ADMIN);
                                               return roleRepository.save(newAdminRole);
                                           });

            Set<Role> userRoles = Set.of(userRole);
            Set<Role> sellerRoles = Set.of(sellerRole);
            Set<Role> adminRoles = Set.of(userRole, sellerRole, adminRole);


            // Create users if not already present
            if (!userRepository.existsByUsernameIgnoreCase("user1")) {
                User user1 = new User(null,"user1", "user1@example.com", passwordEncoder.encode("password1"),null,null,null,null);
                userRepository.save(user1);
            }

            if (!userRepository.existsByUsernameIgnoreCase("seller1")) {
                User seller1 = new User(null,"seller1", "seller1@example.com", passwordEncoder.encode("password2"),null,null,null,null);
                userRepository.save(seller1);
            }

            if (!userRepository.existsByUsernameIgnoreCase("admin")) {
                User admin = new User(null,"admin", "admin@example.com", passwordEncoder.encode("adminPass"),null,null,null,null);
                userRepository.save(admin);
            }

            // Update roles for existing users
            userRepository.findByUsername("user1").ifPresent(user -> {
                user.setRoles(userRoles);
                userRepository.save(user);
            });

            userRepository.findByUsername("seller1").ifPresent(seller -> {
                seller.setRoles(sellerRoles);
                userRepository.save(seller);
            });

            userRepository.findByUsername("admin").ifPresent(admin -> {
                admin.setRoles(adminRoles);
                userRepository.save(admin);
            });
        };
    }

}
