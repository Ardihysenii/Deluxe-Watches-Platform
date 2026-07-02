#!/usr/bin/env bash
# Deluxe Watches — deploy on Oracle Cloud Always Free Ubuntu VM (ARM/x86).
# Usage: bash deploy/oracle-cloud/deploy.sh
# Prerequisite: .env in repo root with Neon + EmailJS secrets (see env.template).

set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/Ardihysenii/Deluxe-Watches-Platform.git}"
BRANCH="${BRANCH:-main}"
APP_DIR="${APP_DIR:-$HOME/deluxe-watches}"
ENV_FILE="$APP_DIR/.env"
COMPOSE_FILE="docker-compose.prod.yml"
CONTAINER_NAME="deluxe-watches"

log() { echo "[deploy] $*"; }
die() { echo "[deploy] ERROR: $*" >&2; exit 1; }

detect_public_ip() {
  curl -fsS --max-time 5 https://ifconfig.me/ip 2>/dev/null \
    || curl -fsS --max-time 5 https://api.ipify.org 2>/dev/null \
    || true
}

install_docker() {
  if command -v docker >/dev/null 2>&1; then
    log "Docker already installed: $(docker --version)"
    return
  fi

  log "Installing Docker..."
  sudo apt-get update -qq
  sudo apt-get install -y ca-certificates curl gnupg
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  sudo chmod a+r /etc/apt/keyrings/docker.gpg

  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null

  sudo apt-get update -qq
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  sudo usermod -aG docker "$USER" || true
  log "Docker installed. If 'docker' fails, log out/in or run: newgrp docker"
}

clone_or_update() {
  if [[ -d "$APP_DIR/.git" ]]; then
    log "Updating repo at $APP_DIR"
    git -C "$APP_DIR" fetch origin
    git -C "$APP_DIR" checkout "$BRANCH"
    git -C "$APP_DIR" pull origin "$BRANCH"
  else
    log "Cloning $REPO_URL ($BRANCH) into $APP_DIR"
    git clone --branch "$BRANCH" --depth 1 "$REPO_URL" "$APP_DIR"
  fi
}

ensure_env_file() {
  if [[ -f "$ENV_FILE" ]]; then
    log "Using existing $ENV_FILE"
    return
  fi

  if [[ -f "$APP_DIR/deploy/oracle-cloud/env.template" ]]; then
    cp "$APP_DIR/deploy/oracle-cloud/env.template" "$ENV_FILE"
    log "Created $ENV_FILE from template — edit secrets before continuing."
  fi

  die "Missing $ENV_FILE. Copy deploy/oracle-cloud/env.template to .env, fill Neon/EmailJS values, then re-run."
}

set_site_urls_from_public_ip() {
  local ip base_url
  ip="$(detect_public_ip)"
  [[ -n "$ip" ]] || die "Could not detect public IP. Set DELUXE_SITE_BASE_URL manually in .env"

  base_url="http://${ip}:8080"
  log "Public URL: $base_url"

  if grep -q '^DELUXE_SITE_BASE_URL=' "$ENV_FILE"; then
    sed -i "s|^DELUXE_SITE_BASE_URL=.*|DELUXE_SITE_BASE_URL=${base_url}|" "$ENV_FILE"
  else
    echo "DELUXE_SITE_BASE_URL=${base_url}" >>"$ENV_FILE"
  fi

  if grep -q '^DELUXE_EMAIL_IMAGE_BASE_URL=' "$ENV_FILE"; then
    sed -i "s|^DELUXE_EMAIL_IMAGE_BASE_URL=.*|DELUXE_EMAIL_IMAGE_BASE_URL=${base_url}|" "$ENV_FILE"
  else
    echo "DELUXE_EMAIL_IMAGE_BASE_URL=${base_url}" >>"$ENV_FILE"
  fi
}

deploy_container() {
  cd "$APP_DIR"

  log "Building and starting container..."
  docker compose -f "$COMPOSE_FILE" down 2>/dev/null || true
  docker compose -f "$COMPOSE_FILE" up -d --build

  log "Waiting for app on :8080..."
  for i in $(seq 1 30); do
    if curl -fsS --max-time 3 "http://127.0.0.1:8080/" >/dev/null 2>&1; then
      log "App is responding on localhost:8080"
      return 0
    fi
    sleep 5
  done

  log "Container started but HTTP check timed out. Logs:"
  docker compose -f "$COMPOSE_FILE" logs --tail=50
  return 1
}

main() {
  install_docker
  clone_or_update
  ensure_env_file
  set_site_urls_from_public_ip
  deploy_container

  ip="$(detect_public_ip)"
  echo ""
  echo "=========================================="
  echo " Deploy complete"
  echo " Site:  http://${ip}:8080"
  echo " Logs:  cd $APP_DIR && docker compose -f $COMPOSE_FILE logs -f"
  echo " Stop:  cd $APP_DIR && docker compose -f $COMPOSE_FILE down"
  echo "=========================================="
}

main "$@"
