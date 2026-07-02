package com.alfa.accessories.service;



import com.alfa.accessories.config.EmailJsProperties;

import com.alfa.accessories.dto.OrderRequest;

import com.alfa.accessories.entities.Order;

import com.alfa.accessories.entities.Product;

import com.alfa.accessories.repository.ProductRepository;

import jakarta.servlet.http.HttpServletRequest;

import org.slf4j.Logger;

import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Value;

import org.springframework.http.MediaType;

import org.springframework.stereotype.Service;

import org.springframework.web.client.RestClient;

import org.springframework.web.client.RestClientResponseException;

import org.springframework.web.context.request.RequestContextHolder;

import org.springframework.web.context.request.ServletRequestAttributes;



import java.net.URLEncoder;

import java.nio.charset.StandardCharsets;

import java.time.LocalDateTime;

import java.time.format.DateTimeFormatter;

import java.util.HashMap;

import java.util.LinkedHashMap;

import java.util.List;

import java.util.Locale;

import java.util.Map;



@Service

public class EmailJsService {



    private static final Logger log = LoggerFactory.getLogger(EmailJsService.class);

    private static final DateTimeFormatter ORDER_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private static final String EMAILJS_URL = "https://api.emailjs.com/api/v1.0/email/send";



    private enum RecipientMode {

        CUSTOMER,

        ADMIN

    }



    private final EmailJsProperties properties;

    private final ProductRepository productRepository;

    private final EmailWatchImageService emailWatchImageService;

    private final RestClient restClient;

    private final String siteBaseUrl;

    private final String emailImageBaseUrl;



    public EmailJsService(

            EmailJsProperties properties,

            ProductRepository productRepository,

            EmailWatchImageService emailWatchImageService,

            @Value("${deluxe.site.base-url:http://localhost:8080}") String siteBaseUrl,

            @Value("${deluxe.email.image-base-url:${deluxe.site.base-url:http://localhost:8080}}") String emailImageBaseUrl) {

        this.properties = properties;

        this.productRepository = productRepository;

        this.emailWatchImageService = emailWatchImageService;

        this.siteBaseUrl = siteBaseUrl;

        this.emailImageBaseUrl = emailImageBaseUrl;

        this.restClient = RestClient.create();

    }



    public void sendCustomerReceipt(Order order, List<OrderRequest.OrderItemDTO> items) {

        enrichItemsFromCatalog(items);

        OrderEmailContext context = buildContext(order, items);

        Map<String, String> params = baseParams(order, context);

        params.put("subject", "Faleminderit për blerjen - Deluxe");

        params.put("message", "Porosia juaj u pranua me sukses. Faleminderit që zgjodhët Deluxe.");

        sendTemplate(properties.getCustomerTemplateId(), order.getEmail(), params, RecipientMode.CUSTOMER);

    }



    public void sendAdminNotification(Order order, List<OrderRequest.OrderItemDTO> items) {

        enrichItemsFromCatalog(items);

        OrderEmailContext context = buildContext(order, items);

        Map<String, String> params = baseParams(order, context);

        params.put("subject", "Porosi e re - " + safe(order.getFullName()));

        params.put("customer_email", safe(order.getEmail()));

        params.put("customer_phone", safe(order.getPhoneNumber()));

        params.put("customer_address", safe(order.getAddress()));

        params.put("items_summary", context.itemsSummary());

        sendTemplate(properties.getAdminTemplateId(), properties.getAdminEmail(), params, RecipientMode.ADMIN);

    }



    private Map<String, String> baseParams(Order order, OrderEmailContext context) {

        Map<String, String> params = new LinkedHashMap<>();

        String imageUrl = context.primaryImageUrl();

        emailWatchImageService.embed(context.primaryImageSource()).ifPresent(embedded -> {

            params.put(embedded.attachmentParam(), embedded.dataUrl());

            params.put("watch_photo", embedded.dataUrl());

        });

        params.put("brand_name", "DELUXE");

        params.put("customer_name", safe(order.getFullName()));

        params.put("to_name", safe(order.getFullName()));

        params.put("from_name", "Deluxe");

        params.put("reply_to", safe(order.getEmail()));

        params.put("user_email", safe(order.getEmail()));

        params.put("order_id", order.getId() != null ? String.valueOf(order.getId()) : "");

        params.put("order_total", formatPrice(order.getTotalPrice()));

        params.put("order_date", formatOrderDate(order));

        params.put("product_name", context.primaryName());

        params.put("product_price", context.primaryPrice());

        params.put("watch_name", context.primaryName());

        params.put("watch_price", context.primaryPrice());

        params.put("watch_color", context.primaryColor());

        params.put("watch_image", imageUrl);

        params.put("watch_image_url", imageUrl);

        params.put("product_image", imageUrl);

        params.put("product_image_url", imageUrl);

        params.put("background_color", context.theme().backgroundColor());

        params.put("text_color", context.theme().textColor());

        params.put("accent_color", context.theme().accentColor());

        return params;

    }



    private void sendTemplate(String templateId, String toEmail, Map<String, String> templateParams, RecipientMode mode) {

        if (!properties.isConfigured()) {

            throw new IllegalStateException("EmailJS is not configured. Set deluxe.emailjs.* in application.properties or .env.");

        }



        String recipient = safe(toEmail);

        if (recipient.isBlank()) {

            throw new IllegalArgumentException("EmailJS recipient is empty for template " + templateId);

        }



        Map<String, Object> payload = new HashMap<>();

        payload.put("service_id", properties.getServiceId());

        payload.put("template_id", templateId);

        payload.put("user_id", properties.getPublicKey());

        payload.put("accessToken", properties.getPrivateKey());



        Map<String, String> params = new LinkedHashMap<>(templateParams);

        applyRecipientParams(params, recipient, mode);

        payload.put("template_params", params);



        try {

            restClient.post()

                    .uri(EMAILJS_URL)

                    .contentType(MediaType.APPLICATION_JSON)

                    .body(payload)

                    .retrieve()

                    .toBodilessEntity();

            log.info("EmailJS template {} sent to {} ({})", templateId, recipient, mode);

        } catch (RestClientResponseException ex) {

            log.error("EmailJS failed for template {} to {} ({}): {} {}",

                    templateId, recipient, mode, ex.getStatusCode(), ex.getResponseBodyAsString());

            throw ex;

        }

    }



    private void applyRecipientParams(Map<String, String> params, String recipient, RecipientMode mode) {

        params.put("to_email", recipient);

        params.put("email", recipient);



        if (mode == RecipientMode.CUSTOMER) {

            params.put("user_email", recipient);

            params.put("customer_email", recipient);

            return;

        }



        if (!params.containsKey("user_email") || params.get("user_email").isBlank()) {

            params.put("user_email", recipient);

        }

    }



    private void enrichItemsFromCatalog(List<OrderRequest.OrderItemDTO> items) {

        if (items == null) {

            return;

        }

        for (OrderRequest.OrderItemDTO item : items) {

            if (item == null) {

                continue;

            }

            boolean needsImage = item.getImageUrl() == null || item.getImageUrl().isBlank();

            boolean needsColor = item.getColor() == null || item.getColor().isBlank();

            if (!needsImage && !needsColor) {

                continue;

            }

            String productName = stripQuantitySuffix(item.getName());

            productRepository.findFirstByNameIgnoreCase(productName).ifPresent(product -> {

                if (needsImage) {

                    item.setImageUrl(firstNonBlank(item.getImageUrl(), product.getImageUrl()));

                }

                if (needsColor) {

                    item.setColor(firstNonBlank(item.getColor(), product.getColor()));

                }

            });

        }

    }



    private OrderEmailContext buildContext(Order order, List<OrderRequest.OrderItemDTO> items) {

        OrderRequest.OrderItemDTO primary = primaryItem(items, order);

        WatchEmailTheme.Theme theme = WatchEmailTheme.forColor(primary != null ? primary.getColor() : null);



        String primaryName = primary != null ? safe(primary.getName()) : fallbackItemName(order);

        String primaryPrice = primary != null ? formatItemPrice(primary.getPrice()) : formatPrice(order.getTotalPrice());

        String primaryColor = primary != null ? safe(primary.getColor()) : "";

        String primaryImageSource = resolvePrimaryImageSource(primary, order);

        String primaryImage = primaryImageSource.isBlank() ? "" : absoluteImageUrl(primaryImageSource);



        if (primaryImage.isBlank()) {

            log.warn("No watch image for order {}", order.getId());

        }



        return new OrderEmailContext(primaryName, primaryPrice, primaryColor, primaryImageSource, primaryImage, theme, buildItemsSummary(items, order));

    }



    private String resolvePrimaryImageSource(OrderRequest.OrderItemDTO primary, Order order) {

        if (primary != null && primary.getImageUrl() != null && !primary.getImageUrl().isBlank()) {

            return primary.getImageUrl().trim();

        }



        String productName = stripQuantitySuffix(primary != null ? primary.getName() : fallbackItemName(order));

        return productRepository.findFirstByNameIgnoreCase(productName)

                .map(Product::getImageUrl)

                .map(String::trim)

                .orElse("");

    }



    private OrderRequest.OrderItemDTO primaryItem(List<OrderRequest.OrderItemDTO> items, Order order) {

        if (items != null) {

            for (OrderRequest.OrderItemDTO item : items) {

                if (item != null && item.getName() != null && !item.getName().isBlank()) {

                    return item;

                }

            }

        }

        return null;

    }



    private String buildItemsSummary(List<OrderRequest.OrderItemDTO> items, Order order) {

        StringBuilder summary = new StringBuilder();

        if (items != null && !items.isEmpty()) {

            for (OrderRequest.OrderItemDTO item : items) {

                if (item == null) {

                    continue;

                }

                if (!summary.isEmpty()) {

                    summary.append("\n");

                }

                summary.append(safe(item.getName()))

                        .append(" - ")

                        .append(formatItemPrice(item.getPrice()))

                        .append(" €");

            }

            return summary.toString();

        }



        if (order.getItems() != null) {

            for (var item : order.getItems()) {

                if (!summary.isEmpty()) {

                    summary.append("\n");

                }

                summary.append(safe(item.getProductName()))

                        .append(" - ")

                        .append(safe(item.getProductPrice()))

                        .append(" €");

            }

        }

        return summary.toString();

    }



    private String fallbackItemName(Order order) {

        if (order.getItems() == null || order.getItems().isEmpty()) {

            return "Watch";

        }

        return safe(order.getItems().get(0).getProductName());

    }



    private String absoluteImageUrl(String path) {

        if (path == null || path.isBlank()) {

            return "";

        }



        String base = resolveImageBaseUrl();

        String raw = path.trim();



        if (raw.startsWith("http://") || raw.startsWith("https://")) {

            return replaceLocalhostBase(raw, base);

        }



        String normalizedBase = base.endsWith("/") ? base.substring(0, base.length() - 1) : base;

        String relative = raw.startsWith("/") ? raw : "/" + raw;

        return encodeUrl(normalizedBase + relative);

    }



    private String replaceLocalhostBase(String url, String publicBase) {

        if (publicBase == null || publicBase.isBlank()) {

            return encodeUrl(url);

        }

        if (!url.contains("localhost") && !url.contains("127.0.0.1")) {

            return encodeUrl(url);

        }

        if (publicBase.contains("localhost") || publicBase.contains("127.0.0.1")) {

            return encodeUrl(url);

        }



        try {

            int pathStart = url.indexOf('/', url.indexOf("://") + 3);

            if (pathStart < 0) {

                return encodeUrl(url);

            }

            String path = url.substring(pathStart);

            String normalizedBase = publicBase.endsWith("/") ? publicBase.substring(0, publicBase.length() - 1) : publicBase;

            return encodeUrl(normalizedBase + path);

        } catch (Exception ex) {

            return encodeUrl(url);

        }

    }



    private String resolveImageBaseUrl() {

        if (emailImageBaseUrl != null && !emailImageBaseUrl.isBlank()

                && !emailImageBaseUrl.contains("localhost") && !emailImageBaseUrl.contains("127.0.0.1")) {

            return emailImageBaseUrl;

        }



        String requestBase = currentRequestBaseUrl();

        if (requestBase != null && !requestBase.contains("localhost") && !requestBase.contains("127.0.0.1")) {

            return requestBase;

        }



        return emailImageBaseUrl != null && !emailImageBaseUrl.isBlank() ? emailImageBaseUrl : siteBaseUrl;

    }



    private String currentRequestBaseUrl() {

        try {

            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

            if (attrs == null) {

                return null;

            }

            HttpServletRequest request = attrs.getRequest();

            String scheme = request.getScheme();

            String host = request.getServerName();

            int port = request.getServerPort();

            boolean defaultPort = ("http".equals(scheme) && port == 80) || ("https".equals(scheme) && port == 443);

            return defaultPort ? scheme + "://" + host : scheme + "://" + host + ":" + port;

        } catch (Exception ex) {

            return null;

        }

    }



    private String encodeUrl(String url) {

        try {

            int queryIndex = url.indexOf('?');

            String base = queryIndex >= 0 ? url.substring(0, queryIndex) : url;

            String query = queryIndex >= 0 ? url.substring(queryIndex) : "";



            int schemeEnd = base.indexOf("://");

            if (schemeEnd < 0) {

                return url;

            }



            int pathStart = base.indexOf('/', schemeEnd + 3);

            if (pathStart < 0) {

                return base + query;

            }



            String prefix = base.substring(0, pathStart);

            String[] segments = base.substring(pathStart).split("/");

            StringBuilder encoded = new StringBuilder(prefix);

            for (String segment : segments) {

                if (segment.isEmpty()) {

                    continue;

                }

                encoded.append('/')

                        .append(URLEncoder.encode(segment, StandardCharsets.UTF_8).replace("+", "%20"));

            }

            return encoded + query;

        } catch (Exception ex) {

            return url.replace(" ", "%20");

        }

    }



    private String stripQuantitySuffix(String name) {

        if (name == null) {

            return "";

        }

        return name.replaceAll("\\s*\\(x\\d+\\)\\s*$", "").trim();

    }



    private String firstNonBlank(String... values) {

        for (String value : values) {

            if (value != null && !value.isBlank()) {

                return value.trim();

            }

        }

        return "";

    }



    private String formatOrderDate(Order order) {

        LocalDateTime date = order.getOrderDate() != null ? order.getOrderDate() : LocalDateTime.now();

        return date.format(ORDER_DATE);

    }



    private String formatPrice(Double value) {

        if (value == null) {

            return "0";

        }

        if (Math.rint(value) == value) {

            return String.format(Locale.US, "%.0f", value);

        }

        return String.format(Locale.US, "%.2f", value);

    }



    private String formatItemPrice(String value) {

        if (value == null || value.isBlank()) {

            return "0";

        }

        try {

            return formatPrice(Double.parseDouble(value.replace(",", ".").trim()));

        } catch (NumberFormatException ex) {

            return value.trim();

        }

    }



    private String safe(String value) {

        return value == null ? "" : value.trim();

    }



    private record OrderEmailContext(

            String primaryName,

            String primaryPrice,

            String primaryColor,

            String primaryImageSource,

            String primaryImageUrl,

            WatchEmailTheme.Theme theme,

            String itemsSummary

    ) {

    }

}


