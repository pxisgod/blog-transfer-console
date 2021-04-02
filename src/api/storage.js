import request from "@/utils/request";

export function fetchList(data) {
  return request({
    url: "/logStorage/getStorageBySystemCode",
    method: "post",
    data
  });
}

export function fetchStorage(storageCode) {
  return request({
    url: "/logStorage/getStorageByCode",
    method: "get",
    params: { storageCode }
  });
}

export function fetchStorageParam(storageCode, isMaster) {
  return request({
    url: "/logStorage/getStorageParamByCode",
    method: "get",
    params: { storageCode: storageCode, isMaster: isMaster }
  });
}

export function createStorage(data) {
  return request({
    url: "/logStorage/saveStorage",
    method: "post",
    data
  });
}

export function createStorageParam(data) {
  return request({
    url: "/logStorage/saveStorageParam",
    method: "post",
    data
  });
}

export function updateStorage(data) {
  return request({
    url: "/logStorage/saveStorage",
    method: "post",
    data
  });
}
export function delStorage(storageCode) {
  return request({
    url: "/logStorage/deleteStorage",
    method: "get",
    params: { storageCode: storageCode }
  });
}

export function checkLink(data) {
  return request({
    url: "/logStorage/checkLink",
    method: "post",
    data
  });
}
