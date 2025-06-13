import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Customer } from '@/app/models/Customer';
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
    const { customer } = await request.json();

    if (!customer) {
      return NextResponse.json(
        { error: 'Müşteri bilgileri gereklidir' },
        { status: 400 }
      );
    }

    // Initialize OpenAI client
    const openaiClient = await initializeOpenAI();

    // Create a prompt with rich customer data for generating the initial message
    const prompt = createInitialMessagePrompt(customer);

    // Call OpenAI API
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: prompt,
        }
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    // Extract the response
    const initialMessage = completion.choices[0].message.content || '';

    // Analyze the message to determine the topic
    let topic = determineTopicFromMessage(initialMessage);

    // Log successful prompt and response for analysis
    logSuccessfulPrompt(customer, prompt, initialMessage, topic);

    return NextResponse.json({ 
      initialMessage,
      topic
    });
  } catch (error) {
    console.error('Initial message API error:', error);
    return NextResponse.json(
      { error: 'Başlangıç mesajı oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Function to create a detailed prompt for the initial message generation
function createInitialMessagePrompt(customer: Customer): string {
  // Calculate customer tenure in years
  const customerSinceDate = new Date(customer.customerSince);
  const currentDate = new Date();
  const customerTenureYears = currentDate.getFullYear() - customerSinceDate.getFullYear();
  
  // Calculate usage percentages
  const dataUsagePercent = (customer.usage.dataUsage.current / customer.usage.dataUsage.limit) * 100;
  const callUsagePercent = (customer.usage.callUsage.current / customer.usage.callUsage.limit) * 100;
  const textUsagePercent = (customer.usage.textUsage.current / customer.usage.textUsage.limit) * 100;
  
  // Count unresolved tickets and recent complaints
  const unresolvedTickets = customer.customerService.ticketHistory.filter(t => t.status === 'open' || t.status === 'pending').length;
  const recentTickets = customer.customerService.ticketHistory.filter(t => {
    const ticketDate = new Date(t.date);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return ticketDate >= threeMonthsAgo;
  }).length;

  // Count pending tickets specifically
  const pendingTickets = customer.customerService.ticketHistory.filter(t => t.status === 'pending').length;
  
  // Check for late payments in history
  const latePaymentsCount = customer.billing.paymentHistory.filter(payment => payment.status === 'overdue').length;
  
  // Calculate bill increase rate if available, otherwise calculate from payment history
  const billIncreaseRate = customer.billIncreaseRate !== undefined ? 
    customer.billIncreaseRate : 
    customer.billing.paymentHistory.length > 1 ? 
      ((customer.billing.currentBill - customer.billing.paymentHistory[1].amount) / customer.billing.paymentHistory[1].amount) * 100 : 
      0;
  
  // Determine if customer is a high-value customer
  const isHighValueCustomer = customer.plan.monthlyCost > 150 || customerTenureYears >= 2;
  
  // Calculate additional support-related factors
  const hasHighTicketCount = customer.customerService.ticketsOpened > 3;
  const hasLowSatisfaction = customer.customerService.averageSatisfaction < 3.5;
  const hasPendingTickets = pendingTickets > 0;
  const hasUnresolvedTickets = unresolvedTickets > 0;
  const hasSupportIssues = hasHighTicketCount || hasLowSatisfaction || hasPendingTickets || hasUnresolvedTickets;
  
  // Determine high data usage status
  const hasHighDataUsage = dataUsagePercent > 80;
  
  // Determine high bill increase status
  const hasHighBillIncrease = billIncreaseRate > 20;
  
  return `
Siz Vodafone Müşteri Hizmetlerinden Prometa adlı yapay zeka tabanlı müşteri temsilcisisiniz. Müşteriye gönderilecek kişiselleştirilmiş bir başlangıç mesajı oluşturmanız gerekiyor.

# MÜŞTERİ VERİLERİ
Aşağıda müşteri hakkında detaylı bilgiler verilmiştir. Bu bilgileri kullanarak müşterinin durumuna ve ihtiyaçlarına özel bir mesaj oluşturun.

## Temel Bilgiler
- İsim: ${customer.name}
- Müşteri numarası: ${customer.accountNumber}
- Müşteri olduğu tarih: ${customer.customerSince} (${customerTenureYears} yıldır müşterimiz)
- Ayrılma (churn) olasılığı: %${(customer.churnProbability * 100).toFixed(1)}

## Tarife Bilgileri
- Mevcut paket: ${customer.plan.name}
- Aylık ücret: ${customer.plan.monthlyCost.toFixed(2)}₺
- Veri limiti: ${customer.plan.dataLimit}GB
- Konuşma dakikaları: ${customer.plan.callMinutes} dakika
- Mesaj hakkı: ${customer.plan.textMessages} SMS
- Ek özellikler: ${customer.plan.features.join(', ')}

## Kullanım Verileri
- Veri kullanımı: ${customer.usage.dataUsage.current}GB/${customer.usage.dataUsage.limit}GB (%${dataUsagePercent.toFixed(1)})
- Arama kullanımı: ${customer.usage.callUsage.current}/${customer.usage.callUsage.limit} dakika (%${callUsagePercent.toFixed(1)})
- Mesaj kullanımı: ${customer.usage.textUsage.current}/${customer.usage.textUsage.limit} SMS (%${textUsagePercent.toFixed(1)})

## Destek Geçmişi
- Toplam açılan destek talebi: ${customer.customerService.ticketsOpened}
- Son iletişim tarihi: ${customer.customerService.lastContact}
- Ortalama memnuniyet puanı: ${customer.customerService.averageSatisfaction}/5
- Çözülmemiş destek talepleri: ${unresolvedTickets}
- Beklemede olan talepler: ${pendingTickets}
- Son 3 aydaki destek talepleri: ${recentTickets}

## Fatura Bilgileri
- Mevcut fatura: ${customer.billing.currentBill.toFixed(2)}₺
- Son ödeme tarihi: ${customer.billing.dueDate}
- Ödeme durumu: ${translatePaymentStatus(customer.billing.paymentStatus)}
- Geçmiş gecikmiş ödeme sayısı: ${latePaymentsCount}
- Fatura artış oranı: %${billIncreaseRate.toFixed(1)}

## Notlar
${customer.notes.map(note => `- ${note}`).join('\n')}

# GÖREV
Müşterinin verilerini detaylı olarak analiz ederek, aşağıdaki senaryolardan en uygun olanına göre kişiselleştirilmiş bir açılış mesajı oluşturun:

1. **FATURA ARTIŞ ORANI YÜKSEK MÜŞTERİ**: Eğer fatura artış oranı %20'den fazla ise, müşteriye fatura tutarında düşüş sağlayacak öneriler (daha uygun paket, ihtiyaç dışı hizmetlerin iptali, sadakat indirimi vb.) sunun.

2. **YÜKSEK DESTEK TALEBİ OLAN MÜŞTERİ**: Eğer müşterinin çözülmemiş destek talepleri varsa veya memnuniyet puanı düşükse, müşteriye destek taleplerinde yaşadıkları problemlerin çözümüne dair öneriler sunun.

3. **VERİ KULLANIMI YÜKSEK MÜŞTERİ**: Eğer veri kullanımı limitlerine yaklaşmışsa (%80'den fazla), müşteriye uygun veri paketi önerilerinde bulunun.

4. **GENEL KAMPANYA ÖNERİSİ**: Yukarıdakilerden hiçbiri geçerli değilse, müşterinin kullanım alışkanlıklarına göre uygun kampanya veya yeni hizmet önerilerinde bulunun.

Mesaj formati:
- "Merhaba [Müşteri Adı], ben Prometa, Vodafone Müşteri Hizmetlerinden yapay zeka tabanlı müşteri temsilciniz." şeklinde başlayın.
- Müşterinin durumuna göre yukarıdaki senaryolardan SADECE BİRİNE odaklanan kısa ve öz bir ileti oluşturun.
- Mesajınızı bir soru ile bitirerek müşterinin yanıt vermesini teşvik edin.

# ÖNEMLİ NOTLAR
- ASLA müşteriye ayrılma riski, churn riski, yüksek risk veya benzer ifadeleri kullanmayın.
- Müşterinin durumunu olumlu bir dille ifade edin (örn. "sorununuzu çözmek" yerine "hizmet deneyiminizi iyileştirmek" gibi).
- Mesajınız TEK BİR KONUYA odaklanmalı ve kısa olmalıdır.
- Mesajınız doğal, samimi ve yardımcı bir tonda olmalıdır.

YALNIZCA MESAJI YAZIN, başka açıklama eklemeyin.
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

// Function to determine the topic from the generated message
function determineTopicFromMessage(message: string): 'data_package' | 'premium_package' | 'payment' | 'campaigns' | 'customer_service' | 'general' {
  const lowerMessage = message.toLowerCase();
  
  // Check for data package related terms
  if (lowerMessage.includes('veri') && (lowerMessage.includes('paket') || lowerMessage.includes('limit') || lowerMessage.includes('kullanım') || lowerMessage.includes('gb'))) {
    return 'data_package';
  }
  
  // Check for premium package related terms
  if (lowerMessage.includes('premium paket') || lowerMessage.includes('özel paket') || lowerMessage.includes('sınırsız')) {
    return 'premium_package';
  }
  
  // Check for payment related terms
  if (lowerMessage.includes('fatura') || lowerMessage.includes('ödeme') || lowerMessage.includes('öde') || lowerMessage.includes('indirim') || lowerMessage.includes('tutar')) {
    return 'payment';
  }
  
  // Check for campaign related terms
  if (lowerMessage.includes('kampanya') || lowerMessage.includes('teklif') || lowerMessage.includes('fırsat') || lowerMessage.includes('avantaj') || lowerMessage.includes('sadakat')) {
    return 'campaigns';
  }
  
  // Check for customer service related terms
  if (lowerMessage.includes('destek') || lowerMessage.includes('sorun') || lowerMessage.includes('yardım') || lowerMessage.includes('müşteri temsilcisi') || lowerMessage.includes('çözüm')) {
    return 'customer_service';
  }
  
  return 'general';
}

// Function to log successful prompts for later analysis
async function logSuccessfulPrompt(customer: Customer, prompt: string, response: string, topic: string) {
  try {
    // In a production environment, this would write to a database or file system
    // For now, just log to console with structured data
    const logData = {
      timestamp: new Date().toISOString(),
      customerId: customer.id,
      customerChurnProbability: customer.churnProbability,
      promptLength: prompt.length,
      responseLength: response.length,
      topic: topic,
      // Add metadata for analysis
      dataUsagePercent: (customer.usage.dataUsage.current / customer.usage.dataUsage.limit) * 100,
      callUsagePercent: (customer.usage.callUsage.current / customer.usage.callUsage.limit) * 100,
      avgSatisfaction: customer.customerService.averageSatisfaction,
      ticketsOpened: customer.customerService.ticketsOpened,
      paymentStatus: customer.billing.paymentStatus,
      billIncreaseRate: customer.billIncreaseRate,
    };
    
    console.log('✅ Successful Initial Message Generated:', JSON.stringify(logData));
    
    // In a production system, you would store this in a database or analytics system
    // await db.collection('promptLogs').insertOne(logData);
  } catch (error) {
    // Fail silently - logging should not affect the main functionality
    console.error('Error logging prompt:', error);
  }
} 