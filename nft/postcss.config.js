// 导出一个配置对象，该对象用于配置 PostCSS 的插件
module.exports = {
  // plugins 属性用于指定要使用的 PostCSS 插件
  plugins: {
    // 引入 Tailwind CSS 插件
    // Tailwind CSS 是一个功能强大的 CSS 框架，它提供了大量的实用类，可以帮助开发者快速构建用户界面。
    // 在 PostCSS 中使用 Tailwind CSS 插件，可以让 Tailwind CSS 的功能与 PostCSS 的工作流程集成。
    tailwindcss: {},
    // 引入 Autoprefixer 插件
    // Autoprefixer 是一个 PostCSS 插件，它可以自动为 CSS 属性添加浏览器前缀。
    // 不同的浏览器对 CSS 属性的支持程度不同，有些属性需要添加特定的前缀才能在某些浏览器中正常工作。
    // Autoprefixer 会根据你指定的浏览器兼容性配置，自动为 CSS 属性添加必要的前缀，从而提高代码的兼容性。
    autoprefixer: {},
  },
}