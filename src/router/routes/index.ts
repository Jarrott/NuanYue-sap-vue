import type { CustomRoute, ElegantConstRoute, ElegantRoute } from '@elegant-router/types';
import { generatedRoutes } from '../elegant/routes';
import { layouts, views } from '../elegant/imports.custom';
import { transformElegantRoutesToVueRoutes } from '../elegant/transform';

/**
 * custom routes
 *
 * @link https://github.com/soybeanjs/elegant-router?tab=readme-ov-file#custom-route
 */
const customRoutes: CustomRoute[] = [
  // keep "users" route from generatedRoutes; no need to duplicate here
  {
    name: 'user-manage',
    path: '/user-manage',
    component: 'layout.base',
    redirect: '/user-manage/list',
    meta: {
      title: '用户管理',
      i18nKey: 'route.user-manage',
      icon: 'mdi:account-multiple',
      order: 2
    },
    children: [
      {
        name: 'user-manage_list',
        path: '/user-manage/list',
        component: 'view.user-manage_list',
        meta: {
          title: '用户列表',
          i18nKey: 'route.user-manage_list'
        }
      },
      {
        name: 'user-manage_recharge',
        path: '/user-manage/recharge',
        component: 'view.user-manage_recharge',
        meta: {
          title: '用户充值',
          i18nKey: 'route.user-manage_recharge'
        }
      },
      {
        name: 'user-manage_kyc-list',
        path: '/user-manage/kyc-list',
        component: 'view.user-manage_kyc-list',
        meta: {
          title: '用户KYC认证列表',
          i18nKey: 'route.user-manage_kyc-list'
        }
      }
    ]
  },
  {
    name: 'product-repo',
    path: '/product-repo',
    component: 'layout.base',
    redirect: '/product-repo/add',
    meta: {
      title: '产品仓库',
      i18nKey: 'route.product-repo',
      icon: 'mdi:package-variant',
      order: 3
    },
    children: [
      {
        name: 'product-repo_add',
        path: '/product-repo/add',
        component: 'view.product-repo_add',
        meta: {
          title: '添加产品',
          i18nKey: 'route.product-repo_add'
        }
      },
      {
        name: 'product-repo_collect',
        path: '/product-repo/collect',
        component: 'view.product-repo_collect',
        meta: {
          title: '产品采集',
          i18nKey: 'route.product-repo_collect'
        }
      }
    ]
  },
  {
    name: 'orders',
    path: '/orders',
    component: 'layout.base',
    redirect: '/orders/all',
    meta: {
      title: '成交订单',
      i18nKey: 'route.orders',
      icon: 'mdi:clipboard-text',
      order: 4
    },
    children: [
      {
        name: 'orders_all',
        path: '/orders/all',
        component: 'view.orders_all',
        meta: {
          title: '所有订单',
          i18nKey: 'route.orders_all'
        }
      },
      {
        name: 'orders_seller',
        path: '/orders/seller',
        component: 'view.orders_seller',
        meta: {
          title: '卖家订单',
          i18nKey: 'route.orders_seller'
        }
      },
      {
        name: 'orders_internal',
        path: '/orders/internal',
        component: 'view.orders_internal',
        meta: {
          title: '内部订单',
          i18nKey: 'route.orders_internal'
        }
      }
    ]
  },
  {
    name: 'sellers',
    path: '/sellers',
    component: 'layout.base',
    redirect: '/sellers/apply-list',
    meta: {
      title: '卖家',
      i18nKey: 'route.sellers',
      icon: 'mdi:account-cash',
      order: 5
    },
    children: [
      {
        name: 'sellers_apply-list',
        path: '/sellers/apply-list',
        component: 'view.sellers_apply-list',
        meta: {
          title: '卖家申请列表',
          i18nKey: 'route.sellers_apply-list'
        }
      },
      {
        name: 'sellers_withdraw',
        path: '/sellers/withdraw',
        component: 'view.sellers_withdraw',
        meta: {
          title: '提款申请',
          i18nKey: 'route.sellers_withdraw'
        }
      },
      {
        name: 'sellers_credit',
        path: '/sellers/credit',
        component: 'view.sellers_credit',
        meta: {
          title: '信用额度',
          i18nKey: 'route.sellers_credit'
        }
      },
      {
        name: 'sellers_expense',
        path: '/sellers/expense',
        component: 'view.sellers_expense',
        meta: {
          title: '支出',
          i18nKey: 'route.sellers_expense'
        }
      },
      {
        name: 'sellers_fake-seller-log',
        path: '/sellers/fake-seller-log',
        component: 'view.sellers_fake-seller-log',
        meta: {
          title: '设置虚拟卖家日志',
          i18nKey: 'route.sellers_fake-seller-log'
        }
      },
      {
        name: 'sellers_notice-log',
        path: '/sellers/notice-log',
        component: 'view.sellers_notice-log',
        meta: {
          title: '通知日志',
          i18nKey: 'route.sellers_notice-log'
        }
      },
      {
        name: 'sellers_popup-log',
        path: '/sellers/popup-log',
        component: 'view.sellers_popup-log',
        meta: {
          title: '系统弹窗日志',
          i18nKey: 'route.sellers_popup-log'
        }
      }
    ]
  },
  {
    name: 'platform',
    path: '/platform',
    component: 'layout.base',
    redirect: '/platform/publish',
    meta: {
      title: '平台管理',
      i18nKey: 'route.platform',
      icon: 'mdi:clipboard-edit',
      order: 6
    },
    children: [
      {
        name: 'platform_publish',
        path: '/platform/publish',
        component: 'view.platform_publish',
        meta: {
          title: '发布内容',
          i18nKey: 'route.platform_publish'
        }
      }
    ]
  }
];

/** create routes when the auth route mode is static */
export function createStaticRoutes() {
  const constantRoutes: ElegantRoute[] = [];

  const authRoutes: ElegantRoute[] = [];

  [...customRoutes, ...generatedRoutes].forEach(item => {
    if (item.meta?.constant) {
      constantRoutes.push(item);
    } else {
      authRoutes.push(item);
    }
  });

  return {
    constantRoutes,
    authRoutes
  };
}

/**
 * Get auth vue routes
 *
 * @param routes Elegant routes
 */
export function getAuthVueRoutes(routes: ElegantConstRoute[]) {
  return transformElegantRoutesToVueRoutes(routes, layouts, views);
}
