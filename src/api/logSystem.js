import request from "@/utils/request";

export function getList(data) {
  return request({
    url: "/logSystem/getLogSystem",
    method: "post",
    data
  });
}

export function create(data) {
  return request({
    url: "/logSystem/insertLogSystem",
    method: "post",
    data
  });
}

export function update(data) {
  return request({
    url: "/logSystem/updateLogSystem",
    method: "post",
    data
  });
}
export function del(row) {
  return request({
    url: "/logSystem/deleteLogSystem",
    method: "get",
    params: { systemCode: row.systemCode }
  });
}

let allSystem = null;

export async function getAll() {
  if (allSystem) return allSystem;
  let rsp = await request({
    url: "/logSystem/getAllLogSystem",
    method: "get"
  });
  allSystem = rsp.data;
  return allSystem;
}

export async function getPickableSystemList(data) {
  return request({
    url: "/logSystem/getPickableSystemList",
    method: "get",
    params: data
  });
}
