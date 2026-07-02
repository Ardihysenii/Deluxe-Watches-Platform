package com.alfa.accessories.config;

import com.alfa.accessories.entities.Product;
import com.alfa.accessories.repository.ProductRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Component
@ConditionalOnProperty(name = "alfa.image-path-migration.enabled", havingValue = "true", matchIfMissing = true)
public class ImagePathMigration {

    private static final Map<String, String[]> PRODUCT_IMAGES = Map.ofEntries(
            Map.entry("Patek Philippe", family1()),
            Map.entry("Silver Moon Edition", family1()),
            Map.entry("Audemars Piguet", goldHeroFamily()),
            Map.entry("Baume Custom Timepiece", family3()),
            Map.entry("Elegant Chronograph 42mm", family4()),
            Map.entry("Dark Night Chrono", family4()),
            Map.entry("Richard Mille", family4()),
            Map.entry("Jaeger-LeCoultre", family5()),
            Map.entry("Garmin Fenix 7S", family5()),
            Map.entry("Coros Pace Pro", family5()),
            Map.entry("Midnight Silver Heritage", family6()),
            Map.entry("Baume Custom Timepiece Small Second", family6())
    );

    private static String[] family1() {
        return new String[]{
                "/img/unnamed (1)-nobg.png",
                "/img/unamed (1.2)-nobg.png",
                "/img/unnamed (1.3)-nobg.png"
        };
    }

    private static String[] goldHeroFamily() {
        return new String[]{
                "/img/gold-watch-hero-nobg.png",
                "/img/unamed (3.2)-nobg.png",
                "/img/unnamed (3.3)-nobg.png"
        };
    }

    private static String[] family3() {
        return new String[]{
                "/img/unnamed (3)-nobg.png",
                "/img/unamed (3.2)-nobg.png",
                "/img/unnamed (3.3)-nobg.png"
        };
    }

    private static String[] family4() {
        return new String[]{
                "/img/unnamed (4)-nobg.png",
                "/img/unamed (4.2)-nobg.png",
                "/img/unnamed (4.3)-nobg.png"
        };
    }

    private static String[] family5() {
        return new String[]{
                "/img/unnamed (5)-nobg.png",
                "/img/unnamed (5.2)-nobg.png",
                "/img/unnamed (5.3)-nobg.png"
        };
    }

    private static String[] family6() {
        return new String[]{
                "/img/unnamed (6)-nobg.png",
                "/img/unnamed (6.2)-nobg.png",
                "/img/unnamed (6.3)-nobg.png"
        };
    }

    private final ProductRepository productRepository;

    public ImagePathMigration(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void fixImagePaths() {
        for (Product product : productRepository.findAll()) {
            String[] paths = PRODUCT_IMAGES.get(product.getName());
            if (paths == null) {
                continue;
            }

            boolean changed = false;
            if (!paths[0].equals(product.getImageUrl())) {
                product.setImageUrl(paths[0]);
                changed = true;
            }
            if (!paths[1].equals(product.getImageUrl2())) {
                product.setImageUrl2(paths[1]);
                changed = true;
            }
            if (!paths[2].equals(product.getImageUrl3())) {
                product.setImageUrl3(paths[2]);
                changed = true;
            }

            if (changed) {
                productRepository.save(product);
            }
        }
    }
}
