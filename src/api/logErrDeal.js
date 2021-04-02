import request from "@/utils/request";

export function getErrInfoStat(data) {
  return request({
    url: "/logErrDeal/getErrInfoStat",
    method: "post",
    data
  });
}

export function getErrInfo(data) {
  return request({
    url: "/logErrDeal/getErrInfo",
    method: "post",
    data
  });
}

export function updateStateToWaitDeal(data) {
  return request({
    url: "/logErrDeal/updateStateToWaitDeal",
    method: "post",
    data
  });
}

export function updateStateToWaitDealSingle(data) {
  return request({
    url: "/logErrDeal/updateStateToWaitDealSingle",
    method: "get",
    params: data
  });
}
