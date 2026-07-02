package com.alfa.accessories.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class EmailJsStartupCheck implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(EmailJsStartupCheck.class);

    private final EmailJsProperties properties;
    private final String emailImageBaseUrl;

    public EmailJsStartupCheck(
            EmailJsProperties properties,
            @Value("${deluxe.email.image-base-url:http://localhost:8080}") String emailImageBaseUrl) {
        this.properties = properties;
        this.emailImageBaseUrl = emailImageBaseUrl;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (properties.isConfigured()) {
            log.info("EmailJS ready (service={}, customer template={}, admin template={})",
                    properties.getServiceId(),
                    properties.getCustomerTemplateId(),
                    properties.getAdminTemplateId());
        } else {
            log.warn("EmailJS NOT configured — order emails will fail. Add EMAILJS_PUBLIC_KEY and "
                    + "EMAILJS_PRIVATE_KEY to .env and restart.");
        }

        if (emailImageBaseUrl.contains("localhost") || emailImageBaseUrl.contains("127.0.0.1")) {
            log.warn("Email watch images use localhost ({}). Set DELUXE_EMAIL_IMAGE_BASE_URL to your public HTTPS site URL so Gmail can load images.",
                    emailImageBaseUrl);
        }
    }
}
