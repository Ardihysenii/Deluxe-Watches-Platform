package com.alfa.accessories.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "Order_Items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_name") // Kjo zgjidh errorin 'productName'
    private String productName;

    @Column(name = "product_price") // Sigurohemi edhe per cmimin
    private String productPrice;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    // Getters dhe Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getProductPrice() { return productPrice; }
    public void setProductPrice(String productPrice) { this.productPrice = productPrice; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
}