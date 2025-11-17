/* eslint-disable */
/* Custom merge for Elegant Router generated imports */
import type { RouteComponent } from 'vue-router';
import type { LastLevelRouteKey, RouteLayout } from '@elegant-router/types';

// Avoid circular init: use lazy imports for layouts
export const layouts: Record<RouteLayout, RouteComponent | (() => Promise<RouteComponent>)> = {
  base: () => import('@/layouts/base-layout/index.vue'),
  blank: () => import('@/layouts/blank-layout/index.vue')
};

// Define base generated views + our custom view keys to avoid circular init
export const views: Record<LastLevelRouteKey, RouteComponent | (() => Promise<RouteComponent>)> = {
  '403': () => import('@/views/_builtin/403/index.vue'),
  '404': () => import('@/views/_builtin/404/index.vue'),
  '500': () => import('@/views/_builtin/500/index.vue'),
  'iframe-page': () => import('@/views/_builtin/iframe-page/[url].vue'),
  login: () => import('@/views/_builtin/login/index.vue'),
  home: () => import('@/views/home/index.vue'),
  users: () => import('@/views/users/index.vue'),

  'user-manage_list': () => import('@/views/user-manage_list.vue'),
  'user-manage_recharge': () => import('@/views/user-manage_recharge.vue'),
  'user-manage_kyc-list': () => import('@/views/user-manage_kyc-list.vue'),

  'product-repo_add': () => import('@/views/product-repo_add.vue'),
  'product-repo_collect': () => import('@/views/product-repo_collect.vue'),

  'orders_all': () => import('@/views/orders_all.vue'),
  'orders_seller': () => import('@/views/orders_seller.vue'),
  'orders_internal': () => import('@/views/orders_internal.vue'),

  'sellers_apply-list': () => import('@/views/sellers_apply-list.vue'),
  'sellers_withdraw': () => import('@/views/sellers_withdraw.vue'),
  'sellers_credit': () => import('@/views/sellers_credit.vue'),
  'sellers_expense': () => import('@/views/sellers_expense.vue'),
  'sellers_fake-seller-log': () => import('@/views/sellers_fake-seller-log.vue'),
  'sellers_notice-log': () => import('@/views/sellers_notice-log.vue'),
  'sellers_popup-log': () => import('@/views/sellers_popup-log.vue'),

  'platform_publish': () => import('@/views/platform_publish.vue')
};


