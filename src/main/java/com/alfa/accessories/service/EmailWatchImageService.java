package com.alfa.accessories.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;
import java.util.Locale;
import java.util.Optional;

@Service
public class EmailWatchImageService {

    public static final String ATTACHMENT_PARAM = "watch_photo";

    private static final Logger log = LoggerFactory.getLogger(EmailWatchImageService.class);

    private final RestClient restClient = RestClient.create();

    public Optional<EmbeddedWatchImage> embed(String imageReference) {
        if (imageReference == null || imageReference.isBlank()) {
            return Optional.empty();
        }

        Optional<byte[]> bytes = readLocalBytes(imageReference);
        if (bytes.isEmpty() && isHttpUrl(imageReference)) {
            bytes = fetchRemoteBytes(imageReference);
        }

        if (bytes.isEmpty()) {
            log.warn("Could not load watch image for email: {}", imageReference);
            return Optional.empty();
        }

        byte[] data = bytes.get();
        String pathHint = extractStaticPath(imageReference);
        String mime = mimeType(pathHint != null ? pathHint : imageReference);
        String dataUrl = "data:" + mime + ";base64," + Base64.getEncoder().encodeToString(data);
        log.info("Prepared embedded watch image for email ({} bytes, {})", data.length, mime);
        return Optional.of(new EmbeddedWatchImage(ATTACHMENT_PARAM, dataUrl));
    }

    private Optional<byte[]> readLocalBytes(String reference) {
        String staticPath = extractStaticPath(reference);
        if (staticPath == null) {
            return Optional.empty();
        }

        String relative = staticPath.startsWith("/") ? staticPath.substring(1) : staticPath;
        ClassPathResource classpath = new ClassPathResource("static/" + relative);
        if (classpath.exists()) {
            return readBytes(classpath);
        }

        Path[] candidates = {
                Path.of("src/main/resources/static", relative),
                Path.of(System.getProperty("user.dir", ""), "src/main/resources/static", relative)
        };
        for (Path candidate : candidates) {
            if (Files.isRegularFile(candidate)) {
                try {
                    return Optional.of(Files.readAllBytes(candidate));
                } catch (Exception ex) {
                    log.warn("Failed to read watch image file {}: {}", candidate, ex.getMessage());
                }
            }
        }

        log.warn("Watch image not found for email: static/{}", relative);
        return Optional.empty();
    }

    private Optional<byte[]> readBytes(ClassPathResource resource) {
        try (InputStream in = resource.getInputStream()) {
            return Optional.of(in.readAllBytes());
        } catch (Exception ex) {
            log.warn("Failed to read classpath watch image {}: {}", resource.getPath(), ex.getMessage());
            return Optional.empty();
        }
    }

    private Optional<byte[]> fetchRemoteBytes(String url) {
        if (url.contains("localhost") || url.contains("127.0.0.1")) {
            return readLocalBytes(url);
        }
        try {
            byte[] data = restClient.get().uri(url).retrieve().body(byte[].class);
            return data != null && data.length > 0 ? Optional.of(data) : Optional.empty();
        } catch (Exception ex) {
            log.warn("Failed to fetch remote watch image {}: {}", url, ex.getMessage());
            return Optional.empty();
        }
    }

    private String extractStaticPath(String reference) {
        String trimmed = reference.trim();
        if (trimmed.startsWith("/img/")) {
            return trimmed;
        }
        if (trimmed.startsWith("img/")) {
            return "/" + trimmed;
        }
        int index = trimmed.indexOf("/img/");
        if (index >= 0) {
            return trimmed.substring(index);
        }
        return null;
    }

    private boolean isHttpUrl(String reference) {
        return reference.startsWith("http://") || reference.startsWith("https://");
    }

    private String mimeType(String path) {
        String lower = path.toLowerCase(Locale.ROOT);
        if (lower.endsWith(".png")) {
            return "image/png";
        }
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
            return "image/jpeg";
        }
        if (lower.endsWith(".gif")) {
            return "image/gif";
        }
        if (lower.endsWith(".webp")) {
            return "image/webp";
        }
        return "image/png";
    }

    public record EmbeddedWatchImage(String attachmentParam, String dataUrl) {
    }
}
