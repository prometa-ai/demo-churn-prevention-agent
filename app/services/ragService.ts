import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { OpenAI } from 'langchain/llms/openai';
import { RetrievalQAChain } from 'langchain/chains';
import { Customer } from '../models/Customer';
import path from 'path';
import fs from 'fs';
import { getOpenAIApiKey } from '@/src/config';

// Path to vector database
const vectorDbDir = path.join(process.cwd(), 'data', 'vectordb');

// Check if vector database exists
const vectorDbExists = fs.existsSync(vectorDbDir);

// Initialize OpenAI embeddings and model
let embeddings: OpenAIEmbeddings | null = null;
let model: OpenAI | null = null;

async function initializeOpenAI() {
  if (!embeddings || !model) {
    const apiKey = await getOpenAIApiKey();
    
    embeddings = new OpenAIEmbeddings({
      openAIApiKey: apiKey,
    });

    model = new OpenAI({
      openAIApiKey: apiKey,
      modelName: 'gpt-4o',
      temperature: 0.7,
    });
  }
  return { embeddings, model };
}

// Cache the vector store to avoid reloading it for each query
let vectorStore: HNSWLib | null = null;

/**
 * Initialize the vector store
 */
async function initVectorStore() {
  if (!vectorDbExists) {
    console.warn('Vector database not found. RAG functionality will be limited.');
    return null;
  }
  
  try {
    console.log('Loading vector database...');
    const { embeddings } = await initializeOpenAI();
    if (!embeddings) {
      throw new Error('Failed to initialize OpenAI embeddings');
    }
    return await HNSWLib.load(vectorDbDir, embeddings);
  } catch (error) {
    console.error('Error loading vector database:', error);
    return null;
  }
}

/**
 * Query the RAG system
 */
export async function queryRagSystem(message: string, customer: Customer): Promise<string> {
  try {
    // Initialize vector store if not already initialized
    if (!vectorStore) {
      vectorStore = await initVectorStore();
    }

    if (!vectorStore) {
      throw new Error('Vector store not initialized');
    }

    // Initialize OpenAI model if not already initialized
    const { model } = await initializeOpenAI();
    if (!model) {
      throw new Error('Failed to initialize OpenAI model');
    }

    // Create a chain that combines the vector store and the language model
    const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

    // Query the chain
    const response = await chain.call({
      query: message,
    });

    return response.text;
  } catch (error) {
    console.error('Error querying RAG system:', error);
    throw error;
  }
}

/**
 * Enhance the question with customer context
 */
function enhanceQuestionWithContext(question: string, customer: Customer): string {
  return `
    Müşteri sorusu: "${question}"
    
    Müşteri bilgileri:
    - İsim: ${customer.name}
    - Mevcut paket: ${customer.plan.name} (Aylık: ₺${customer.plan.monthlyCost})
    - Veri kullanımı: ${customer.usage.dataUsage.current}GB / ${customer.usage.dataUsage.limit}GB
    - Arama dakikaları: ${customer.usage.callUsage.current} / ${customer.usage.callUsage.limit} dakika
    - Mesajlar: ${customer.usage.textUsage.current} / ${customer.usage.textUsage.limit} mesaj
    
    Lütfen bu müşteri için en uygun Vodafone kampanyalarını ve tarifeleri önerin. Yanıtınızı Türkçe olarak verin.
  `;
}

/**
 * Generate a fallback response when RAG system is not available
 */
function generateFallbackResponse(question: string, customer: Customer): string {
  const lowerCaseQuestion = question.toLowerCase();
  
  if (lowerCaseQuestion.includes('kampanya') || lowerCaseQuestion.includes('teklif') || lowerCaseQuestion.includes('fırsat')) {
    return `Sayın ${customer.name}, Vodafone'un güncel kampanyaları hakkında size bilgi vermekten memnuniyet duyarım:

1. Hoş Geldin Kampanyası: Yeni müşterilerimiz için ilk 3 ay %50 indirim ve 10GB ek internet.
2. Sadakat Kampanyası: 2 yıldan uzun süredir müşterimiz olan kullanıcılar için aylık faturada %20 indirim.
3. Aile Kampanyası: Aynı adrese kayıtlı her hat için %15 indirim ve hatlar arası ücretsiz konuşma.
4. Dijital Servisler Kampanyası: Online işlemlerinizde fatura indirimi ve dijital servis paketlerinde özel fırsatlar.
5. Yaz Kampanyası: Yaz aylarına özel 2 kat internet paketi ve yurtdışı kullanımda avantajlar.

Size özel olarak, kullanım alışkanlıklarınıza göre "Sadakat Kampanyası" ve "Dijital Servisler Kampanyası" uygun olabilir. Daha detaylı bilgi için size özel bir değerlendirme yapabiliriz. Hangi kampanya hakkında daha fazla bilgi almak istersiniz?`;
  }
  
  if (lowerCaseQuestion.includes('tarife') || lowerCaseQuestion.includes('paket')) {
    return `Sayın ${customer.name}, Vodafone'un güncel tarifeleri ve paketleri hakkında size bilgi vermekten memnuniyet duyarım:

Faturalı Tarifeler:
1. Vodafone Red: Bol internet ve her yöne sınırsız konuşma içeren premium paketler (75GB-Sınırsız internet)
2. Vodafone Kırmızı: Standart kullanıcılar için dengeli paketler (15GB-50GB internet)
3. Vodafone Mini: Ekonomik fiyatlı, temel ihtiyaçlar için uygun paketler (5GB-10GB internet)

Faturasız Paketler:
1. Vodafone Süper: Yüksek internet ve konuşma içeren ön ödemeli paketler (20GB-40GB internet)
2. Vodafone Dolu: Orta seviye kullanım için uygun paketler (10GB-15GB internet)
3. Vodafone Kolay: Düşük maliyetli, temel ihtiyaçlar için uygun paketler (3GB-8GB internet)

Mevcut kullanımınıza göre (${customer.usage.dataUsage.current}GB/${customer.usage.dataUsage.limit}GB veri, ${customer.usage.callUsage.current}/${customer.usage.callUsage.limit} dakika), size "Vodafone ${customer.usage.dataUsage.limit > 50 ? 'Red' : customer.usage.dataUsage.limit > 15 ? 'Kırmızı' : 'Mini'}" paketini önerebilirim. Bu paket, kullanım alışkanlıklarınıza uygun olacak ve mevcut paketinize göre daha fazla değer sunacaktır.

Hangi tarife hakkında daha detaylı bilgi almak istersiniz?`;
  }
  
  return `Sayın ${customer.name}, sorunuza kapsamlı bir yanıt vermek için Vodafone'un güncel kampanyaları ve tarifeleri hakkında size bilgi sunmak isterim:

Vodafone'un Öne Çıkan Teklifleri:
1. Red Tarifeler: Premium müşteriler için sınırsız konuşma ve yüksek internet paketleri
2. Kırmızı Tarifeler: Standart kullanıcılar için dengeli paketler
3. Hoş Geldin Kampanyası: Yeni müşteriler için ilk 3 ay özel indirimler
4. Sadakat Programı: Uzun süreli müşteriler için özel avantajlar ve hediyeler
5. Dijital Servisler: Online işlemlerde fatura indirimi ve ek avantajlar

Kullanım alışkanlıklarınıza göre (${customer.usage.dataUsage.current}GB/${customer.usage.dataUsage.limit}GB veri kullanımı), size özel bir değerlendirme yapabiliriz. Mevcut ${customer.plan.name} paketinizden daha avantajlı bir pakete geçiş yapabilir veya mevcut paketinize ek avantajlar ekleyebiliriz.

Nasıl yardımcı olabilirim? Kampanyalar, tarifeler veya size özel teklifler hakkında daha detaylı bilgi vermemi ister misiniz?`;
} 