const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

// URLs to scrape
const URLS = [
  {
    url: 'https://www.vodafone.com.tr/kampanyalar',
    filename: 'vodafone_kampanyalar.pdf',
    title: 'Vodafone Kampanyalar'
  },
  {
    url: 'https://www.vodafone.com.tr/tarifeler/faturali-tarifeler',
    filename: 'vodafone_faturali_tarifeler.pdf',
    title: 'Vodafone Faturalı Tarifeler'
  },
  {
    url: 'https://www.vodafone.com.tr/tarifeler/faturasiz-kolay-paketler',
    filename: 'vodafone_faturasiz_tarifeler.pdf',
    title: 'Vodafone Faturasız Kolay Paketler'
  }
];

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '../data');
const pdfDir = path.join(dataDir, 'pdf');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir);
}

async function scrapeWebsites() {
  console.log('Starting to scrape websites...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  for (const site of URLS) {
    try {
      console.log(`Scraping ${site.url}...`);
      
      const page = await browser.newPage();
      await page.goto(site.url, { waitUntil: 'networkidle2', timeout: 60000 });
      
      // Wait for content to load
      await page.waitForSelector('body', { timeout: 10000 });
      
      // Generate PDF
      const pdfPath = path.join(pdfDir, site.filename);
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });
      
      console.log(`PDF saved to ${pdfPath}`);
      
      // Also extract text content for easier processing
      const content = await page.evaluate(() => {
        return document.body.innerText;
      });
      
      const textPath = path.join(dataDir, site.filename.replace('.pdf', '.txt'));
      fs.writeFileSync(textPath, content);
      console.log(`Text content saved to ${textPath}`);
      
      await page.close();
    } catch (error) {
      console.error(`Error scraping ${site.url}:`, error);
    }
  }
  
  await browser.close();
  console.log('Scraping completed!');
}

// Run the scraper
scrapeWebsites().catch(console.error); 