import request from "@/utils/request";

export function getRouteBySystemCode(query) {
  return request({
    url: "/logRoute/getRouteBySystemCode",
    method: "post",
    params: query
  });
}
