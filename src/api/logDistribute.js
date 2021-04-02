import request from "@/utils/request";

export function getDistributeList(params) {
  return request({
    url: "/logRoute/getLogDistributorsList",
    method: "get",
    params
  });
}

export function saveDistribute(data) {
  return request({
    url: "/logRoute/saveLogDistributors",
    method: "post",
    data
  });
}

export function deleteDistribute(data) {
  return request({
    url: "/logRoute/deleteLogDistributors",
    method: "post",
    data
  });
}
