export interface CartItemDetail {
  productId: number;
  productTitle: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  id: number;
  userId: number;
  customerName: string;
  date: string;
  totalAmount: number;
  products: CartItemDetail[];
}