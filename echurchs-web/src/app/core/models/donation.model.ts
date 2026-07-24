export interface Donation {
  id: string;
  donorName: string;
  donorEmail?: string;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

export interface PaymentLink {
  id: string;
  title: string;
  amount?: number;
  externalUrl: string;
  isActive: boolean;
  createdAt: string;
}
