export interface GenericModuleItem {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
  amount?: number;
  content?: string;
  fileUrl?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  referenceMonth?: number;
  referenceYear?: number;
  userId?: string;
  userName?: string;
  isPaid?: boolean;
  dueDate?: string;
  expenseCategory?: string;
  metadata?: { [key: string]: string };
}

export interface GenericModuleRequest {
  name?: string;
  title?: string;
  description?: string;
  content?: string;
  categoryId?: string;
  fileUrl?: string;
  amount?: number;
  startDate?: string;
  endDate?: string;
  location?: string;
  referenceMonth?: number;
  referenceYear?: number;
  dueDate?: string;
  expenseCategory?: string;
  metadata?: { [key: string]: string };
}
