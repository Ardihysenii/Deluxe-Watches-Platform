package com.alfa.accessories.templates;

import com.alfa.accessories.config.SecurityConfig;
import com.alfa.accessories.controller.CollectionController;
import com.alfa.accessories.controller.HomeController;
import com.alfa.accessories.entities.Product;
import com.alfa.accessories.repository.OrderRepository;
import com.alfa.accessories.repository.ProductRepository;
import com.alfa.accessories.service.EmailService;
import com.alfa.accessories.service.OrderService;
import com.alfa.accessories.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Renders key Thymeleaf pages through Spring MVC to catch template/fragment errors early.
 */
@WebMvcTest(controllers = {CollectionController.class, HomeController.class})
@Import({ProductService.class, OrderService.class, SecurityConfig.class})
class PageRenderSmokeTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductRepository productRepository;

    @MockBean
    private OrderRepository orderRepository;

    @MockBean
    private EmailService emailService;

    @BeforeEach
    void setUpMocks() {
        when(productRepository.findAll()).thenReturn(List.of());
        when(productRepository.findTop3ByOrderByIdDesc()).thenReturn(List.of());
    }

    @Test
    void collectionPageRendersWithFooter() throws Exception {
        mockMvc.perform(get("/collection"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("alfa-site-footer")));
    }

    @Test
    void productDetailsPageRendersWithFooter() throws Exception {
        Product product = sampleProduct();
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.findTop3ByCategoryAndIdNot("Classic", 1L)).thenReturn(List.of(product));

        mockMvc.perform(get("/product-details/1"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("alfa-site-footer")));
    }

    @Test
    void buyPageRendersWithDarkFooter() throws Exception {
        mockMvc.perform(get("/buy"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("alfa-site-footer--dark")));
    }

    private static Product sampleProduct() {
        Product product = new Product();
        product.setId(1L);
        product.setName("Test Watch");
        product.setDescription("Oystersteel");
        product.setPrice(1200.0);
        product.setColor("Silver");
        product.setMaterial("Steel");
        product.setCategory("Classic");
        product.setImageUrl("/img/unnamed (1)-nobg.png");
        product.setImageUrl2("/img/unamed (1.2)-nobg.png");
        product.setImageUrl3("/img/unnamed (1.3)-nobg.png");
        return product;
    }
}
