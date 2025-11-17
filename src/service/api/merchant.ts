import { request } from '../request';

const BASE = '/merchant';

/** List merchant applications (paginated) */
export function fetchMerchantList(params?: Api.Merchant.PageParams) {
  return request<Api.Merchant.PageData<Api.Merchant.MerchantItem>>({
    url: BASE,
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

/** Review merchant application
 * body: { uid, store_id, result: 'approve' | 'reject', reason? }
 */
export function reviewMerchant(body: { uid: string; store_id: string; result: 'approve' | 'reject'; reason?: string }) {
  return request<null>({
    url: `${BASE}/review`,
    method: 'post',
    data: body
  });
}


