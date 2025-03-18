export interface Customer {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  accountNumber: string;
  churnProbability: number;
  customerSince: string;
  plan: {
    name: string;
    monthlyCost: number;
    dataLimit: number;
    callMinutes: number;
    textMessages: number;
    features: string[];
  };
  billing: {
    currentBill: number;
    dueDate: string;
    paymentStatus: 'paid' | 'pending' | 'overdue';
    paymentHistory: {
      date: string;
      amount: number;
      status: 'paid' | 'pending' | 'overdue';
    }[];
  };
  usage: {
    dataUsage: {
      current: number;
      limit: number;
      history: {
        month: string;
        usage: number;
      }[];
    };
    callUsage: {
      current: number;
      limit: number;
      history: {
        month: string;
        usage: number;
      }[];
    };
    textUsage: {
      current: number;
      limit: number;
      history: {
        month: string;
        usage: number;
      }[];
    };
  };
  customerService: {
    lastContact: string;
    ticketsOpened: number;
    averageSatisfaction: number;
    ticketHistory: {
      date: string;
      issue: string;
      status: 'open' | 'closed' | 'pending';
      resolution?: string;
      satisfactionRating?: number;
    }[];
  };
  notes: string[];
} 