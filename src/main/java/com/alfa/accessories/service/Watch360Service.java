package com.alfa.accessories.service;

import com.alfa.accessories.entities.Product;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class Watch360Service {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("png", "jpg", "jpeg", "webp");

    private static final Map<String, String> PRODUCT_FAMILY_FOLDER = Map.ofEntries(
            Map.entry("Patek Philippe", "family1"),
            Map.entry("Silver Moon Edition", "family1"),
            Map.entry("Audemars Piguet", "gold"),
            Map.entry("Baume Custom Timepiece", "family3"),
            Map.entry("Elegant Chronograph 42mm", "family4"),
            Map.entry("Dark Night Chrono", "family4"),
            Map.entry("Richard Mille", "family4"),
            Map.entry("Jaeger-LeCoultre", "family5"),
            Map.entry("Garmin Fenix 7S", "family5"),
            Map.entry("Coros Pace Pro", "family5"),
            Map.entry("Midnight Silver Heritage", "family6"),
            Map.entry("Baume Custom Timepiece Small Second", "family6")
    );

    private final ResourcePatternResolver resourceResolver = new PathMatchingResourcePatternResolver();

    public List<String> getSpinFrames(Product product) {
        if (product == null || product.getId() == null) {
            return List.of();
        }

        List<String> byProductId = loadFrames("360/product-" + product.getId());
        if (!byProductId.isEmpty()) {
            return byProductId;
        }

        String family = PRODUCT_FAMILY_FOLDER.get(product.getName());
        if (family != null) {
            List<String> byFamily = loadFrames("360/" + family);
            if (!byFamily.isEmpty()) {
                return byFamily;
            }
        }

        return fallbackFromProductImages(product);
    }

    public boolean hasSpin(Product product) {
        return getSpinFrames(product).size() >= 2;
    }

    private List<String> fallbackFromProductImages(Product product) {
        List<String> frames = new ArrayList<>();
        addUnique(frames, product.getImageUrl());
        addUnique(frames, product.getImageUrl2());
        addUnique(frames, product.getImageUrl3());
        return frames.size() >= 2 ? frames : List.of();
    }

    private void addUnique(List<String> frames, String url) {
        if (url == null || url.isBlank()) {
            return;
        }
        String trimmed = url.trim();
        if (!frames.contains(trimmed)) {
            frames.add(trimmed);
        }
    }

    private List<String> loadFrames(String folder) {
        try {
            Resource[] resources = resourceResolver.getResources(
                    "classpath:/static/img/" + folder + "/*.*"
            );

            return Arrays.stream(resources)
                    .filter(Resource::isReadable)
                    .filter(resource -> {
                        String name = resource.getFilename();
                        if (name == null) {
                            return false;
                        }
                        int dot = name.lastIndexOf('.');
                        if (dot < 0) {
                            return false;
                        }
                        return ALLOWED_EXTENSIONS.contains(name.substring(dot + 1).toLowerCase(Locale.ROOT));
                    })
                    .sorted(Comparator.comparing(resource -> resource.getFilename(), String.CASE_INSENSITIVE_ORDER))
                    .map(resource -> "/img/" + folder + "/" + resource.getFilename())
                    .toList();
        } catch (IOException ex) {
            return List.of();
        }
    }
}
