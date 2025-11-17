declare namespace Api {
  namespace Order {
    interface OrderItem {
      merchant_id: string;
      status: string;
      total_price: number;
      total_retail_price: number;
      source: string;
      price: number;
      user_id: string;
      purchase_required: boolean;
      buyer_name: string;
      buyer_region: string;
      title: string;
      buyer_address: string;
      qty: number;
      product_id: number;
      order_id: string;
      created_at?: string | null;
      buyer_email_masked?: string | null;
    }

    interface PageParams {
      page?: number;
      page_size?: number;
      keyword?: string;
      sort?: 'asc' | 'desc';
    }

    interface PageData<T> {
      items: T[];
      total: number;
      page: number;
      size: number;
    }
  }
}


