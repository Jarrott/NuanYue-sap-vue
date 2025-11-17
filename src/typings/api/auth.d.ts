declare namespace Api {
  /**
   * namespace Auth
   *
   * backend api module: "auth"
   */
  namespace Auth {
    interface LoginToken {
      /** camelCase from some backends */
      token?: string;
      refreshToken?: string;
      /** snake_case from your backend */
      access_token?: string;
      refresh_token?: string;
      /** optional third-party token */
      firebase_token?: string;
    }

    interface UserInfo {
      userId: string;
      userName: string;
      roles: string[];
      buttons: string[];
    }
  }
}
