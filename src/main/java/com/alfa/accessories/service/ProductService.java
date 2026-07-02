package com.alfa.accessories.service;

import com.alfa.accessories.entities.Product;
import com.alfa.accessories.repository.ProductRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private static final int SEARCH_RESULT_LIMIT = 24;
    private static final int FALLBACK_RESULT_LIMIT = 12;

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> smartSearch(String query) {
        if (query == null || query.trim().length() < 2) {
            return List.of();
        }

        String normalizedQuery = query.toLowerCase(Locale.ROOT).trim();
        List<String> searchWords = extractSearchWords(normalizedQuery);
        if (searchWords.isEmpty()) {
            return List.of();
        }

        List<Product> catalog = excludeAudemarsPiguet(dedupeById(getAllProducts()));
        if (catalog.isEmpty()) {
            return List.of();
        }

        List<Product> strictMatches = findMatches(searchWords, true);
        if (!strictMatches.isEmpty()) {
            return limitResults(rankProducts(strictMatches, searchWords, normalizedQuery));
        }

        List<Product> relaxedMatches = findMatches(searchWords, false);
        if (!relaxedMatches.isEmpty()) {
            return limitResults(rankProducts(relaxedMatches, searchWords, normalizedQuery));
        }

        List<Product> ranked = rankProducts(catalog, searchWords, normalizedQuery);
        List<Product> relevant = ranked.stream()
                .filter(product -> scoreProduct(product, searchWords, normalizedQuery) > 0)
                .collect(Collectors.toList());

        if (!relevant.isEmpty()) {
            return limitResults(relevant);
        }

        return defaultFallbackProducts(catalog);
    }

    private List<Product> findMatches(List<String> searchWords, boolean requireAllWords) {
        List<Product> results = productRepository.findAll((Specification<Product>) (root, criteriaQuery, cb) -> {
            criteriaQuery.distinct(true);
            List<Predicate> wordPredicates = new ArrayList<>();

            for (String word : searchWords) {
                Predicate wordPredicate = cb.or(
                        cb.like(cb.lower(root.get("name")), "%" + word + "%"),
                        cb.like(cb.lower(root.get("color")), "%" + word + "%"),
                        cb.like(cb.lower(root.get("searchTags")), "%" + word + "%"),
                        cb.like(cb.lower(root.get("description")), "%" + word + "%"),
                        cb.like(cb.lower(root.get("category")), "%" + word + "%"),
                        cb.like(cb.lower(root.get("material")), "%" + word + "%")
                );
                wordPredicates.add(wordPredicate);
            }

            if (requireAllWords) {
                return cb.and(wordPredicates.toArray(new Predicate[0]));
            }
            return cb.or(wordPredicates.toArray(new Predicate[0]));
        });

        return excludeAudemarsPiguet(dedupeById(results));
    }

    private List<Product> rankProducts(List<Product> products, List<String> searchWords, String fullQuery) {
        return products.stream()
                .sorted(Comparator
                        .comparingInt((Product product) -> scoreProduct(product, searchWords, fullQuery)).reversed()
                        .thenComparing(Product::getName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)))
                .collect(Collectors.toList());
    }

    private int scoreProduct(Product product, List<String> searchWords, String fullQuery) {
        String haystack = buildSearchHaystack(product);
        String name = safeLower(product.getName());
        int score = 0;

        if (fullQuery.length() >= 2 && haystack.contains(fullQuery)) {
            score += 50;
        }
        if (name.contains(fullQuery)) {
            score += 30;
        }

        for (String word : searchWords) {
            if (haystack.contains(word)) {
                score += 14;
            }
            if (name.contains(word)) {
                score += 10;
            }

            for (String token : haystack.split("[\\s,.;/|+\\-]+")) {
                if (token.length() < 2) {
                    continue;
                }
                if (token.equals(word)) {
                    score += 8;
                } else if (token.startsWith(word) || word.startsWith(token)) {
                    score += 6;
                } else if (token.contains(word) || word.contains(token)) {
                    score += 4;
                } else if (isNearMatch(token, word)) {
                    score += 3;
                }
            }
        }

        return score;
    }

    private boolean isNearMatch(String token, String word) {
        if (token.length() < 3 || word.length() < 3) {
            return false;
        }
        int maxLen = Math.max(token.length(), word.length());
        int distance = levenshteinDistance(token, word);
        return distance <= (maxLen <= 5 ? 1 : 2);
    }

    private int levenshteinDistance(String a, String b) {
        int[][] dp = new int[a.length() + 1][b.length() + 1];
        for (int i = 0; i <= a.length(); i++) {
            dp[i][0] = i;
        }
        for (int j = 0; j <= b.length(); j++) {
            dp[0][j] = j;
        }
        for (int i = 1; i <= a.length(); i++) {
            for (int j = 1; j <= b.length(); j++) {
                int cost = a.charAt(i - 1) == b.charAt(j - 1) ? 0 : 1;
                dp[i][j] = Math.min(
                        Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                        dp[i - 1][j - 1] + cost
                );
            }
        }
        return dp[a.length()][b.length()];
    }

    private String buildSearchHaystack(Product product) {
        return String.join(" ",
                safeLower(product.getName()),
                safeLower(product.getDescription()),
                safeLower(product.getColor()),
                safeLower(product.getCategory()),
                safeLower(product.getMaterial()),
                safeLower(product.getSearchTags())
        ).trim();
    }

    private List<String> extractSearchWords(String query) {
        List<String> searchWords = new ArrayList<>();
        for (String word : query.split("\\s+")) {
            if (word.length() >= 2) {
                searchWords.add(word);
            }
        }
        return searchWords;
    }

    private List<Product> defaultFallbackProducts(List<Product> catalog) {
        return catalog.stream()
                .sorted(Comparator.comparing(Product::getId, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(FALLBACK_RESULT_LIMIT)
                .collect(Collectors.toList());
    }

    private List<Product> limitResults(List<Product> products) {
        return products.stream().limit(SEARCH_RESULT_LIMIT).collect(Collectors.toList());
    }

    private String safeLower(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT);
    }

    private List<Product> dedupeById(List<Product> products) {
        Map<Long, Product> unique = new LinkedHashMap<>();
        for (Product product : products) {
            if (product.getId() != null) {
                unique.putIfAbsent(product.getId(), product);
            }
        }
        return new ArrayList<>(unique.values());
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id).orElse(null);
    }

    public List<Product> getRelatedProducts(String category, Long currentProductId) {
        return productRepository.findTop3ByCategoryAndIdNot(category, currentProductId);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getFeaturedProducts() {
        return productRepository.findTop3ByOrderByIdDesc();
    }

    public List<Product> listForCollection(String query, String sort) {
        List<Product> products = (query != null && !query.trim().isEmpty())
                ? smartSearch(query)
                : getAllProducts();

        if (products == null || products.isEmpty()) {
            return products != null ? products : List.of();
        }

        return sortCollectionProducts(excludeAudemarsPiguet(dedupeById(products)), sort);
    }

    public List<Product> getFeaturedProductsForDisplay() {
        return excludeAudemarsPiguet(getFeaturedProducts());
    }

    private List<Product> excludeAudemarsPiguet(List<Product> products) {
        return products.stream()
                .filter(p -> !"Audemars Piguet".equals(p.getName()))
                .filter(p -> p.getImageUrl() == null || !p.getImageUrl().contains("Audemars-Piguet"))
                .collect(Collectors.toList());
    }

    private List<Product> sortCollectionProducts(List<Product> products, String sort) {
        List<Product> sorted = new ArrayList<>(products);

        switch (sort) {
            case "priceLow":
                sorted.sort(Comparator.comparing(Product::getPrice, Comparator.nullsLast(Double::compareTo)));
                break;
            case "priceHigh":
                sorted.sort(Comparator.comparing(Product::getPrice, Comparator.nullsLast(Double::compareTo)).reversed());
                break;
            case "name":
                sorted.sort(Comparator.comparing(Product::getName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)));
                break;
            case "newest":
            default:
                sorted.sort(Comparator.comparing(Product::getId, Comparator.nullsLast(Comparator.reverseOrder())));
                break;
        }

        return sorted;
    }
}
