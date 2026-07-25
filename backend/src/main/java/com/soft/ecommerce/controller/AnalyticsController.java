package com.soft.ecommerce.controller;

import com.soft.ecommerce.payload.AnalyticsResponse;
import com.soft.ecommerce.service.api.AnalyticsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ecomApi")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/admin/app/analytics")
    public ResponseEntity<AnalyticsResponse> getAnalytics() {

        AnalyticsResponse response = analyticsService.getAnalyticsData();
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @GetMapping("/seller/app/analytics")
    public ResponseEntity<AnalyticsResponse> getSellerAnalytics() {

        AnalyticsResponse response = analyticsService.getSellerAnalyticsData();
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}
