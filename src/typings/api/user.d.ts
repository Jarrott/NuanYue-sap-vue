declare namespace Api {
  namespace User {
    interface Referral {
      invite_code: string;
      ref_path: string;
      inviter_id: number | null;
    }
    interface Settings {
      lang?: string | null;
      theme?: string | null;
      device_lock?: boolean | null;
    }
    interface SensitiveDevice {
      os: string | null;
      raw: string | null;
      device: string | null;
      browser: string | null;
    }
    interface Sensitive {
      login_ip: string | null;
      last_device?: SensitiveDevice | null;
      login_devices?: SensitiveDevice[] | null;
    }
    interface CmsUser {
      id: number;
      uuid?: string | number;
      username: string;
      nickname?: string | null;
      email: string | null;
      avatar: string | null;
      phone?: string | null;
      points?: number | null;
      balance?: number | null;
      currency?: string | null;
      gender?: number | null;
      birthday?: string | null;
      status?: string | number | null;
      created_at?: string | null;
      last_login?: string | null;
      kyc_status?: number | boolean | null;
      vip_status?: boolean | null;
      vip_expire_at?: string | null;
      is_merchant?: boolean | null;
      referral?: Referral;
      settings?: Settings;
      sensitive?: Sensitive;
      /** fallback of previous structure */
      extra?: Record<string, any>;
      create_time?: string;
      update_time?: string;
      delete_time?: string | null;
      is_deleted?: boolean;
      _avatar?: string | null;
    }

    type CmsUserCreate = Partial<Omit<CmsUser, 'id'>> & { username: string };
    type CmsUserUpdate = Partial<Omit<CmsUser, 'id'>>;

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


