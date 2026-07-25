package com.soft.ecommerce.service.impl;

import com.soft.ecommerce.model.User;
import com.soft.ecommerce.payload.AnalyticsResponse;
import com.soft.ecommerce.repository.OrderRepository;
import com.soft.ecommerce.repository.ProductRepository;
import com.soft.ecommerce.service.api.AnalyticsService;
import com.soft.ecommerce.utils.AuthUtil;
import org.springframework.stereotype.Service;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final AuthUtil authUtil;

    public AnalyticsServiceImpl(ProductRepository productRepository, OrderRepository orderRepository,
                                AuthUtil authUtil) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.authUtil = authUtil;
    }

    @Override
    public AnalyticsResponse getAnalyticsData() {
        AnalyticsResponse response = new AnalyticsResponse();

        long productCount = productRepository.count();
        long totalOrders = orderRepository.count();;
        Double totalRevenue = orderRepository.getTotalRevenue();

        response.setProductCount(String.valueOf(productCount));
        response.setTotalOrders(String.valueOf(totalOrders));
        response.setTotalRevenue(String.valueOf(totalRevenue != null ? totalRevenue : 0));
        return response;
    }

    @Override
    public AnalyticsResponse getSellerAnalyticsData() {
        User seller = authUtil.loggedInUser();
        AnalyticsResponse response = new AnalyticsResponse();

        long productCount = productRepository.countByUser(seller);
        long totalOrders = orderRepository.countDistinctBySellerId(seller.getId());
        Double totalRevenue = orderRepository.getTotalRevenueBySellerId(seller.getId());

        response.setProductCount(String.valueOf(productCount));
        response.setTotalOrders(String.valueOf(totalOrders));
        response.setTotalRevenue(String.valueOf(totalRevenue != null ? totalRevenue : 0));
        return response;
    }
}
