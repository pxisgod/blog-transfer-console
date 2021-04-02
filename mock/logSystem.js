export default [
  {
    url: "/logSystem/getLogSystem",
    type: "post",
    response: config => {
      return require("./logSystem/list.json");
    }
  },
  {
    url: "/logSystem/getAllLogSystem",
    type: "get",
    response: config => {
      return require("./logSystem/list.json");
    }
  }
];
