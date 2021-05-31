export default [
  {
    url: "/blog/getBlogContent",
    type: "post",
    response: config => {
      return {
        code: 200,
        data: {
          blogType: "CSDN_BLOG",
          title: "测试",
          content: "# hello what's up"
        }
      };
    }
  }
];
