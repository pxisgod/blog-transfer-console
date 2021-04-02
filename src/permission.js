import router from "./router";
import store from "./store";
import { Message } from "vortex-pc";
import NProgress from "nprogress"; // progress bar
import "nprogress/nprogress.css"; // progress bar style
import { getToken} from "@/utils/auth"; // get token from cookie
import getPageTitle from "@/utils/get-page-title";
import { login } from "@/api/user";
import { getQueryObject } from "@/utils";
import Cookies from "js-cookie";

NProgress.configure({ showSpinner: false }); // NProgress Configuration

const whiteList = ['/login','/auth-redirect']; // no redirect whitelist

router.beforeEach(async (to, from, next) => {
  // start progress bar
  NProgress.start();

  // set page title
  document.title = getPageTitle(to.meta.title);

  // determine whether the user has logged in
  //获取token
  const token = getToken();
  if (token) {
    // determine whether the user has obtained his permission roles through getInfo
    const hasRoles = store.getters.roles && store.getters.roles.length > 0;
    if (hasRoles) {
      next();
    } else {
      try {
        // get user info
        // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']
        const { roles } = await store.dispatch("user/getInfo");

        // generate accessible routes map based on roles
        const accessRoutes = await store.dispatch(
          "permission/generateRoutes",
          roles
        );

        // dynamically add accessible routes
        router.addRoutes(accessRoutes);

        // hack method to ensure that addRoutes is complete
        // set the replace: true, so the navigation will not leave a history record
        next({ ...to, replace: true });
      } catch (error) {
        // remove token and go to login page to re-login
        await store.dispatch("user/resetToken");
        Message.error(error || "Has Error");
        next(`/login?redirect=${to.path}`);
        NProgress.done();
      }
    }
  } else {
    //没有登录
    /* has no token*/
    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next();
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      //login();
      next(`/login?redirect=${to.path}`)
    }
  }
});

router.afterEach(() => {
  // finish progress bar
  NProgress.done();
});
