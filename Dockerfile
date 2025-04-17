# 1. Image officielle Bun (avec Node inclus)
FROM oven/bun:1.1

# 2. Installer les dépendances nécessaires à Playwright
RUN apt-get update && apt-get install -y \
  wget \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils \
  libgbm-dev \
  libxshmfence-dev \
  --no-install-recommends && rm -rf /var/lib/apt/lists/*

# 3. Créer le répertoire de travail
WORKDIR /app

# 4. Copier les fichiers
COPY . .

# 5. Installer les dépendances Bun (node_modules + bun.lockb)
RUN bun install

# 6. Installer les navigateurs Playwright
RUN bunx playwright install --with-deps

# 7. Définir la commande de démarrage
CMD ["bun", "dev"]
