/* eslint-disable */

/*
 * @@Author: mingo.wang
 * @Date: 2020-10-12 14:32:23
 * @LastEditors: mingo.wang
 * @LastEditTime: 2020-10-23 14:49:57
 * @Description: 头部注释
 */
// 需要代理的生命周期钩子，包含Page和Component的钩子

const proxyMethods = [
  'onShow',
  'onHide',
  'onReady',
  'onLoad',
  'onUnload',
  'created',
  'attached',
  'ready',
  'moved',
  'detached',
  'onTabItemTap',
  'onPullDownRefresh',
  'onReachBottom',
  'onPageScroll',
  'onResize',
  'onTitleClick',
  'onOptionMenuClick',
  'onPopMenuClick',
  'onPullIntercept',
  'onAddToFavorites',
] as const;

/**
 * 获取微信原生Page
 * @returns {WechatMiniprogram.Page.Constructor}
 */
export function getWxPage(): WechatMiniprogram.Page.Constructor {
  return Page;
}

/**
 * 重写微信原生Page
 * @param newPage
 */
export function overrideWxPage(newPage: any): void {
  Page = newPage;
}

type OverMehodsProps = Partial<
  Record<
    typeof proxyMethods[number],
    (config: { pageConfig: any; lifeCircleConfig: any }) => void
  >
>;

export function overridePageMethods(overMehods: OverMehodsProps): void {
  const originPage = getWxPage();
  const page = (config: any) => {
    Object.keys(overMehods).forEach((key) => {
      const originMethod = config[key];
      config[key] = function (props: any) {
        // 记录埋点
        overMehods[key as keyof OverMehodsProps]?.({
          pageConfig: this,
          lifeCircleConfig: props,
        });
        return originMethod.call(this, props);
      };
    });
    originPage(config);
  };
  overrideWxPage(page);
}
