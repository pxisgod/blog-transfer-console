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
export function getLogGrade(data) {
  return request({
    url: "/logRoute/getLogGrade",
    method: "get",
    params: data
  });
}

export function saveLogGrade(data) {
  return request({
    url: "/logRoute/saveLogGrade",
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
