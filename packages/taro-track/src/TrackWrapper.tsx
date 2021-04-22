/*
 * @@Author: ws456999
 * @Date: 2020-10-17 14:56:31
 * @LastEditors: mingo.wang
 * @LastEditTime: 2021-04-22 11:36:04
 * @Description: 小程序监听埋点组件
 */
import { View } from '@tarojs/components'
import type { FC } from 'react'
import * as React from 'react'
import autoTrack from './taroTrack'

export const TrackWrapper: FC = (props) => {
  const { children } = props
  return (
    <View onClick={autoTrack.elementTracker}>
      {children}
    </View>
  )
}
