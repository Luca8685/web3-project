import { Providers } from "@src/Providers";
import type { AppProps } from "next/app";
import Head from "next/head";
import Router from "next/router";
import { useRef, useState, useEffect } from "react";
import "antd/dist/antd.css";
import "@src/styles/global.scss";

import { listenToWallet } from "@src/hooks/useWallet";
import { useResponsiveInit } from "@src/hooks/useResponsive";

import { Layout } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import AppHeader from "@src/containers/Header/Header";
import AppFooter from "@src/containers/Footer/Footer";
import WalletModal from "@src/containers/WalletModal/WalletModal";

// Providers：自定义的上下文提供者组件，用于提供全局状态或服务。
// AppProps：Next.js 提供的类型定义，用于描述传递给 MyApp 组件的属性。
// Head：Next.js 提供的组件，用于修改页面的 <head> 标签内容。
// Router：Next.js 的路由对象，可用于监听路由事件。
// useRef, useState, useEffect：React 的钩子函数，分别用于创建可变的 ref 对象、管理组件状态和处理副作用。
// antd/dist/antd.css：Ant Design 组件库的样式文件。
// @src/styles/global.scss：全局样式文件。
// listenToWallet：自定义钩子中的函数，用于监听钱包状态。
// useResponsiveInit：自定义钩子，用于初始化响应式布局。
// Layout：Ant Design 的布局组件。
// LoadingOutlined：Ant Design 的加载图标组件。
// AppHeader, AppFooter：自定义的头部和底部组件。
// WalletModal：自定义的钱包模态框组件。

//通过 declare global 扩展全局 window 对象，添加了一些自定义属性，以便在代码中使用这些属性时不会出现类型错误。
declare global {
  interface Window {
    TWidgetLogin: any;
    message: any;
    ethereum: any;
    Telegram: any;
    addRegisterAmount: any;
    MSStream: any;
    BinanceChain: any;
  }
}

//该组件返回一个 Head 组件，用于设置页面的标题、引入字体、设置视口和页面描述等元数据。
//通过内联样式设置了根元素的自定义属性 --header-height，并根据不同的屏幕宽度进行了响应式调整。
function Header() {
  return (
    <Head>
      <title>C2N</title>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Roboto&display=swap"
        rel="stylesheet"
      />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"
      />
      <meta
        name="description"
        content="C2N is the first exclusive launchpad for decentralized fundraising in Boba ecosystem, offering the hottest and innovative projects in a fair, secure, and efficient way."
      />
      <style>
        {`
        :root {
          --header-height: 110px;
        }

        @media (max-width: 769px) {
          :root {
            --header-height: 65px;
          }
        }
      `}
      </style>
    </Head>
  );
}

function Wrapper({ Component, pageProps }) {
  const { Content } = Layout;
  const [routeLoading, setRouteLoading] = useState<boolean>(false); //routeLoading 状态用于控制是否显示路由加载提示。

  const view = useRef(null);

  //通过 Router.events 监听路由变化事件，当路由开始变化时，设置 routeLoading 为 true，显示加载提示；
  //当路由变化完成时，将页面滚动到顶部，并设置 routeLoading 为 false，隐藏加载提示。
  Router.events.on("routeChangeStart", () => {
    setRouteLoading(true);
  });
  Router.events.on("routeChangeComplete", () => {
    view.current && (view.current.scrollTop = 0);
    setRouteLoading(false);
  });
  //调用 listenToWallet 函数监听钱包状态
  listenToWallet();
  //调用 useResponsiveInit 钩子初始化响应式布局。
  useResponsiveInit();

  //组件返回一个包含头部、主体内容和底部的布局，主体内容通过 Component 组件渲染具体页面，并传递 pageProps 属性。
  return (
    <div className="main-wrapper">
      {routeLoading ? (
        <div className="route-loading">
          <div className="modal">
            <LoadingOutlined />
          </div>
        </div>
      ) : (
        <></>
      )}
      <AppHeader />
      <div className="main-body" ref={view}>
        <Content>
          <Component {...pageProps} />
          <AppFooter />
        </Content>
      </div>
      <style>{`
        .route-loading {
          position: fixed;
          width: 100vw;
          height: 100vh;
          background-color: #00000077;
          z-index: 99999;
        }
        .route-loading .modal {
          width: 120px;
          height: 120px;
          border-radius: 18px;
          position: fixed;
          top: 50%;
          left: 50%;
          background-color: #000000e0;
          transform: translate(-50%, -50%);
          line-height: 120px;
          text-align: center;
          font-size: 0.72rem;
          color: #ffffff;
        }
      `}</style>
    </div>
  );
}
export default function MyApp({ Component, pageProps }: AppProps) {
  //使用 useEffect 钩子在组件挂载时获取 URL 中的 aff 参数，如果存在则将其存储到本地存储中。
  //返回一个包裹了 Providers、Header、WalletModal 和 Wrapper 组件的 JSX 元素，
  //Providers 提供全局上下文，Header 设置页面头部信息，WalletModal 提供钱包交互模态框，Wrapper 提供页面布局和路由加载提示。
  // comsume referralcode
  useEffect(() => {
    let search, params, aff;
    if (typeof window !== "undefined") {
      search = window.location.search;
      params = new URLSearchParams(search);
      aff = params.get("aff");
      if (aff) {
        window.localStorage.setItem("referral", aff);
      }
    }
  }, []);

  return (
    <Providers>
      <Header />
      <WalletModal />
      <Wrapper pageProps={pageProps} Component={Component} />
    </Providers>
  );
}

/**
 1. Component
用途：Component 代表的是当前要渲染的页面组件。在 Next.js 里，每个页面都对应着 pages 目录下的一个文件，
当用户访问不同的路由时，Next.js 会依据路由匹配到相应的页面组件，然后把这个组件作为 Component 参数传递给 MyApp 组件进行渲染。

示例：假设你有一个 pages/index.tsx 文件，当用户访问网站根路径（/）时，Component 就会是 index.tsx 文件导出的页面组件。

2. pageProps
用途：pageProps 是传递给页面组件的属性对象。这些属性可以来自于 getStaticProps、getServerSideProps 等数据获取函数。
getStaticProps 用于静态生成（SSG），在构建时获取数据；getServerSideProps 用于服务器端渲染（SSR），在每次请求时获取数据。
通过 pageProps，可以把这些获取到的数据传递给具体的页面组件。

示例：如果在 pages/index.tsx 文件中使用了 getStaticProps 函数来获取一些文章列表数据，
这些数据就会作为 pageProps 的一部分传递给 MyApp 组件，再由 MyApp 组件传递给 index.tsx 页面组件进行渲染。
 */
