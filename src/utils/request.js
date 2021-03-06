import axios from "axios";
import { MessageBox, Message } from "element-ui";
import store from "@/store";
import { getToken } from "@/utils/auth";

if (process.env.NODE_ENV == "local") {
  //axios.defaults.baseURL = "/dev-api";
  axios.defaults.baseURL = "http://localhost:8080";
} else {
  if (process.env.NODE_ENV == "production") {
    axios.defaults.baseURL = "http://localhost:8080";
  } else {
    if (process.env.NODE_ENV == "development") {
      axios.defaults.baseURL = "http://104.168.202.52:8080";
    }
  }
}

axios.defaults.timeout = 60000;
//axios.defaults.withCredentials = true;
// create an axios instance
const service = axios.create({
  //withCredentials: true, // send cookies when cross-domain requests
  //timeout : 6000
  //headers: { "X-Requested-With": "XMLHttpRequest", Accept: "*/*" },
});

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers["X-Token"] = getToken();
    }
    //TODO: 可以对参数做一些修改
    return config;
  },
  error => {
    // do something with request error
    console.log(error); // for debug
    return Promise.reject(error);
  }
);

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data;

    // if the custom code is not 20000, it is judged as an error.
    if (res.code != 200) {
      Message({
        message: res.message || "Error",
        type: "error",
        duration: 5 * 1000
      });
      return Promise.reject(new Error(res.message || "Error"));
    } else {
      return res;
    }
  },
  error => {
    console.log("err" + error); // for debug
    Message({
      message: error.message,
      type: "error",
      duration: 5 * 1000
    });
    return Promise.reject(error);
  }
);

export default service;

export let ajax = axios.create({
  //baseURL: "/dev-api",
  //withCredentials: true, // send cookies when cross-domain requests
  //timeout : 6000,
  // 登录重定向问题解决
  //headers: { "X-Requested-With": "XMLHttpRequest", Accept: "*/*" },
  responseType: "json"
});
