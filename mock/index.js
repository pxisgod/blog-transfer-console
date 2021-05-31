import Mock from "mockjs";
import { param2Obj } from "../src/utils";

import user from "./user";
import role from "./role";
import article from "./article";
import search from "./remote-search";
import logRoute from "./logRoute";
import logSystem from "./logSystem";
import blog from "./blog";

const path = require("path");
var glob = require("glob");
var fs = require("fs"); //文件模块

const json404 = { code: 404, message: "本地数据找不到。" };
const json200 = { code: 200, message: "操作成功。" };

const mocks = [
  ...user,
  ...role,
  ...article,
  ...search,
  ...logRoute,
  ...logSystem,
  ...blog
];

// for front mock
// please use it cautiously, it will redefine XMLHttpRequest,
// which will cause many of your third-party libraries to be invalidated(like progress event).
export function mockXHR() {
  // mock patch
  // https://github.com/nuysoft/Mock/issues/300
  Mock.XHR.prototype.proxy_send = Mock.XHR.prototype.send;
  Mock.XHR.prototype.send = function() {
    if (this.custom.xhr) {
      this.custom.xhr.withCredentials = this.withCredentials || false;

      if (this.responseType) {
        this.custom.xhr.responseType = this.responseType;
      }
    }
    this.proxy_send(...arguments);
  };

  function XHR2ExpressReqWrap(respond) {
    return function(options) {
      let result = null;
      if (respond instanceof Function) {
        const { body, type, url } = options;
        // https://expressjs.com/en/4x/api.html#req
        result = respond({
          method: type,
          body: JSON.parse(body),
          query: param2Obj(url)
        });
      } else {
        result = respond;
      }
      return Mock.mock(result);
    };
  }

  for (const i of mocks) {
    Mock.mock(
      new RegExp(i.url),
      i.type || "get",
      XHR2ExpressReqWrap(i.response)
    );
  }
}

// for mock server
const responseFake = (url, type, respond) => {
  return {
    url: new RegExp(`/mock${url}`),
    type: type || "get",
    response(req, res) {
      if (respond == null) {
        var basePath = path.resolve(__dirname, "");
        basePath = basePath.substring(0, basePath.lastIndexOf("/"));
        var l = req.url.indexOf("?");
        var reqUrl = l == -1 ? req.url : req.url.substring(0, l);
        var mocks = glob.sync(basePath + reqUrl + ".json");
        if (mocks.length) {
          // var json = require(mocks[0]);
          fs.readFile(mocks[0], "utf-8", function(err, data) {
            if (err) {
              res.json("文件读取失败");
            } else {
              res.json(Mock.mock(JSON.parse(data)));
            }
          });
        } else {
          if (reqUrl.match(/add|save|del|delete|update/)) {
            res.json(Mock.mock(json200));
          } else {
            res.json(Mock.mock(json404));
          }
        }
      } else {
        res.json(
          Mock.mock(respond instanceof Function ? respond(req, res) : respond)
        );
      }
    }
  };
};

export default mocks.map(route => {
  return responseFake(route.url, route.type, route.response);
});
