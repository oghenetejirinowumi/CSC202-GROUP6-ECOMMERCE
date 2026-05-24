export type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
};

export type User = {
  id: number;
  username: string;
  email: string;
};

export type CartProduct = {
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
};

export type CartItem = {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  updated_at: string;
  product: CartProduct;
  line_total: number;
};

export type Cart = {
  user_id: number;
  item_count: number;
  subtotal: number;
  items: CartItem[];
};

export type OrderSummary = {
  id: number;
  user_id: number;
  total: number;
  date: string;
  item_count: number;
};

export type OrderItem = {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price_at_purchase: number;
};

export type OrderDetail = {
  order: {
    id: number;
    user_id: number;
    total: number;
    date: string;
    username: string | null;
    email: string | null;
  };
  items: OrderItem[];
};

export type AuthResponse = {
  message: string;
  user: User;
  token: string;
  userId?: number;
};
