package com.alfa.accessories.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "product")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private double price;
    private String color;
    private String material;
    private String category;

    @Column(name = "search_tags", columnDefinition = "TEXT")
    private String searchTags;

    // Fotoja e parë (Lidhet me image_url në SQL)
    @Column(name = "image_url")
    private String imageUrl;

    // Fotoja e dytë — DB column is mixed-case "imageUrl2" (quoted in PostgreSQL)
    @Column(name = "imageUrl2")
    private String imageUrl2;

    // Fotoja e tretë
    @Column(name = "imageUrl3")
    private String imageUrl3;

    // Konstruktori i thjeshtë (Required by JPA)
    public Product() {}

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getMaterial() { return material; }
    public void setMaterial(String material) { this.material = material; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSearchTags() { return searchTags; }
    public void setSearchTags(String searchTags) { this.searchTags = searchTags; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getImageUrl2() { return imageUrl2; }
    public void setImageUrl2(String imageUrl2) { this.imageUrl2 = imageUrl2; }

    public String getImageUrl3() { return imageUrl3; }
    public void setImageUrl3(String imageUrl3) { this.imageUrl3 = imageUrl3; }
}