package com.alfa.accessories.service;

import com.alfa.accessories.dto.OrderRequest;
import com.alfa.accessories.entities.Order;
import com.alfa.accessories.entities.OrderItem;
import com.alfa.accessories.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final EmailService emailService;

    public OrderService(OrderRepository orderRepository, EmailService emailService) {
        this.orderRepository = orderRepository;
        this.emailService = emailService;
    }

    @Transactional
    public Order placeOrderFromRequest(OrderRequest request) {
        Order order = new Order();
        order.setFullName(request.getFullName().trim());
        order.setEmail(request.getEmail().trim());
        order.setPhoneNumber(request.getPhoneNumber().trim());
        order.setAddress(request.getAddress().trim());
        order.setTotalPrice(request.getTotalPrice());

        List<OrderItem> orderItems = new ArrayList<>();
        if (request.getItems() != null) {
            for (OrderRequest.OrderItemDTO itemDTO : request.getItems()) {
                OrderItem item = new OrderItem();
                item.setProductName(itemDTO.getName());
                item.setProductPrice(String.valueOf(itemDTO.getPrice()));
                item.setOrder(order);
                orderItems.add(item);
            }
        }
        order.setItems(orderItems);

        Order savedOrder = saveOrder(order);

        try {
            emailService.sendOrderConfirmation(savedOrder, request.getItems());
        } catch (Exception e) {
            log.error("Order {} saved but confirmation email failed", savedOrder.getId(), e);
        }

        return savedOrder;
    }

    @Transactional
    public Order saveOrder(Order order) {
        order.setFullName(sanitizeInput(order.getFullName()));
        order.setAddress(sanitizeInput(order.getAddress()));
        order.setPhoneNumber(sanitizeInput(order.getPhoneNumber()));
        order.setEmail(order.getEmail().trim().toLowerCase());

        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                item.setProductName(sanitizeInput(item.getProductName()));
            }
        }

        return orderRepository.save(order);
    }

    private String sanitizeInput(String input) {
        if (input == null) {
            return "";
        }
        return input.replaceAll("<[^>]*>", "").trim();
    }
}
