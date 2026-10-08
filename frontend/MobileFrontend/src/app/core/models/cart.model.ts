export interface CartItem {
  productId: number;
  title: string;
  price: number;
  quantity: number;
}

export interface Cart {
  id: number;
  userId: string;
  items: CartItem[];
  totalAmount: number;
}
