const fs = require('fs');
const path = require('path');
const { PDFLoader } = require('langchain/document_loaders/fs/pdf');
const { HNSWLib } = require('langchain/vectorstores/hnswlib');
const { OpenAIEmbeddings } = require('langchain/embeddings/openai');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Check if OpenAI API key is available
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set in .env.local file');
  process.exit(1);
}

// Paths
const dataDir = path.join(__dirname, '../data');
const pdfDir = path.join(dataDir, 'pdf');
const vectorDbDir = path.join(dataDir, 'vectordb');

// Create vector DB directory if it doesn't exist
if (!fs.existsSync(vectorDbDir)) {
  fs.mkdirSync(vectorDbDir);
}

async function createVectorDb() {
  console.log('Creating vector database from PDF files...');
  
  // Get all PDF files
  const pdfFiles = fs.readdirSync(pdfDir).filter(file => file.endsWith('.pdf'));
  
  if (pdfFiles.length === 0) {
    console.error('No PDF files found in the data/pdf directory');
    return;
  }
  
  // Initialize OpenAI embeddings
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });
  
  // Load and process each PDF
  let allDocs = [];
  
  for (const pdfFile of pdfFiles) {
    const pdfPath = path.join(pdfDir, pdfFile);
    console.log(`Processing ${pdfPath}...`);
    
    try {
      // Load PDF
      const loader = new PDFLoader(pdfPath);
      const docs = await loader.load();
      
      // Add metadata to identify the source
      const enhancedDocs = docs.map(doc => {
        doc.metadata.source = pdfFile;
        return doc;
      });
      
      // Split text into chunks
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      
      const splitDocs = await textSplitter.splitDocuments(enhancedDocs);
      allDocs = [...allDocs, ...splitDocs];
      
      console.log(`Added ${splitDocs.length} chunks from ${pdfFile}`);
    } catch (error) {
      console.error(`Error processing ${pdfFile}:`, error);
    }
  }
  
  if (allDocs.length === 0) {
    console.error('No documents were extracted from the PDFs');
    return;
  }
  
  console.log(`Creating vector store with ${allDocs.length} total chunks...`);
  
  // Create and save the vector store
  const vectorStore = await HNSWLib.fromDocuments(allDocs, embeddings);
  await vectorStore.save(vectorDbDir);
  
  console.log(`Vector database successfully created and saved to ${vectorDbDir}`);
}

// Run the function
createVectorDb().catch(console.error); 