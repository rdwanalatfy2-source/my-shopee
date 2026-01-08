
export enum Role {
  ADMIN = 'مدير',
  EMPLOYEE = 'موظف'
}

export enum SaleStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  RETURNED = 'returned',
  PARTIAL_RETURN = 'partial_return' // حالة جديدة للاسترجاع الجزئي
}

export interface Category {
  id: string;
  name: string;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: Role;
  createdAt: string;
}

export interface Product {
  id: string;
  barcode?: string;
  name: string;
  categoryId: string;
  costPrice: number;
  price: number;
  quantity: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  price: number;
  costPrice: number;
  quantity: number;
  returnedQuantity: number; // تتبع الكمية المسترجعة
  total: number;
}

export interface Sale {
  id: string;
  date: string;
  items: SaleItem[];
  totalAmount: number;
  sellerId: string;
  customerName?: string;
  customerPhone?: string;
  status: SaleStatus;
}
