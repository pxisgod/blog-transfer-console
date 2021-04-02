import Mock from "mockjs";

const NameList = [];
const count = 100;

for (let i = 0; i < count; i++) {
  NameList.push(
    Mock.mock({
      name: "@first"
    })
  );
}
NameList.push({ name: "mock-Pan" });

export default [
  // username search
  {
    url: "/search/user",
    type: "get",
    response: config => {
      const { name } = config.query;
      const mockNameList = NameList.filter(item => {
        const lowerCaseName = item.name.toLowerCase();
        return !(name && lowerCaseName.indexOf(name.toLowerCase()) < 0);
      });
      return {
        code: 200,
        data: { items: mockNameList }
      };
    }
  },

  // transaction list
  {
    url: "/transaction/list",
    type: "get",
    response: _ => {
      return {
        code: 200,
        data: {
          total: 20,
          "items|20": [
            {
              center: "cust",
              total: Mock.Random.integer(1, 10000),
              success: Mock.Random.integer(1, 100),
              error: Mock.Random.integer(1, 100),
              invalid: Mock.Random.integer(1, 100)
            }
          ]
        }
      };
    }
  }
];
