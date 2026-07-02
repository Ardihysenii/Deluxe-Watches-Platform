package com.alfa.accessories.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "deluxe.emailjs")
public class EmailJsProperties {

    private boolean enabled = true;
    private String serviceId;
    private String publicKey;
    private String privateKey;
    private String customerTemplateId;
    private String adminTemplateId;
    private String adminEmail;

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getServiceId() {
        return serviceId;
    }

    public void setServiceId(String serviceId) {
        this.serviceId = serviceId;
    }

    public String getPublicKey() {
        return publicKey;
    }

    public void setPublicKey(String publicKey) {
        this.publicKey = publicKey;
    }

    public String getPrivateKey() {
        return privateKey;
    }

    public void setPrivateKey(String privateKey) {
        this.privateKey = privateKey;
    }

    public String getCustomerTemplateId() {
        return customerTemplateId;
    }

    public void setCustomerTemplateId(String customerTemplateId) {
        this.customerTemplateId = customerTemplateId;
    }

    public String getAdminTemplateId() {
        return adminTemplateId;
    }

    public void setAdminTemplateId(String adminTemplateId) {
        this.adminTemplateId = adminTemplateId;
    }

    public String getAdminEmail() {
        return adminEmail;
    }

    public void setAdminEmail(String adminEmail) {
        this.adminEmail = adminEmail;
    }

    public boolean isConfigured() {
        return enabled
                && serviceId != null && !serviceId.isBlank()
                && publicKey != null && !publicKey.isBlank()
                && privateKey != null && !privateKey.isBlank()
                && customerTemplateId != null && !customerTemplateId.isBlank()
                && adminTemplateId != null && !adminTemplateId.isBlank();
    }
}
