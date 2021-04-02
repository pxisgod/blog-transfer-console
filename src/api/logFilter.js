import request from "@/utils/request";

/**
 *
 * @param {Object} data
 * {
    "systemCode": "px",
    "logType": "AUDIT_LOG_TYPE",
    "operatorType": "login"
}
 */
export function getLogFilter(data) {
  return request({
    url: "/logRoute/getLogFilter",
    method: "get",
    params: data
  });
}

export function saveFilter(data) {
  return request({
    url: "/logRoute/saveLogFilter",
    method: "post",
    data
  });
}

export function getLogTable(data) {
  return request({
    url: "/logRoute/getLogTable",
    method: "get",
    params: data
  });
}

export function getDistributeFilter(data) {
  return request({
    url: "/logRoute/getDistributeLogFilter",
    method: "post",
    data
  });
}

export function saveDistributeFilter(data) {
  return request({
    url: "/logRoute/saveDistributeLogFilter",
    method: "post",
    data
  });
}

export function getDistributeMapper(data) {
  return request({
    url: "/logRoute/getDistributeLogMapper",
    method: "post",
    data
  });
}
