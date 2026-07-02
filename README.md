# Deluxe Watches Platform

Spring Boot e-commerce site for Deluxe watches (catalog, cart, checkout, EmailJS order emails, Neon PostgreSQL).

## Run locally

```bash
cp .env.example .env
# Fill in Neon + EmailJS keys in .env
./mvnw spring-boot:run
```

Open http://localhost:8080

## Deploy on Northflank

1. Push this repo to GitHub (`main` branch).
2. In [Northflank](https://app.northflank.com), create a **Combined service**.
3. Connect GitHub repo `Ardihysenii/Deluxe-Watches-Platform`, branch `main`.
4. Build type: **Dockerfile** (root `/Dockerfile`).
5. **Public port**: HTTP **8080**, publicly expose.
6. Add environment variables (Secrets):

| Variable | Description |
|----------|-------------|
| `NEON_DATABASE_URL` | JDBC URL, e.g. `jdbc:postgresql://ep-xxx.neon.tech/neondb?sslmode=require` |
| `NEON_DATABASE_USER` | Neon DB user |
| `NEON_DATABASE_PASSWORD` | Neon DB password |
| `EMAILJS_SERVICE_ID` | EmailJS service ID |
| `EMAILJS_PUBLIC_KEY` | EmailJS public key |
| `EMAILJS_PRIVATE_KEY` | EmailJS private key |
| `EMAILJS_CUSTOMER_TEMPLATE_ID` | Customer thank-you template |
| `EMAILJS_ADMIN_TEMPLATE_ID` | Admin notification template |
| `DELUXE_ADMIN_EMAIL` | Admin inbox for new orders |
| `DELUXE_SITE_BASE_URL` | Public site URL, e.g. `https://your-service.northflank.app` |
| `DELUXE_EMAIL_IMAGE_BASE_URL` | Same as site URL (for email watch images) |
| `SPRING_SECURITY_PASSWORD` | Optional admin password |

7. Deploy. After first deploy, set `DELUXE_SITE_BASE_URL` and `DELUXE_EMAIL_IMAGE_BASE_URL` to your Northflank public URL and redeploy.

## Stack

- Java 21, Spring Boot 3.2
- PostgreSQL (Neon)
- Thymeleaf + static frontend
- EmailJS for order emails
