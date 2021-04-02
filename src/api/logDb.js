import request from "@/utils/request";

export function getLogDb(data) {
  return request({
    url: "/logRoute/getLogDb",
    method: "get",
    params: data
  });
}

export function saveLogDb(data) {
  return request({
    url: "/logRoute/saveLogDb",
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
