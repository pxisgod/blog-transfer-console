import request from "@/utils/request";

export function getLogStat(data) {
  return request({
    url: "/logStat/getLogStat",
    method: "post",
    data
  });
}

export function getLogStatTrend(data) {
  return request({
    url: "/logStat/getLogStatTrend",
    method: "post",
    data
  });
}

export function getLogGradeStat(data) {
  return request({
    url: "/logStat/getLogGradeStat",
    method: "post",
    data
  });
}

export function getLogGradeStatTrend(data) {
  return request({
    url: "/logStat/getLogGradeStatTrend",
    method: "post",
    data
  });
}

export function statAll() {
  return request({
    url: "/logStat/statAll",
    method: "get"
  });
}

export function dateQuantity() {
  return request({
    url: "/logStat/dateQuantity",
    method: "get"
  });
}

export function statCenter() {
  return request({
    url: "/logStat/statCenter",
    method: "get"
  });
}

export function typeRatio() {
  return request({
    url: "/logRoute/typeRatio",
    method: "get"
  });
}
