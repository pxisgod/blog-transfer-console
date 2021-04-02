import request from "@/utils/request";

export function fetchList(data) {
  return request({
    url: "/logRoute/getRouteByLogInfo",
    method: "post",
    data
  });
}

export function saveRoute(data) {
  return request({
    url: "/logRoute/saveRoute",
    method: "post",
    data
  });
}

export function delRoute(data) {
  return request({
    url: "/logRoute/deleteRoute",
    method: "get",
    params: data
  });
}

/**
 *
 * @param {*} data {systemCode:px}
 */
export function flushCache(data) {
  return request({
    url: "/logRoute/flushCache",
    method: "get",
    params: data
  });
}

/**
 *
 * @param {*} data {systemCode:px}
 */
export function getStorageList(data) {
  return request({
    url: "/logStorage/pickableStorageList",
    method: "get",
    params: data
  });
}
/**
 *
 * @param {*} data {systemCode:px}
 */
export function getStorageTableList(data) {
  return request({
    url: "/logStorage/pickableStorageTableList",
    method: "get",
    params: data
  });
}

/**
 *
 * @param {*} data {systemCode:px}
 */
export function saveRouteInfo(data) {
  return request({
    url: "/logRoute/saveRouteInfo",
    method: "post",
    data
  });
}

/**
 *
 * @param {Object} params routeCode=px_route&isMaster=true
 */
export function getRouteInfo(params) {
  return request({
    url: "/logRoute/queryRefreshResult",
    method: "get",
    params
  });
}

export function getFlushState(params) {
  return request({
    url: "/logRoute/queryRefreshResult",
    method: "get",
    params
  });
}
