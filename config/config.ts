import { defineConfig } from 'umi';
import define from './define';
import plugins from './plugins';
import routes from './routes';

const outputDir = `dist/${process.env.APP_ENV || 'dev'}`;
// 站点 origin base 路径（子路径部署如 GitHub Pages 设为 /repo/；默认 /）。public/ 下的本地静态资源按此前缀引用
const basePath = process.env.APP_BASE_PATH || '/';
// 静态资源 URL 前缀：优先 CDN，其次子路径 base，默认 /。public/ 下文件不经 webpack，需手动拼接
const publicPath = process.env.APP_CDN_URL || process.env.APP_BASE_PATH || '/';

export default defineConfig({
  define,
  /**
   * @name 开启 hash 模式
   * @description 让 build 之后的产物包含 hash 后缀。通常用于增量发布和避免浏览器加载缓存。
   * @doc https://umijs.org/docs/api/config#hash
   */
  hash: true,
  /**
   * @name 兼容性设置
   * @description 设置目标浏览器兼容性
   * @doc https://umijs.org/docs/api/config#targets
   */
  targets: {
    chrome: 79,
    firefox: 78,
    safari: 14,
    edge: 79,
  },
  /**
   * @name 路由的配置，不在路由中引入的文件不会编译
   * @description 只支持 path，component，routes，redirect，wrappers，title 的配置
   * @doc https://umijs.org/docs/guides/routes
   */
  // umi routes: https://umijs.org/docs/routing
  routes,
  /**
   * @name 主题的配置
   * @description 虽然叫主题，但是其实只是 less 的变量设置
   * @doc antd的主题设置 https://ant.design/docs/react/customize-theme-cn
   * @doc umi 的theme 配置 https://umijs.org/docs/api/config#theme
   */
  theme: {
    // 如果不想要 configProvide 动态设置主题需要把这个设置为 default
    // 只有设置为 variable， 才能使用 configProvide 动态设置主色调
    'root-entry-name': 'variable',
  },
  /**
   * @name moment 的国际化配置
   * @description 如果对国际化没有要求，打开之后能减少js的包大小
   * @doc https://umijs.org/docs/api/config#ignoremomentlocale
   */
  ignoreMomentLocale: true,
  /**
   * @name <head> 中额外的 script
   * @description 配置 <head> 中额外的 script
   */
  headScripts: [
    // 解决首次加载时白屏的问题
    { src: `${basePath}scripts/loading.js`, async: true },
    // iconfont Symbol 方案 —— 本地化的 JS 文件
    { src: `${basePath}iconfont/iconfont.js` },
  ],
  plugins,
  /**
   * @name antd 插件
   * @description 内置了 babel import 插件
   * @doc https://umijs.org/docs/max/antd#antd
   */
  antd: {},
  /**
   * 一个全局的初始数据流，可以用它在插件之间共享数据
   * @description 可以用来存放一些全局的数据，比如用户信息，或者一些全局的状态，全局初始状态在整个 Umi 项目的最开始创建。
   * @doc https://umijs.org/docs/max/data-flow#%E5%85%A8%E5%B1%80%E5%88%9D%E5%A7%8B%E7%8A%B6%E6%80%81
   */
  initialState: {},
  /**
   * @name 数据流插件
   * @@doc https://umijs.org/docs/max/data-flow
   */
  model: {},
  /**
   * @name 国际化插件（已关闭，使用自建 react-intl Provider）
   * @doc https://umijs.org/docs/max/i18n
   */
  // locale: {
  //   default: 'zh-CN',
  //   baseSeparator: '-',
  // },
  /**
   * @name 网络请求配置
   * @description 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
   * @doc https://umijs.org/docs/max/request
   */
  // request: {
  //   dataField: 'data',
  // },
  styledComponents: {},
  // 子路径部署（如 GitHub Pages）通过 APP_BASE_PATH 注入 publicPath 与路由 base；默认 / 兼容根路径部署（Docker）
  publicPath,
  base: basePath,
  // favicon 写入静态 HTML，避免子路径部署下浏览器默认请求 /favicon.ico 404
  links: [{ rel: 'icon', href: `${publicPath}favicon.ico` }],
  outputPath: outputDir,
  // end plugins
  mfsu: false,
  npmClient: 'pnpm',
  // 使用terser进行代码压缩
  jsMinifier: 'terser',
  jsMinifierOptions: {
    // terser配置，各环境可以在各自配置文件中覆盖
    compress: {
      drop_console: false,
      drop_debugger: true,
    },
  },
});
