#!/bin/bash

# Renklendirme için ANSI renk kodları
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Vodafone Kampanyaları ve Tarifeleri için RAG Sistemi Kurulumu${NC}"
echo -e "${YELLOW}=======================================================${NC}"

# Bağımlılıkları yükleme
echo -e "\n${GREEN}1. Bağımlılıklar yükleniyor...${NC}"
npm install

# Dizinleri oluşturma
echo -e "\n${GREEN}2. Gerekli dizinler oluşturuluyor...${NC}"
mkdir -p data/pdf
mkdir -p data/vectordb

# .env.local dosyasını kontrol etme
echo -e "\n${GREEN}3. .env.local dosyası kontrol ediliyor...${NC}"
if [ ! -f .env.local ]; then
  echo -e "${YELLOW}   .env.local dosyası bulunamadı. Oluşturuluyor...${NC}"
  echo "CHURN_PREVENTION_OPENAI_API_KEY=your_openai_api_key_here" > .env.local
  echo -e "${RED}   Lütfen .env.local dosyasını düzenleyerek OpenAI API anahtarınızı ekleyin.${NC}"
else
  echo -e "${GREEN}   .env.local dosyası mevcut.${NC}"
fi

# Kampanya verilerini çekme
echo -e "\n${GREEN}4. Vodafone kampanya ve tarife verileri çekiliyor...${NC}"
echo -e "${YELLOW}   Bu işlem birkaç dakika sürebilir...${NC}"
node scripts/fetch_campaign_data.js

# Vektör veritabanı oluşturma
echo -e "\n${GREEN}5. Vektör veritabanı oluşturuluyor...${NC}"
echo -e "${YELLOW}   Bu işlem birkaç dakika sürebilir...${NC}"
node scripts/create_vector_db.js

echo -e "\n${GREEN}Kurulum tamamlandı!${NC}"
echo -e "${YELLOW}Uygulamayı başlatmak için: npm run dev${NC}"
echo -e "${YELLOW}Tarayıcınızda http://localhost:3000 adresini ziyaret edin.${NC}" 