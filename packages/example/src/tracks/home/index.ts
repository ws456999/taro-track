/*
 * @@Author: mingo.wang
 * @Date: 2020-10-20 14:35:17
 * @LastEditors: mingo.wang
 * @LastEditTime: 2021-05-03 00:53:22
 * @Description: pages/share/index页面埋点配置
 */
export default {
  'pages/home/index': [
    {
      element: '#only-bury',
      data: {
        symbol: 'only-bury',
      },
    },
    {
      element: '#bury-with-dataset',
      data: {
        symbol: 'bury-with-dataset',
      },
    },
  ],
};
