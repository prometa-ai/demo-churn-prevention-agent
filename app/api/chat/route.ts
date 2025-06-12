import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Customer } from '@/app/models/Customer';
import { queryRagSystem } from '@/app/services/ragService';
import { getOpenAIApiKey } from '@/src/config';

// Initialize OpenAI client
let openai: OpenAI;

async function initializeOpenAI() {
  if (!openai) {
    const apiKey = await getOpenAIApiKey();
    openai = new OpenAI({
      apiKey,
    });
  }
  return openai;
}

export async function POST(request: NextRequest) {
  try {
    const { message, customer, agentType, conversationContext, gpt4oContext } = await request.json();

    if (!message || !customer) {
      return NextResponse.json(
        { error: 'Mesaj ve müşteri bilgileri gereklidir' },
        { status: 400 }
      );
    }

    // Initialize OpenAI client
    const openaiClient = await initializeOpenAI();

    // If the agent type is RAG, use the RAG system
    if (agentType === 'rag') {
      try {
        const ragResponse = await queryRagSystem(message, customer);
        return NextResponse.json({ response: ragResponse });
      } catch (error) {
        console.error('RAG system error:', error);
        // Fall back to standard response if RAG fails
      }
    }

    // Use the provided GPT-4o context if available, otherwise generate a standard prompt
    const prompt = gpt4oContext || createPrompt(message, customer, translateAgentRole(agentType));

    // Call OpenAI API
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: prompt,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 600, // Increased token limit for more detailed responses
    });

    // Extract the response
    const response = completion.choices[0].message.content;

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Sohbet yanıtı oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Helper function to translate agent type to a role description
function translateAgentRole(agentType: string): string {
  switch (agentType) {
    case 'orchestrator':
      return 'Orkestrasyon Ajanı: Müşteri ihtiyaçlarını değerlendirin ve uygun yanıtları koordine edin';
    case 'outreach':
      return 'İletişim Ajanı: Müşteri ile proaktif olarak iletişim kurun ve müşteri kaybını önlemek için öneriler sunun';
    case 'personalization':
      return 'Kişiselleştirme Ajanı: Müşterinin geçmişine ve kullanım alışkanlıklarına göre kişiselleştirilmiş öneriler sunun';
    case 'rag':
      return 'Bilgi Erişim Ajanı: Müşteri sorularını yanıtlamak için Vodafone kampanyaları ve tarifeleri hakkında güncel bilgileri kullanın';
    default:
      return 'Müşteri Hizmetleri Ajanı: Müşteriye yardımcı olun ve sorularını yanıtlayın';
  }
}

// Helper function to create a prompt with customer context
function createPrompt(message: string, customer: Customer, agentRole: string): string {
  // Detect potential churn signals in user message
  const lowerCaseMessage = message.toLowerCase();
  const churnSignals = [
    'iptal', 'ayrılmak', 'bırakmak', 'değiştirmek', 'geçmek', 'pahalı', 
    'memnun değilim', 'sorun', 'problem', 'kötü', 'yavaş', 'rakip', 
    'diğer operatör', 'başka şirket'
  ];
  
  const hasChurnSignal = churnSignals.some(signal => lowerCaseMessage.includes(signal));
  
  // Calculate customer tenure in years
  const customerSinceDate = new Date(customer.customerSince);
  const currentDate = new Date();
  const customerTenureYears = currentDate.getFullYear() - customerSinceDate.getFullYear();
  
  // Calculate usage percentages
  const dataUsagePercent = (customer.usage.dataUsage.current / customer.usage.dataUsage.limit) * 100;
  const callUsagePercent = (customer.usage.callUsage.current / customer.usage.callUsage.limit) * 100;
  const textUsagePercent = (customer.usage.textUsage.current / customer.usage.textUsage.limit) * 100;
  
  // Determine if customer is a high-value customer
  const isHighValueCustomer = customer.plan.monthlyCost > 150 || customerTenureYears >= 2;
  
  // Check if the message is about campaigns or plans
  const isAboutCampaigns = lowerCaseMessage.includes('kampanya') || 
                           lowerCaseMessage.includes('teklif') || 
                           lowerCaseMessage.includes('fırsat');
  
  const isAboutPlans = lowerCaseMessage.includes('tarife') || 
                       lowerCaseMessage.includes('paket') || 
                       lowerCaseMessage.includes('plan');
  
  // Create a more detailed and retention-focused prompt
  return `
    ${agentRole}. Siz bir telekom şirketinin yapay zeka destekli müşteri hizmetleri temsilcisisiniz.
    
    Müşteri bilgileri:
    - İsim: ${customer.name}
    - Hesap: ${customer.accountNumber}
    - Müşteri olduğu tarih: ${customer.customerSince} (${customerTenureYears} yıldır müşterimiz)
    - Mevcut paket: ${customer.plan.name} (Aylık: ₺${customer.plan.monthlyCost})
    - Ayrılma riski: ${(customer.churnProbability * 100).toFixed(1)}%
    - Mevcut fatura: ₺${customer.billing.currentBill} (Durum: ${translatePaymentStatus(customer.billing.paymentStatus)})
    - Veri kullanımı: ${customer.usage.dataUsage.current}GB / ${customer.usage.dataUsage.limit}GB (%${dataUsagePercent.toFixed(0)})
    - Arama dakikaları: ${customer.usage.callUsage.current} / ${customer.usage.callUsage.limit} dakika (%${callUsagePercent.toFixed(0)})
    - Mesajlar: ${customer.usage.textUsage.current} / ${customer.usage.textUsage.limit} mesaj (%${textUsagePercent.toFixed(0)})
    
    Müşteri notları:
    ${customer.notes.length > 0 ? customer.notes.join('\n') : 'Not bulunmuyor'}
    
    Son destek talepleri:
    ${customer.customerService.ticketHistory.slice(0, 3).map(ticket => 
      `- ${ticket.date}: ${ticket.issue} (${translateTicketStatus(ticket.status)})`
    ).join('\n')}
    
    Müşteri mesajı: "${message}"
    
    ${hasChurnSignal ? 'ÖNEMLİ: Müşteri ayrılma sinyalleri gösteriyor. Müşteriyi tutmak için özel teklifler sunun ve sorunlarını çözmeye odaklanın.' : ''}
    ${customer.churnProbability > 0.5 ? 'ÖNEMLİ: Bu müşteri yüksek ayrılma riskine sahip. Proaktif olarak özel teklifler ve çözümler sunun.' : ''}
    ${isHighValueCustomer ? 'ÖNEMLİ: Bu müşteri yüksek değerli bir müşteridir. VIP muamelesi yapın ve özel teklifler sunun.' : ''}
    ${isAboutCampaigns || isAboutPlans ? 'ÖNEMLİ: Müşteri kampanyalar veya tarifeler hakkında bilgi istiyor. Vodafone\'un güncel kampanyaları ve tarifeleri hakkında bilgi verin.' : ''}
    
    Vodafone Kampanyaları ve Tarifeleri:
    - Vodafone'un faturalı tarifeleri arasında Kırmızı, Red ve Red Business paketleri bulunmaktadır.
    - Faturasız tarifeler arasında Kolay, Süper ve Dolu paketler vardır.
    - Yeni müşteriler için hoş geldin kampanyaları mevcuttur.
    - Sadık müşteriler için özel indirimler ve ek faydalar sunulmaktadır.
    - Veri aşımı durumunda ek veri paketleri satın alınabilir.
    - Aile paketleri ile birden fazla hat için avantajlar sağlanmaktadır.
    
    Yanıt stratejisi:
    1. Müşterinin sorununu veya ihtiyacını hemen ele alın
    2. Müşterinin kullanım alışkanlıklarına göre kişiselleştirilmiş öneriler sunun
    3. Müşteriye özel indirimler, promosyonlar veya hediyeler önerin
    4. Müşterinin sadakatini vurgulayın ve değerli olduğunu hissettirin
    5. Somut, ölçülebilir faydalar sunun (örn. "10GB ek veri", "%15 indirim")
    6. Müşterinin yanıtını teşvik eden bir soru ile bitirin
    
    Lütfen Türkçe yanıt verin. Yanıtınız doğal, yardımcı ve empatik olmalıdır. Müşterinin ayrılma riskini azaltmak için çaba gösterin.
    Müşterinin sorunlarını çözün ve uygun olduğunda yeni teklifler veya yükseltmeler önerin.
  `;
}

// Helper function to translate payment status
function translatePaymentStatus(status: string): string {
  switch (status) {
    case 'paid':
      return 'Ödendi';
    case 'pending':
      return 'Beklemede';
    case 'overdue':
      return 'Gecikmiş';
    default:
      return status;
  }
}

// Helper function to translate ticket status
function translateTicketStatus(status: string): string {
  switch (status) {
    case 'open':
      return 'Açık';
    case 'closed':
      return 'Kapalı';
    case 'pending':
      return 'Beklemede';
    default:
      return status;
  }
} 