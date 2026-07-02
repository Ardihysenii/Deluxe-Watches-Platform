package com.alfa.accessories.controller;

import com.alfa.accessories.dto.OrderRequest;
import com.alfa.accessories.entities.Product;
import com.alfa.accessories.service.OrderService;
import com.alfa.accessories.service.ProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
public class HomeController {

    private static final Logger log = LoggerFactory.getLogger(HomeController.class);

    private final ProductService productService;
    private final OrderService orderService;

    public HomeController(ProductService productService, OrderService orderService) {
        this.productService = productService;
        this.orderService = orderService;
    }

    @PostMapping("/api/orders/place")
    @ResponseBody
    public ResponseEntity<String> placeOrder(@RequestBody OrderRequest request) {
        try {
            orderService.placeOrderFromRequest(request);
            return ResponseEntity.ok("Porosia u krye me sukses!");
        } catch (Exception e) {
            log.error("Order placement failed", e);
            return ResponseEntity.internalServerError().body("Gabim: " + e.getMessage());
        }
    }

    @GetMapping("/api/products/search")
    @ResponseBody
    public List<Product> searchProducts(@RequestParam("query") String query) {
        return productService.smartSearch(query);
    }

    @GetMapping("/product-details/{id}")
    public String showProductDetails(@PathVariable("id") Long id, Model model) {
        Product product = productService.getProductById(id);
        if (product != null) {
            model.addAttribute("product", product);
            model.addAttribute("relatedProducts",
                    productService.getRelatedProducts(product.getCategory(), id));
            return "ProductDetails";
        }
        return "redirect:/";
    }

    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("relatedProducts", productService.getFeaturedProductsForDisplay());
        return "index";
    }

    @GetMapping("/LuxuryWatches")
    public String luxury() {
        return "LuxuryWatches";
    }

    @GetMapping("/ClassicWatches")
    public String classic() {
        return "ClassicWatches";
    }

    @GetMapping("/SportiveWatches")
    public String sportive() {
        return "SportiveWatches";
    }

    @GetMapping("/luxury-watches")
    public String luxuryWatches() {
        return "LuxuryWatches";
    }

    @GetMapping("/checkout")
    public String checkoutPage() {
        return "buy";
    }

    @GetMapping("/buy")
    public String buyPage(Model model) {
        model.addAttribute("relatedProducts", productService.getFeaturedProductsForDisplay());
        return "buy";
    }

    @GetMapping("/luxury-watches-2")
    public String luxury2() {
        return "LuxuryWatches2";
    }

    @GetMapping("/luxury-watches-3")
    public String luxury3() {
        return "LuxuryWatches3";
    }

    @GetMapping("/classic-watches")
    public String classicc() {
        return "ClassicWatches";
    }

    @GetMapping("/classic-watches-2")
    public String classic2() {
        return "ClassisWatches2";
    }

    @GetMapping("/classic-watches-3")
    public String classic3() {
        return "ClassisWatches3";
    }

    @GetMapping("/sportive-watches")
    public String sportivee() {
        return "SportiveWatches";
    }

    @GetMapping("/sportive-watches-2")
    public String sportive2() {
        return "SportiveWatches2";
    }

    @GetMapping("/sportive-watches-3")
    public String sportive3() {
        return "SportiveWatches3";
    }
}
