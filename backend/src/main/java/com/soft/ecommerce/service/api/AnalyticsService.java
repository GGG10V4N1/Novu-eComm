package com.soft.ecommerce.service.api;

import com.soft.ecommerce.payload.AnalyticsResponse;

public interface AnalyticsService {
    AnalyticsResponse getAnalyticsData();
    AnalyticsResponse getSellerAnalyticsData();
}
