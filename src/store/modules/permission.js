import { asyncRoutes, constantRoutes, noAuthRoutes } from "@/router";
import { menu } from "@/api/user";
/* Layout */
import Layout from "@/layout";

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role));
  } else {
    return true;
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = [];

  routes.forEach(route => {
    const tmp = { ...route };
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles);
      }
      res.push(tmp);
    }
  });

  return res;
}

const state = {
  routes: [],
  addRoutes: []
};

const mutations = {
  SET_ROUTES: (state, routes) => {
    //之后要改回来
    //state.addRoutes = routes;
    state.addRoutes = constantRoutes;
    //之后要改回来
    //state.routes = routes;
    state.routes = constantRoutes.concat(routes);
  }
};

const actions = {
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      if (roles.includes("no_auth")) {
        let accessedRoutes;

        accessedRoutes = noAuthRoutes || [];

        commit("SET_ROUTES", accessedRoutes);

        resolve(accessedRoutes);
      } else {
        menu().then(response => {
          const loadMenuData = [];

          let data = response.data;

          Object.assign(loadMenuData, data);
          /*const tempAsyncRoutes = Object.assign([], asyncRoutes);*/

          const tempAsyncRoutes = [];

          generalMenu(tempAsyncRoutes, loadMenuData, "");

          let accessedRoutes;

          //accessedRoutes = tempAsyncRoutes || [];
          accessedRoutes = filterAsyncRoutes(asyncRoutes, roles);

          commit("SET_ROUTES", accessedRoutes);

          resolve(accessedRoutes);
        });
      }
    });
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};

/**
 * 后台查询的菜单数据拼装成路由格式的数据
 * @param routes
 */
export function generalMenu(routes, data, parentPath) {
  if (routes) {
    data.forEach(item => {
      const menu = {
        path: item.path,
        component: Layout,
        children: [],
        name: item.title,
        meta: {
          title: item.title,
          icon: item.icon
        }
      };
      if (item.childrenMenuList && item.childrenMenuList.length != 0) {
        if (parentPath == "") {
          generalMenu(
            menu.children,
            item.childrenMenuList,
            parentPath + item.path
          );
        } else {
          generalMenu(
            menu.children,
            item.childrenMenuList,
            parentPath + "/" + item.path
          );
        }
      } else {
        if (parentPath == "") {
          //menu.meta.affix=true;
          menu.component = () =>
            import("@/views" + parentPath + item.path + "/index");
        } else {
          menu.component = () =>
            import("@/views" + parentPath + "/" + item.path);
        }
      }
      routes.push(menu);
    });
  }
}
