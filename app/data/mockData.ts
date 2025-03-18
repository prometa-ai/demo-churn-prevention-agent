import { Customer } from '../models/Customer';

// Helper function to generate random number within a range
const randomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper function to generate random date within the last n years
const randomDate = (yearsBack: number = 5): string => {
  const today = new Date();
  const pastDate = new Date(
    today.getFullYear() - randomNumber(0, yearsBack),
    randomNumber(0, 11),
    randomNumber(1, 28)
  );
  return pastDate.toISOString().split('T')[0];
};

// Helper function to generate random future date within n months
const randomFutureDate = (monthsAhead: number = 1): string => {
  const today = new Date();
  const futureDate = new Date(
    today.getFullYear(),
    today.getMonth() + randomNumber(0, monthsAhead),
    randomNumber(1, 28)
  );
  return futureDate.toISOString().split('T')[0];
};

// Generate random phone number
const randomPhoneNumber = (): string => {
  return `(0${randomNumber(500, 599)}) ${randomNumber(100, 999)} ${randomNumber(10, 99)} ${randomNumber(10, 99)}`;
};

// Generate random email
const randomEmail = (name: string): string => {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
  const formattedName = name.toLowerCase().replace(/\s+/g, '.');
  return `${formattedName}@${domains[randomNumber(0, domains.length - 1)]}`;
};

// Generate random plan name
const randomPlan = (): { name: string; monthlyCost: number; dataLimit: number; callMinutes: number; textMessages: number; features: string[] } => {
  const plans = [
    {
      name: 'Temel',
      monthlyCost: 99.99,
      dataLimit: 2,
      callMinutes: 100,
      textMessages: 500,
      features: ['Temel Destek', 'Standart Veri']
    },
    {
      name: 'Standart',
      monthlyCost: 149.99,
      dataLimit: 5,
      callMinutes: 500,
      textMessages: 1000,
      features: ['7/24 Destek', 'HD Yayın', 'Veri Aktarımı']
    },
    {
      name: 'Premium',
      monthlyCost: 199.99,
      dataLimit: 10,
      callMinutes: 1000,
      textMessages: 5000,
      features: ['Öncelikli Destek', '4K Yayın', 'Uluslararası Aramalar', 'Veri Aktarımı', 'Aile Paylaşımı']
    },
    {
      name: 'Sınırsız',
      monthlyCost: 299.99,
      dataLimit: 999,
      callMinutes: 9999,
      textMessages: 9999,
      features: ['VIP Destek', '4K Yayın', 'Uluslararası Aramalar', 'Aile Paylaşımı', 'Cihaz Sigortası', 'Bulut Depolama']
    }
  ];
  
  return plans[randomNumber(0, plans.length - 1)];
};

// Generate usage history
const generateUsageHistory = (limit: number): { month: string; usage: number }[] => {
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const history = [];
  
  for (let i = 0; i < 6; i++) {
    const monthIndex = (new Date().getMonth() - i + 12) % 12;
    history.push({
      month: months[monthIndex],
      usage: randomNumber(0, limit)
    });
  }
  
  return history;
};

// Generate payment history
const generatePaymentHistory = (monthlyCost: number): { date: string; amount: number; status: 'paid' | 'pending' | 'overdue' }[] => {
  const history = [];
  const statuses: ('paid' | 'pending' | 'overdue')[] = ['paid', 'paid', 'paid', 'pending', 'overdue'];
  
  for (let i = 0; i < 6; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const formattedDate = date.toISOString().split('T')[0];
    
    // Add some variation to the bill amount
    const amount = monthlyCost + randomNumber(-10, 20);
    
    // Most customers have paid their bills, but some have pending or overdue payments
    const statusIndex = i === 0 ? randomNumber(0, 4) : randomNumber(0, 2);
    
    history.push({
      date: formattedDate,
      amount: parseFloat(amount.toFixed(2)),
      status: statuses[statusIndex]
    });
  }
  
  return history;
};

// Generate ticket history
const generateTicketHistory = (count: number): { date: string; issue: string; status: 'open' | 'closed' | 'pending'; resolution?: string; satisfactionRating?: number }[] => {
  const issues = [
    'Fatura sorgusu',
    'Servis kesintisi',
    'Yavaş veri hızları',
    'Hesap erişim sorunları',
    'Cihaz uyumluluğu',
    'Paket yükseltme talebi',
    'Uluslararası dolaşım',
    'Ödeme yöntemi güncelleme',
    'Eksik özellikler',
    'Teknik destek'
  ];
  
  const resolutions = [
    'Müşteri hizmetleri tarafından çözüldü',
    'Teknik düzeltme uygulandı',
    'Hesaba kredi tanımlandı',
    'Paket yükseltildi',
    'Yeni cihaz sağlandı',
    'Ayarlar güncellendi',
    'İşlem gerekmedi',
    'Müşteri özellik kullanımı hakkında bilgilendirildi'
  ];
  
  const statuses: ('open' | 'closed' | 'pending')[] = ['closed', 'closed', 'closed', 'pending', 'open'];
  const history = [];
  
  for (let i = 0; i < count; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - randomNumber(0, 11));
    date.setDate(randomNumber(1, 28));
    const formattedDate = date.toISOString().split('T')[0];
    
    const status = statuses[randomNumber(0, 4)];
    const ticket: { date: string; issue: string; status: 'open' | 'closed' | 'pending'; resolution?: string; satisfactionRating?: number } = {
      date: formattedDate,
      issue: issues[randomNumber(0, issues.length - 1)],
      status
    };
    
    if (status === 'closed') {
      ticket.resolution = resolutions[randomNumber(0, resolutions.length - 1)];
      
      // Closed tickets get a satisfaction rating (1-5)
      // Çoğunlukla orta ve yüksek puanlar vermek için ağırlıklı dağılım kullanıyoruz
      const ratingDistribution = randomNumber(1, 100);
      if (ratingDistribution <= 10) {
        // %10 ihtimalle çok düşük memnuniyet (1)
        ticket.satisfactionRating = 1;
      } else if (ratingDistribution <= 25) {
        // %15 ihtimalle düşük memnuniyet (2)
        ticket.satisfactionRating = 2;
      } else if (ratingDistribution <= 55) {
        // %30 ihtimalle orta memnuniyet (3)
        ticket.satisfactionRating = 3;
      } else if (ratingDistribution <= 85) {
        // %30 ihtimalle yüksek memnuniyet (4)
        ticket.satisfactionRating = 4;
      } else {
        // %15 ihtimalle çok yüksek memnuniyet (5)
        ticket.satisfactionRating = 5;
      }
    }
    
    history.push(ticket);
  }
  
  return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Generate random notes
const generateNotes = (): string[] => {
  const possibleNotes = [
    'Müşteri paket yükseltme konusunda ilgi gösterdi',
    'Müşteri kırsal alanlardaki hizmet hakkında şikayette bulundu',
    'Müşteri uluslararası dolaşım seçenekleri hakkında bilgi istedi',
    'Müşteri aile paketleri hakkında bilgi talep etti',
    'Müşteri rakip operatöre geçmeyi düşündüğünü belirtti',
    'Müşteri müşteri hizmetleri deneyiminden memnun kaldı',
    'Müşteri yeni promosyonlar hakkında geri arama talep etti',
    'Müşteri yeni cihaz yükseltmesiyle ilgileniyor',
    'Müşteri son paket değişikliğinden memnuniyetini bildirdi',
    'Müşteri yakında yeni bir adrese taşınacağını belirtti'
  ];
  
  const notes = [];
  const noteCount = randomNumber(0, 3);
  
  for (let i = 0; i < noteCount; i++) {
    notes.push(possibleNotes[randomNumber(0, possibleNotes.length - 1)]);
  }
  
  return notes;
};

// First names and last names for generating random customer names
const firstNames = [
  'Ahmet', 'Mehmet', 'Mustafa', 'Ali', 'Hüseyin', 'İbrahim', 'Hasan', 'Osman', 'Ömer', 'Yusuf',
  'Ayşe', 'Fatma', 'Emine', 'Hatice', 'Zeynep', 'Elif', 'Meryem', 'Zehra', 'Özlem', 'Selma',
  'Can', 'Cem', 'Deniz', 'Emre', 'Burak', 'Efe', 'Kaan', 'Mert', 'Onur', 'Serkan',
  'Selin', 'Ebru', 'Esra', 'Gül', 'Melis', 'Pınar', 'Seda', 'Tuğçe', 'Yasemin', 'Zeliha',
  'Kemal', 'Orhan', 'Sinan', 'Tolga', 'Ufuk', 'Volkan', 'Yasin', 'Zafer', 'Alp', 'Berk'
];

const lastNames = [
  'Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Yıldız', 'Yıldırım', 'Öztürk', 'Aydın', 'Özdemir',
  'Arslan', 'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Kara', 'Koç', 'Kurt', 'Özkan', 'Şimşek',
  'Polat', 'Korkmaz', 'Erdoğan', 'Şen', 'Güneş', 'Tekin', 'Yalçın', 'Güler', 'Aktaş', 'Bulut',
  'Türk', 'Güzel', 'Mutlu', 'Yavuz', 'Ateş', 'Altun', 'Taş', 'Aksoy', 'Acar', 'Kaplan',
  'Turan', 'Alkan', 'Keskin', 'Yüksel', 'Gül', 'Kartal', 'Avcı', 'Tunç', 'Uysal', 'Coşkun'
];

// Generate a single mock customer
const generateMockCustomer = (id: number): Customer => {
  const firstName = firstNames[randomNumber(0, firstNames.length - 1)];
  const lastName = lastNames[randomNumber(0, lastNames.length - 1)];
  const name = `${firstName} ${lastName}`;
  const email = randomEmail(name);
  const phoneNumber = randomPhoneNumber();
  const customerSince = randomDate();
  const plan = randomPlan();
  
  // Calculate tenure in months
  const customerStartDate = new Date(customerSince);
  const currentDate = new Date();
  const tenureInMonths = (currentDate.getFullYear() - customerStartDate.getFullYear()) * 12 + 
                          (currentDate.getMonth() - customerStartDate.getMonth());
  
  // Generate ticket count and history first
  // Newer customers may have more issues as they adjust to the service
  const maxTickets = Math.max(5, Math.floor(10 - (tenureInMonths / 12)));
  const ticketsOpened = randomNumber(0, maxTickets);
  const ticketHistory = generateTicketHistory(ticketsOpened);
  
  // Calculate average satisfaction rating from closed tickets
  const closedTickets = ticketHistory.filter(t => t.status === 'closed' && t.satisfactionRating !== undefined);
  const totalSatisfactionPoints = closedTickets.reduce((sum, ticket) => sum + (ticket.satisfactionRating || 0), 0);
  
  // Default to 3 (neutral) if no ratings available
  const averageSatisfaction = closedTickets.length > 0 
    ? parseFloat((totalSatisfactionPoints / closedTickets.length).toFixed(1)) 
    : 3;
  
  // Count unresolved tickets and recent complaints
  const unresolvedTickets = ticketHistory.filter(t => t.status === 'open' || t.status === 'pending').length;
  const recentTickets = ticketHistory.filter(t => {
    const ticketDate = new Date(t.date);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return ticketDate >= threeMonthsAgo;
  }).length;
  
  // Generate last contact date
  const lastContact = ticketHistory.length > 0 ? ticketHistory[0].date : randomDate(1);
  
  // Base churn probability on total number of support tickets and satisfaction ratings
  let baseChurnProbability = 0;
  
  // More tickets increases churn risk
  if (ticketsOpened > 3) {
    baseChurnProbability += 0.15; // Base risk for many tickets, but less than before
  } else if (ticketsOpened > 1) {
    baseChurnProbability += 0.08; // Moderate risk for some tickets
  } else {
    baseChurnProbability += 0.03; // Low risk for few tickets
  }
  
  // Low satisfaction significantly increases churn risk
  if (averageSatisfaction < 2) {
    baseChurnProbability += 0.40; // Extremely high risk for very low satisfaction
  } else if (averageSatisfaction < 3) {
    baseChurnProbability += 0.25; // High risk for low satisfaction 
  } else if (averageSatisfaction < 4) {
    baseChurnProbability += 0.10; // Moderate risk for neutral satisfaction
  } else if (averageSatisfaction < 4.5) {
    baseChurnProbability -= 0.05; // Reduced risk for good satisfaction
  } else {
    baseChurnProbability -= 0.10; // Very low risk for excellent satisfaction
  }
  
  // Unresolved tickets still increase churn risk but less than before
  baseChurnProbability += unresolvedTickets * 0.08;
  
  // Recent tickets indicate current dissatisfaction
  baseChurnProbability += recentTickets * 0.05;
  
  // Tenure affects churn risk - newer customers more likely to churn
  if (tenureInMonths < 6) {
    baseChurnProbability += 0.15; // New customers are at higher risk
  } else if (tenureInMonths < 24) {
    baseChurnProbability += 0.07; // Mid-term customers have moderate risk
  }
  
  // Add randomness but keep within bounds
  const randomFactor = randomNumber(-10, 10) / 100;
  let churnProbability = Math.min(0.95, Math.max(0.05, baseChurnProbability + randomFactor));
  
  // Still ensure we have some distribution of risk levels
  const riskDistribution = randomNumber(1, 100);
  if (riskDistribution <= 60 && churnProbability > 0.3) {
    // Force 60% of customers to low risk
    churnProbability = randomNumber(5, 29) / 100;
  } else if (riskDistribution <= 85 && churnProbability > 0.7) {
    // Force another 25% to medium risk
    churnProbability = randomNumber(30, 69) / 100;
  }
  
  // Generate current usage as a percentage of the limit
  const dataUsagePercent = randomNumber(10, 150) / 100;
  const callUsagePercent = randomNumber(10, 150) / 100;
  const textUsagePercent = randomNumber(10, 150) / 100;
  
  const dataUsage = Math.min(plan.dataLimit, plan.dataLimit * dataUsagePercent);
  const callUsage = Math.min(plan.callMinutes, plan.callMinutes * callUsagePercent);
  const textUsage = Math.min(plan.textMessages, plan.textMessages * textUsagePercent);
  
  // Generate payment history
  const paymentHistory = generatePaymentHistory(plan.monthlyCost);
  
  // Determine current bill and payment status
  const currentBill = paymentHistory[0].amount;
  const paymentStatus = paymentHistory[0].status;
  
  return {
    id: `MUS-${id.toString().padStart(5, '0')}`,
    name,
    email,
    phoneNumber,
    address: `${randomNumber(1, 100)} ${['Atatürk', 'Cumhuriyet', 'İstiklal', 'Gazi', 'Fatih'][randomNumber(0, 4)]} ${['Caddesi', 'Bulvarı', 'Sokak'][randomNumber(0, 2)]}, No:${randomNumber(1, 100)}, ${['İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa'][randomNumber(0, 4)]}`,
    accountNumber: `HES-${randomNumber(100000, 999999)}`,
    churnProbability,
    customerSince,
    plan,
    billing: {
      currentBill,
      dueDate: randomFutureDate(),
      paymentStatus,
      paymentHistory
    },
    usage: {
      dataUsage: {
        current: parseFloat(dataUsage.toFixed(2)),
        limit: plan.dataLimit,
        history: generateUsageHistory(plan.dataLimit)
      },
      callUsage: {
        current: Math.floor(callUsage),
        limit: plan.callMinutes,
        history: generateUsageHistory(plan.callMinutes)
      },
      textUsage: {
        current: Math.floor(textUsage),
        limit: plan.textMessages,
        history: generateUsageHistory(plan.textMessages)
      }
    },
    customerService: {
      lastContact,
      ticketsOpened,
      averageSatisfaction,
      ticketHistory
    },
    notes: generateNotes()
  };
};

// Generate multiple mock customers
export const generateMockCustomers = (count: number): Customer[] => {
  const customers: Customer[] = [];
  
  // Normal müşteriler için
  for (let i = 1; i <= count - 13; i++) {
    const customer = generateMockCustomer(i);
    
    // Bu müşterilerin ayrılma riskinin %70'in altında olduğundan emin olalım
    if (customer.churnProbability > 0.7) {
      customer.churnProbability = randomNumber(5, 69) / 100;
    }
    
    customers.push(customer);
  }
  
  // Yüksek ayrılma riskli 13 müşteri için
  for (let i = count - 13 + 1; i <= count; i++) {
    const customer = generateMockCustomer(i);
    
    // Bu müşterilerin ayrılma riskini %70'in üzerine çıkaralım
    customer.churnProbability = randomNumber(70, 95) / 100;
    
    customers.push(customer);
  }
  
  return customers;
}; 