import request from "@/utils/request";

export function getBlogContent(data) {
  return request({
    url: "/blog/getBlogContent",
    method: "post",
    data
  });
}
