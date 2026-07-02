package com.alfa.accessories.dto;

import java.util.List;

public class OrderRequest {
    private String fullName;
    private String email;
    private String phoneNumber;
    private String address;
    private Double totalPrice;
    private List<OrderItemDTO> items; // Emri i klases ketu duhet te jete i njejte me ate poshte

    // Getters dhe Setters
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }

    public List<OrderItemDTO> getItems() { return items; }
    public void setItems(List<OrderItemDTO> items) { this.items = items; }

    // KLASA E BRENDSHME - Sigurohu qe emri eshte OrderItemDTO
    public static class OrderItemDTO {
        private String name;
        private String price;
        private String imageUrl;
        private String color;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getPrice() { return price; }
        public void setPrice(String price) { this.price = price; }

        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

        public String getColor() { return color; }
        public void setColor(String color) { this.color = color; }
    }
}