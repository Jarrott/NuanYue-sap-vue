import { request } from '../request';

/** Fetch orders (all) */
export function fetchAllOrders(params?: Api.Order.PageParams) {
  const { page, page_size, keyword, sort } = params || {};
  return request<Api.Order.PageData<Api.Order.OrderItem>>({
    url: `/merchant/purchases`,
    method: 'get',
    params: {
      page,
      page_size,
      keyword,
      sort
    },
    headers: {
      ...(keyword ? { keyword } : {}),
      ...(sort ? { sort } : {}),
      ...(page ? { page: String(page) } : {}),
      ...(page_size ? { page_size: String(page_size) } : {})
    }
  });
}


