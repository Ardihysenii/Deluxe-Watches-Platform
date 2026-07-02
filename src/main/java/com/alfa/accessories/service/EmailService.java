package com.alfa.accessories.service;

import com.alfa.accessories.dto.OrderRequest;
import com.alfa.accessories.entities.Order;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final EmailJsService emailJsService;

    public EmailService(EmailJsService emailJsService) {
        this.emailJsService = emailJsService;
    }

    public void sendOrderConfirmation(Order order, List<OrderRequest.OrderItemDTO> items) {
        try {
            emailJsService.sendAdminNotification(order, items);
        } catch (Exception e) {
            log.error("Admin order notification failed for order {}", order.getId(), e);
        }

        try {
            emailJsService.sendCustomerReceipt(order, items);
        } catch (Exception e) {
            log.error("Customer thank-you email failed for order {} to {}", order.getId(), order.getEmail(), e);
        }
    }
}
