/*
 * @@Author: mingo.wang
 * @Date: 2020-10-13 19:12:45
 * @LastEditors: mingo.wang
 * @LastEditTime: 2021-04-22 11:45:24
 * @Description: taro自动注入埋点代码
 */

const PLUGIN_NAME = 'TaroAutoTrackPlugin'

const isReg = (reg) => reg instanceof RegExp;
const isString = (str) => typeof str === 'string';

const isMatch = (path, rules = []) => {
  return rules.some((rule) => {
    if (isReg(rule)) {
      return rule.test(path);
    }
    if (isString(rule)) {
      return path.indexOf(rule) > -1;
    }
  })
}

const defaultOpts = {
  excludes: [],
  // 默认注册pages下第一层的.tsx文件
  includes: [/src\/pages\/(\w+)\/(\w+)\.tsx?$/],
}

class TaroAutoTrackPlugin {
  constructor(options) {
    this.opts = options || defaultOpts;
  }
  apply(compiler) {
    compiler.hooks.normalModuleFactory.tap(
      PLUGIN_NAME,
      (loaderContext) => {
        loaderContext.hooks.afterResolve.tap(
          'NormalModuleReplacementPlugin',
          (result) => {
            if (!result || !result.resource) return result
            const {
              excludes = defaultOpts.excludes,
              // 默认注册pages下第一层的.tsx文件
              includes = defaultOpts.includes,
            } = this.opts;

            // 如果是匹配到excludes
            if (isMatch(result.resource, excludes)) {
              return result
            }

            // 如果是匹配到includes
            // 执行前loader添加本地loader，修改源文件
            if (isMatch(result.resource, includes)) {
              result.loaders.push({
                loader: require.resolve('./loader/index'), // Path to loader
                options: {},
              })
              // 暂不清楚为什么这里taro会执行两次，导致loader重复，故去重
              for (let i = result.loaders.length - 1; i > 0; i--) {
                var index = result.loaders.findIndex(t => t.loader === result.loaders[i].loader);
                if (index !== i) result.loaders.splice(i, 1)
              }
            }

            return result
          }
        )
      }
    )
  }
}

module.exports = TaroAutoTrackPlugin
