import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

/* Layout */
import Layout from "@/layout";

/* Router Modules */
import componentsRouter from "./modules/components";
import chartsRouter from "./modules/charts";
import tableRouter from "./modules/table";
import nestedRouter from "./modules/nested";
import ajax from "@/utils/request";

Vue.prototype.$http = ajax;

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: "/redirect",
    component: Layout,
    hidden: true,
    children: [
      {
        path: "/redirect/:path*",
        component: () => import("@/views/redirect/index")
      }
    ]
  },
  {
    path: "/login",
    component: () => import("@/views/login/index"),
    hidden: true
  },
  {
    path: "/auth-redirect",
    component: () => import("@/views/login/auth-redirect"),
    hidden: true
  },
  {
    path: "/404",
    component: () => import("@/views/error-page/404"),
    hidden: true
  },
  {
    path: "/401",
    component: () => import("@/views/error-page/401"),
    hidden: true
  },
  {
    path: "/",
    component: Layout,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        component: () => import("@/views/dashboard/index"),
        name: "Dashboard",
        meta: { title: "首页", icon: "dashboard", affix: true }
      }
    ]
  }
];

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: "/log-config",
    component: Layout,
    meta: { title: "配置管理", icon: "component" },
    children: [
      {
        path: "storageConfig",
        component: () => import("@/views/log-config/storageConfig"),
        name: "storageConfig",
        meta: {
          title: "存储配置"
        }
      },
      {
        path: "routeConfig",
        component: () => import("@/views/log-config/routeConfig"),
        name: "routeConfig",
        meta: {
          title: "路由配置"
        }
      }
    ]
  },
  {
    path: "/log-stat",
    component: Layout,
    meta: { title: "日志统计", icon: "component" },
    children: [
      {
        path: "logStat",
        component: () => import("@/views/log-stat/logStat"),
        name: "logStat",
        meta: {
          title: "日志量统计"
        }
      },
      {
        path: "logGradeStat",
        component: () => import("@/views/log-stat/logGradeStat"),
        name: "logGradeStat",
        meta: {
          title: "日志评分"
        }
      }
    ]
  },
  {
    path: "/log-monitor",
    component: Layout,
    meta: { title: "日志监控", icon: "component" },
    children: [
      {
        path: "kafkaMonitor",
        component: () => import("@/views/log-monitor/kafkaMonitor"),
        name: "kafkaMonitor",
        meta: {
          title: "KAFKA监控"
        }
      },
      {
        path: "errInfoMonitor",
        component: () => import("@/views/log-monitor/errInfoMonitor"),
        name: "errInfoMonitor",
        meta: {
          title: "失败日志监控"
        }
      }
    ]
  },
  {
    path: "/log-errDeal",
    component: Layout,
    name: "errDeal",
    meta: { title: "失败处理", icon: "component" },
    children: [
      {
        path: "errInfoStat",
        component: () => import("@/views/log-errDeal/errInfoStat"),
        name: "errInfoStat",
        meta: {
          title: "失败量统计"
        }
      },
      {
        path: "errInfo",
        component: () => import("@/views/log-errDeal/errInfo"),
        name: "errInfoStat",
        meta: {
          title: "失败日志"
        }
      }
    ]
  },
  {
    path: "/log-system",
    component: Layout,
    meta: { title: "中心管理", icon: "component" },
    children: [
      {
        path: "",
        component: () => import("@/views/log-system/index"),
        name: "logSystem",
        meta: { title: "中心管理", icon: "component" }
      }
    ]
  },

  // 404 page must be placed at the end !!!
  { path: "*", redirect: "/404", hidden: true }
];

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const noAuthRoutes = [
  {
    path: "/dashboard",
    component: () => import("@/views/dashboard/index"),
    name: "Dashboard",
    meta: { title: "首页", icon: "dashboard", affix: true }
  }
];

const createRouter = () =>
  new Router({
    // mode: 'history', // require service support
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes
  });

const router = createRouter();

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter();
  router.matcher = newRouter.matcher; // reset router
}

export default router;
