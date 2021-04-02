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
export function getLogMapper(data) {
  return request({
    url: "/logRoute/getLogMapper",
    method: "get",
    params: data
  });
}

export function saveLogMapper(data) {
  return request({
    url: "/logRoute/saveLogMapper",
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

export function getDistributeMapper(data) {
  return request({
    url: "/logRoute/getDistributeLogMapper",
    method: "post",
    data
  });
}

export function saveDistributeMapper(data) {
  return request({
    url: "/logRoute/saveDistributeLogMapper",
    method: "post",
    data
  });
}
