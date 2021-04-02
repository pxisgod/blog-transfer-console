const tokens = {
  admin: {
    token: "admin-token"
  },
  editor: {
    token: "editor-token"
  }
};

const users = {
  "admin-token": {
    roles: ["admin"],
    introduction: "I am a super administrator",
    avatar:
      "https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif",
    name: "Super Admin"
  },
  "editor-token": {
    roles: ["editor"],
    introduction: "I am an editor",
    avatar:
      "https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif",
    name: "Normal Editor"
  }
};

export default [
  // user login
  {
    url: "/user/login",
    type: "post",
    response: config => {
      const { username } = config.body;
      const token = tokens[username];

      // mock error
      if (!token) {
        return {
          code: 60204,
          message: "Account and password are incorrect."
        };
      }

      return {
        code: 200,
        data: token
      };
    }
  },

  // get user info
  {
    url: "/user/info",
    type: "get",
    response: config => {
      const { token } = config.query;
      const info = users[token];

      // mock error
      if (!info) {
        return {
          code: 50008,
          message: "Login failed, unable to get user details."
        };
      }

      return {
        code: 200,
        data: info
      };
    }
  },

  // user menu
  {
    url: "/user/menu",
    type: "post",
    response: _ => {
      return {
        data: [{
          childrenMenuList: [],
          icon: "dashboard",
          id: 170206,
          path: "/dashboard",
          title: "首页"
        },
          {
            childrenMenuList: [{
              childrenMenuList: [],
              icon: "component",
              id: 170213,
              path: "storageConfig",
              title: "存储配置 "
            }, {
              childrenMenuList: [],
              icon: "component",
              id: 170214,
              path: "routeConfig",
              title: "路由配置"
            }],
            icon: "component",
            id: 170212,
            path: "/log-config",
            title: "配置管理"
          },
          {
            childrenMenuList: [{
              childrenMenuList: [],
              icon: "component",
              id: 170216,
              path: "logStat",
              title: "日志量统计 "
            }, {
              childrenMenuList: [],
              icon: "component",
              id: 170217,
              path: "logGradeStat",
              title: "日志评分"
            }],
            icon: "component",
            id: 170215,
            path: "/log-stat",
            title: "日志统计"
          }
        ],
        code: 200
      };
    }
  },

  // user logout
  {
    url: "/user/logout",
    type: "post",
    response: _ => {
      return {
        code: 200,
        data: "success"
      };
    }
  }
];
