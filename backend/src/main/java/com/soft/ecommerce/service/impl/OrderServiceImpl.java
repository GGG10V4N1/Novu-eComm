package com.soft.ecommerce.service.impl;

import com.soft.ecommerce.exception.APIException;
import com.soft.ecommerce.exception.ResourceNotFoundException;
import com.soft.ecommerce.model.*;
import com.soft.ecommerce.payload.OrderDTO;
import com.soft.ecommerce.payload.OrderItemDTO;
import com.soft.ecommerce.payload.OrderRequestDTO;
import com.soft.ecommerce.payload.PageResponse;
import com.soft.ecommerce.repository.*;
import com.soft.ecommerce.service.api.CartService;
import com.soft.ecommerce.service.api.OrderService;
import com.soft.ecommerce.utils.AuthUtil;
import com.soft.ecommerce.utils.RefactorMethods;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class OrderServiceImpl implements OrderService {

    private final CartRepository cartRepository;
    private final AuthUtil authUtil;
    private final AddressRepository addressRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final CartService cartService;
    private final ModelMapper modelMapper;

    public OrderServiceImpl(AuthUtil authUtil, CartRepository cartRepository, AddressRepository addressRepository,
                            OrderRepository orderRepository, OrderItemRepository orderItemRepository,
                            ProductRepository productRepository, CartService cartService, ModelMapper modelMapper) {
        this.authUtil = authUtil;
        this.cartRepository = cartRepository;
        this.addressRepository = addressRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.cartService = cartService;
        this.modelMapper = modelMapper;
    }

    @Transactional
    @Override
    public OrderDTO placeOrder(OrderRequestDTO orderRequestDTO, String paymentMethod) {

        String emailId = authUtil.loggedInEmail();
        System.out.println("orderRequestDTO DATA: " + orderRequestDTO);

        Cart cart = cartRepository.findByEmail(emailId)
                                  .orElseThrow(() -> new ResourceNotFoundException("Cart", "email", emailId));

        Address address = addressRepository.findById(orderRequestDTO.getAddressId())
                                           .orElseThrow(() -> new ResourceNotFoundException("Address", "addressId", orderRequestDTO.getAddressId()));

        Order order = Order.builder()
                           .email(emailId)
                           .date(LocalDate.now())
                           .totalAmount(cart.getTotalAmount())
                           .status("Accepted")
                           .address(address)
                           .orderItems(new ArrayList<>())
                           .build();

        Payment payment = Payment.builder()
                                 .method(paymentMethod)
                                 .pgPaymentId(orderRequestDTO.getPgPaymentId())
                                 .pgStatus(orderRequestDTO.getPgStatus())
                                 .pgResponseMessage(orderRequestDTO.getPgResponseMessage())
                                 .pgName(orderRequestDTO.getPgName())
                                 .order(order)
                                 .build();

        order.addPayment(payment);

        Order savedOrder = orderRepository.save(order);

        List<CartItem> cartItems = new ArrayList<>(cart.getCartItems());
        if (cartItems.isEmpty()) throw new APIException("Cart is empty");

        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cartItems) {
            OrderItem orderItem = OrderItem.builder()
                                           .product(cartItem.getProduct())
                                           .quantity(cartItem.getQuantity())
                                           .discount(cartItem.getDiscount())
                                           .price(cartItem.getPrice())
                                           .order(savedOrder)
                                           .build();
            orderItems.add(orderItem);
        }
        orderItems = orderItemRepository.saveAll(orderItems);

        cartItems.forEach( item ->{
            int quantity = item.getQuantity();
            Product product = item.getProduct();

            product.setQuantity(product.getQuantity() - quantity);

            productRepository.save(product);

            cartService.deleteProductFromCart(cart.getId(), item.getProduct().getId());
        });

        OrderDTO orderDTO = modelMapper.map(savedOrder, OrderDTO.class);
        orderItems.forEach(item -> orderDTO.getOrderItems().add(modelMapper.map(item, OrderItemDTO.class)));

        orderDTO.setAddressId(orderRequestDTO.getAddressId());
        return orderDTO;
    }

    @Override
    public OrderDTO updateOrder(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                                     .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        order.setStatus(status);
        orderRepository.save(order);
        return modelMapper.map(order, OrderDTO.class);
    }

    @Override
    @Transactional
    public PageResponse<OrderDTO> findAllSellerOrders(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Pageable pageDetails = RefactorMethods.buildPageable(pageNumber, pageSize, sortBy, sortOrder);
        User seller = authUtil.loggedInUser();
        Page<Order> orderPage = orderRepository.findAllBySellerId(seller.getId(), pageDetails);
        return RefactorMethods.getPageResponse(orderPage, order -> mapOrderForSeller(order, seller),
                                  "NO ORDERS HAVE BEEN PLACED YET");
    }

    private OrderDTO mapOrderForSeller(Order order, User seller) {
        OrderDTO dto = modelMapper.map(order, OrderDTO.class);

        List<OrderItemDTO> sellerItems = (order.getOrderItems() == null ? List.of() : order.getOrderItems().stream()
                .filter(Objects::nonNull)
                .filter(item -> item.getProduct() != null
                        && item.getProduct().getUser() != null
                        && Objects.equals(item.getProduct().getUser().getId(), seller.getId()))
                .map(item -> modelMapper.map(item, OrderItemDTO.class))
                .toList());

        dto.setOrderItems(sellerItems);

        double sellerTotal = 0.0;
        for (OrderItemDTO item : sellerItems) {
            double price = item.getPrice() == null ? 0.0 : item.getPrice();
            int quantity = item.getQuantity() == null ? 0 : item.getQuantity();
            double discount = item.getDiscount() == null ? 0.0 : item.getDiscount();
            sellerTotal += price * quantity * (1.0 - discount / 100.0);
        }
        dto.setTotalAmount(sellerTotal);

        return dto;
    }

    @Override
    public PageResponse<OrderDTO> findAllOrders(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Pageable pageDetails = RefactorMethods.buildPageable(pageNumber, pageSize, sortBy, sortOrder);
        Page<Order> orderPage = orderRepository.findAll(pageDetails);
        return RefactorMethods.getPageResponse(orderPage, order -> modelMapper.map(order, OrderDTO.class),
                                  "NO ORDERS HAVE BEEN PLACED YET");
    }

    @Override
    public PageResponse<OrderDTO> findOrdersByUserEmail(String email, Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Pageable pageDetails = RefactorMethods.buildPageable(pageNumber, pageSize, sortBy, sortOrder);
        Page<Order> orderPage = orderRepository.findByEmail(email, pageDetails);
        return RefactorMethods.getPageResponse(orderPage, order -> modelMapper.map(order, OrderDTO.class),
                                  "YOU HAVE NOT PLACED ANY ORDERS YET");
    }

    @Override
    public OrderDTO findOrderByIdForUser(Long orderId, String email) {
        Order order = orderRepository.findByIdAndEmail(orderId, email)
                                     .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        return modelMapper.map(order, OrderDTO.class);
    }
}
