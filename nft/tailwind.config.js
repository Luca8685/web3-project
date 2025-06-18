// 导出一个配置对象，这个对象是 Tailwind CSS 的配置信息，会被 Tailwind CSS 编译器读取并应用
module.exports = {
  // content 选项用于指定 Tailwind CSS 需要扫描哪些文件来生成对应的 CSS 类
  // 这里配置的是扫描 src 目录下所有的 .js、.jsx、.ts 和 .tsx 文件
  // 这样 Tailwind CSS 会分析这些文件中使用到的 Tailwind CSS 类名，只生成这些被使用到的类的 CSS 代码，从而减少生成的 CSS 文件大小
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  // theme 选项用于自定义 Tailwind CSS 的默认主题样式
  // 可以在这里修改颜色、字体、间距等各种样式属性
  theme: {
    // extend 子选项用于在 Tailwind CSS 默认主题的基础上进行扩展
    // 例如添加自定义的颜色、字体等，当前为空，表示不进行扩展，使用 Tailwind CSS 的默认主题
    extend: {},
  },
  // plugins 选项用于添加 Tailwind CSS 的插件
  // 插件可以扩展 Tailwind CSS 的功能，比如添加新的实用类、变体等，当前为空，表示不使用任何插件
  plugins: [],
}