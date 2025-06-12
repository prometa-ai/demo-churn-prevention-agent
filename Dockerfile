FROM node:20-alpine AS builder

ARG GCP_PROJECT_ID=default_gcp_project_id
ENV GCP_PROJECT_ID=$GCP_PROJECT_ID

ARG SECRET_MANAGER_KEY=default_secret_manager_key
ENV SECRET_MANAGER_KEY=$SECRET_MANAGER_KEY

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs \
    yarn \
    python3 \
    py3-pip \
    python3-dev \
    make \
    g++ \
    gcc

RUN npm install -g npm@11

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

COPY package*.json ./

RUN npm cache clean --force && \
    npm install --no-audit --no-fund --legacy-peer-deps

COPY . .

RUN npm run build

FROM node:20-alpine AS runner

ARG GCP_PROJECT_ID=default_gcp_project_id
ENV GCP_PROJECT_ID=$GCP_PROJECT_ID

ARG SECRET_MANAGER_KEY=default_secret_manager_key
ENV SECRET_MANAGER_KEY=$SECRET_MANAGER_KEY

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"] 
