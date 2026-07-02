# Oracle Cloud Always Free — Deluxe Watches VM

Deploy the Spring Boot app on an **Always Free** Ampere A1 compute instance (no paid resources).

## 1. Create the VM (Oracle Cloud Console)

1. Sign in at [cloud.oracle.com](https://cloud.oracle.com) (Always Free account).
2. **Compute → Instances → Create instance**.
3. **Name:** `deluxe-watches`
4. **Image:** Ubuntu 22.04 (aarch64 for ARM, or x86 if no ARM capacity).
5. **Shape:** `VM.Standard.A1.Flex` (Always Free eligible)
   - **OCPUs:** 1 (minimum; up to 4 total free across your account)
   - **Memory:** 6 GB (or less if sharing free quota)
6. **Networking:** use default VCN; ensure **Assign a public IPv4 address** is checked.
7. **SSH keys:** paste your **public** key (`~/.ssh/id_ed25519.pub` or `id_rsa.pub`).
   - Generate on Windows: `ssh-keygen -t ed25519 -C "oci-deluxe"`
8. Click **Create**. Note the **Public IP** when the instance is running.

## 2. Open ports (Security List)

1. **Networking → Virtual cloud networks →** your VCN → **Security Lists →** default.
2. **Add Ingress Rules:**

| Source CIDR | Protocol | Destination port | Description |
|-------------|----------|------------------|-------------|
| `0.0.0.0/0` | TCP | 22 | SSH |
| `0.0.0.0/0` | TCP | 8080 | Deluxe Watches app |

## 3. SSH into the VM

```bash
ssh ubuntu@YOUR_PUBLIC_IP
```

(Replace `ubuntu` with `opc` if you chose Oracle Linux instead of Ubuntu.)

## 4. Upload secrets (`.env`)

On your **local machine**, from the repo root (file must not be committed):

```bash
scp .env ubuntu@YOUR_PUBLIC_IP:~/deluxe-watches/.env
```

Or on the VM, create `.env` from the template:

```bash
git clone https://github.com/Ardihysenii/Deluxe-Watches-Platform.git ~/deluxe-watches
cp ~/deluxe-watches/deploy/oracle-cloud/env.template ~/deluxe-watches/.env
nano ~/deluxe-watches/.env   # fill Neon + EmailJS values
```

## 5. Run deploy script

```bash
cd ~/deluxe-watches
bash deploy/oracle-cloud/deploy.sh
```

The script installs Docker, pulls `main`, sets `DELUXE_SITE_BASE_URL` / `DELUXE_EMAIL_IMAGE_BASE_URL` from the VM public IP, builds the Dockerfile, and starts the app on port **8080**.

## 6. Verify

Open in a browser:

```
http://YOUR_PUBLIC_IP:8080
```

Check logs:

```bash
cd ~/deluxe-watches
docker compose -f docker-compose.prod.yml logs -f
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| **Out of capacity (ARM)** | Retry later, another AD, or use Always Free AMD micro shape (slower build). |
| **Connection refused on :8080** | Confirm security list rule; `sudo ss -tlnp \| grep 8080`; check container logs. |
| **DB connection errors** | Verify Neon URL/user/password in `.env`; Neon project must allow external connections. |
| **Email images broken** | Ensure `DELUXE_EMAIL_IMAGE_BASE_URL` matches public `http://IP:8080` (not localhost). |

## Cost

Stay within [Always Free limits](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier.htm): A1 Flex within quota, block storage ≤ 200 GB total, no paid SKUs selected when creating resources.
