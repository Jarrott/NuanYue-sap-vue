declare namespace Api {
  namespace Kyc {
    interface KycItem {
      uid: string;
      full_name: string;
      id_type: string;
      id_number: string;
      dob?: string | null;
      nationality?: string | null;
      contact_phone?: string | null;
      contact_email?: string | null;
      id_front_url?: string | null;
      id_back_url?: string | null;
      selfie_url?: string | null;
      remark?: string | null;
      /** 审核状态: 'approved' | 'rejected' | 'pending' 或兼容数字(1/-1/0) */
      status: string | number;
      kyc_status?: boolean | null;
      create_time?: string | null;
      update_time?: string | null;
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


