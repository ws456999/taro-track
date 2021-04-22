/*
 * @@Author: ws456999
 * @Date: 2020-10-17 18:09:10
 * @LastEditors: mingo.wang
 * @LastEditTime: 2021-04-22 11:37:40
 * @Description: 小程序无埋点方案
 */
import type { ITouchEvent } from '@tarojs/components'
import { overridePageMethods } from './overridePageMethods'

type Track = {
  element: string
  data: {
    symbol: string
    [key: string]: unknown
  }
}

type GlobalTrack = {
  global?: Track[]
}
type Tracks =
  | {
      [key: string]: Track[]
    }
  | GlobalTrack

type Trackcallback = (props: { event: ITouchEvent; track: Track }) => void

/** 获取当前page */
const getActivePage = (): unknown => {
  const curPages = getCurrentPages()
  if (curPages.length) {
    return curPages[curPages.length - 1]
  }
  return {}
}

/**
 * 获取BoundingClientRect
 * @param element
 */
const getBoundingClientRect = (element: string) => {
  return new Promise<{
    boundingClientRect: [WechatMiniprogram.BoundingClientRectCallbackResult]
    scrollOffset: WechatMiniprogram.ScrollOffsetCallbackResult
  }>((reslove) => {
    const query = wx.createSelectorQuery()
    query.selectAll(element).boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(
      (
        res: [
          [WechatMiniprogram.BoundingClientRectCallbackResult],
          WechatMiniprogram.ScrollOffsetCallbackResult
        ]
      ) => {
        reslove({ boundingClientRect: res[0], scrollOffset: res[1] })
      }
    )
  })
}

/**
 * 判断是否点击区域
 *
 * @param event
 * @param boundingClientRect
 * @param scrollOffset
 */
const isClickTrackArea = (
  event: ITouchEvent,
  boundingClientRect: WechatMiniprogram.BoundingClientRectCallbackResult,
  scrollOffset: WechatMiniprogram.ScrollOffsetCallbackResult
) => {
  if (!boundingClientRect) return false
  const { x, y } = event.detail // 点击的x y坐标
  const { left, right, top, height } = boundingClientRect
  const { scrollTop } = scrollOffset
  if (
    left < x &&
    x < right &&
    scrollTop + top < y &&
    y < scrollTop + top + height
  ) {
    return true
  }
  return false
}

class TaroTrack {
  /**
   * 无埋点配置
   *
   * @type {Track}
   * @memberof Caterpillar
   */
  private autoTracks: Tracks = {}
  private callback: Trackcallback = () => {
    // empty function needed to rewrite
  }

  /**
   * 注册无埋点配置
   *
   * @memberof Caterpillar
   */
  public init = (config: {
    tracks: Tracks
    /**
     * 埋点书法回调
     */
    callback: Trackcallback
  }): void => {
    this.autoTracks = config.tracks
    this.callback = config.callback
  }
  /**
   * 劫持page生命周期
   *
   * @memberof TaroTrack
   */
  public overridePageMethods = overridePageMethods

  /**
   * get path track
   *
   * @memberof AutoTrack
   */
  private getTrack = (path: keyof Tracks): Track[] => {
    return this.autoTracks[path] || []
  }

  /**
   * 小程序无埋点事件
   * 根据页面路径设置需要埋点的配置
   * global namespace表全局监听的配置
   *
   * @memberof Caterpillar
   */
  public elementTracker = (e: ITouchEvent): void => {
    const routePath = (getActivePage() as any).route
    const activeTracks = [
      ...this.getTrack(routePath),
      ...this.getTrack('global'),
    ]
    // 节点携带id
    const targetId = e.target.id
    const targetTrack = activeTracks.find(
      (item) => item.element === `#${targetId}`
    )
    if (targetTrack) {
      this.callback?.({
        event: e,
        track: targetTrack,
      })
      return
    }

    activeTracks.forEach((track) => {
      getBoundingClientRect(track.element).then((res) => {
        res.boundingClientRect.forEach(
          (item: WechatMiniprogram.BoundingClientRectCallbackResult) => {
            const isHit = isClickTrackArea(e, item, res.scrollOffset)
            if (isHit) {
              this.callback?.({
                event: e,
                track,
              })
            }
          }
        )
      })
    })
  }
}

const taroTrack = new TaroTrack()
export default taroTrack;
