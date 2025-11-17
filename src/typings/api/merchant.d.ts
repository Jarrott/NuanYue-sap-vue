declare namespace Api {
  namespace Merchant {
    interface MerchantItem {
      store_id: string;
      uid?: string;
      level?: string | null;
      verify_badge?: boolean | null;
      address?: string | null;
      store_name: string;
      status: string;
      email?: string | null;
      logo?: string | null;
      create_time?: string | null;
      update_time?: string | null;
      avatar?: string | null;
      lang?: string | null;
    }

    interface PageParams {
      keyword?: string;
      sort?: 'asc' | 'desc';
      page?: number;
      size?: number;
    }

    interface PageData<T> {
      items: T[];
      total: number;
      page: number;
      size: number;
    }
  }
}


