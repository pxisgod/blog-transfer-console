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
export function getLogTable(data) {
  return request({
    url: "/logRoute/getLogTable",
    method: "get",
    params: data
  });
}

export function saveLogTable(data) {
  return request({
    url: "/logRoute/saveLogTable",
    method: "post",
    data
  });
}

export function pickableStorageList(systemCode, storageType) {
  return request({
    url: "/logStorage/pickableStorageList",
    method: "get",
    params: { systemCode: systemCode, storageType: storageType }
  });
}

export function getTableCols(data) {
  return request({
    url: "/logStorage/getTableCols",
    method: "get",
    params: data
  });
}
