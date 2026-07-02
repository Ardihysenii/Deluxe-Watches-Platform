package com.alfa.accessories.controller;

import com.alfa.accessories.service.ProductService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class CollectionController {

    private final ProductService productService;

    public CollectionController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping({"/collection", "/dashboard"})
    public String showCollection(
            @RequestParam(name = "query", required = false) String query,
            @RequestParam(name = "sort", required = false, defaultValue = "newest") String sort,
            HttpServletRequest request,
            Model model) {

        if (query != null && !query.trim().isEmpty()) {
            model.addAttribute("searchQuery", query);
        }

        model.addAttribute("products", productService.listForCollection(query, sort));
        model.addAttribute("currentSort", sort);
        model.addAttribute("relatedProducts", productService.getFeaturedProductsForDisplay());
        model.addAttribute("pageTitle",
                request.getRequestURI().contains("dashboard") ? "Dashboard" : "Collection");

        return "collection";
    }
}
