import { request } from '../request';

const BASE = '/user/';

/** List users (paginated) */
export function fetchUserList(params?: Api.User.PageParams) {
  return request<Api.User.PageData<Api.User.CmsUser>>({
    url: BASE,
    method: 'get',
    // Some environments expect query string, others (as in your Postman) use headers.
    // We send both for compatibility.
    params,
    headers: {
      ...(params?.keyword ? { keyword: params.keyword } : {}),
      ...(params?.sort ? { sort: params.sort } : {}),
      ...(params?.page ? { page: String(params.page) } : {}),
      ...(params?.size ? { size: String(params.size) } : {})
    }
  });
}

/** Create user */
export function createUser(data: Api.User.CmsUserCreate) {
  return request<Api.User.CmsUser>({
    url: BASE,
    method: 'post',
    data
  });
}

/** Update user by uuid */
export function updateUser(uuid: number | string, data: Api.User.CmsUserUpdate) {
  return request<Api.User.CmsUser>({
    url: `${BASE}${uuid}`,
    method: 'put',
    data
  });
}

/** Delete user */
export function deleteUser(uuid: number | string) {
  return request<null>({
    url: `${BASE}${uuid}`,
    method: 'delete'
  });
}

/** Force logout a user immediately (kick out) */
export function forceLogout(userId: number) {
  return request<null>({
    url: `/force_logout/${userId}`,
    method: 'post'
  });
}

/** Adjust user's balance via dedicated endpoints.
 *  - positive amount -> credit: POST /admin/manual/credit
 *  - negative amount -> debit:  POST /admin/wallet/manual-debit
 *  Both endpoints will receive { user_id, amount: absolute, reason }
 */
export function adjustUserBalance(userId: number, amount: number, reason: string) {
  const numericAmount = Number(amount || 0);
  const isDebit = numericAmount < 0;
  const absAmount = Math.abs(numericAmount);
  const url = isDebit ? `/admin/manual/debit` : `/admin/manual/credit`;

  return request<null>({
    url,
    method: 'post',
    data: {
      user_id: userId,
      amount: absAmount,
      reason
    }
  });
}

/** Push a message to specific user */
export function pushMessage(userId: number, content: string) {
  return request<null>({
    url: `/admin/push/message/${userId}`,
    method: 'post',
    data: {
      data: content
    }
  });
}

/** KYC list */
export function fetchKycList(params?: Api.Kyc.PageParams) {
  return request<Api.Kyc.PageData<Api.Kyc.KycItem>>({
    url: `/user/kyc`,
    method: 'get',
    params,
    headers: {
      ...(params?.keyword ? { keyword: params.keyword } : {}),
      ...(params?.sort ? { sort: params.sort } : {}),
      ...(params?.page ? { page: String(params.page) } : {}),
      ...(params?.size ? { size: String(params.size) } : {})
    }
  });
}

/** Review user's KYC: approve=true 通过, approve=false 驳回 */
export function reviewKyc(uid: string | number, approve: boolean) {
  return request<null>({
    url: `/admin/kyc/review`,
    method: 'put',
    data: {
      user_id: Number(uid),
      approve
    }
  });
}


