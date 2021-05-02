/*
 * @@Author: mingo.wang
 * @Date: 2020-10-20 15:46:58
 * @LastEditors: mingo.wang
 * @LastEditTime: 2021-05-03 00:50:55
 * @Description: /**
 * 初始化自动埋点
 *
 */
import TaroTrack, {overridePageMethods} from 'taro-track';
import { tracks } from './index';
import { document } from '@tarojs/runtime';

const bury = (config) => {
  // 这里是不买点的方法
  console.log('bury', config)
}

export const initAutoTrack = () => {
  // 埋点配置
  // TaroTrack.TaroTrack.init
  TaroTrack.init({
    callback: (config) => {
      // 获取dom上的 dataset
      const node = document?.querySelector?.(config.track.element) || {};
      const dataset = node?.dataset || {};

      bury({
        ...dataset,
        ...config.track.data,
      });
    },
    tracks: tracks,
  });

  overridePageMethods({
    // PV
    onShow: (config) => {
      const pageConfig = config.pageConfig;
      bury({
        symbol: 'view',
        pagePage: pageConfig.route,
        pageName: pageConfig.config.navigationBarTitleText,
      });
    },
    // tab点击
    onTabItemTap: (config) => {
      const tabConfig = config.lifeCircleConfig;
      bury({
        symbol: tabConfig.pagePath,
        tabIndex: tabConfig.index,
        tabText: tabConfig.text,
      });
    },
  });
};
