import request from "@/utils/request";

export function getOffset(query) {
  return request({
    url: "/kafkaOffsetMonitor/getOffset",
    method: "get",
    params: query
  });
}

export function getOffsetTrend(data) {
  return request({
    url: "/kafkaOffsetMonitor/getOffsetTrend",
    method: "post",
    data
  });
}

export function getEsOffset(query) {
  return request({
    url: "/esOffsetMonitor/getOffset",
    method: "get",
    params: query
  });
}

export function getEsOffsetTrend(data) {
  return request({
    url: "/esOffsetMonitor/getOffsetTrend",
    method: "post",
    data
  });
}
