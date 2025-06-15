import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Layout, Row, Col } from "antd";
import { MenuOutlined } from "@ant-design/icons";

// 导入自定义的 useResponsive 钩子，用于判断设备类型
import { useResponsive } from "@src/hooks/useResponsive";

// 导入自定义的 WalletButton 组件，用于连接钱包
import WalletButton from "@src/components/elements/WalletButton";
// 导入自定义的 NetworkButton 组件，用于切换网络
import NetworkButton from "@src/components/elements/NetworkButton";

import styles from "./Header.module.scss";

export default function Header() {
  // 使用 useResponsive 钩子获取设备类型信息，判断是否为桌面或笔记本电脑
  const { isDesktopOrLaptop } = useResponsive();

  // 使用 useState 钩子创建一个状态变量 showSider，用于控制侧边栏菜单的显示与隐藏
  const [showSider, setShowSider] = useState(false);
  // 从 Layout 组件中解构出 Header 子组件
  const { Header } = Layout;
  // 使用 useRouter 钩子获取当前路由信息
  const router = useRouter();

  // 使用 useMemo 钩子记忆化计算当前页面在预设页面列表中的索引
  let activeTabIndex = useMemo(() => {
    return ["/", "/stake", "/farming", "/pools", "/project", "/bridge"].indexOf(
      router.pathname
    );
  }, [router]);

  // 定义菜单组件，包含多个菜单项和一个钱包按钮
  const menu = (
    <div style={{ background: "#000000", border: "2px solid #FFB85280" }}>
      {/* 首页菜单项 */}
      <div className={[styles["menu-item"]].join(" ")}>
        <Link href="/">
          <div
            className={[
              styles.button,
              activeTabIndex == 0 ? styles["active"] : "",
            ].join(" ")}
          >
            Home
          </div>
        </Link>
      </div>
      {/* 农场菜单项 */}
      <div className={[styles["menu-item"]].join(" ")}>
        <Link href="/farming">
          <div
            className={[
              styles.button,
              activeTabIndex == 2 ? styles["active"] : "",
            ].join(" ")}
          >
            Farm
          </div>
        </Link>
      </div>
      {/* 项目菜单项，包含 /pools 和 /project 页面 */}
      <div className={[styles["menu-item"]].join(" ")}>
        <Link href="/pools">
          <div
            className={[
              styles.button,
              activeTabIndex == 3 || activeTabIndex == 4
                ? styles["active"]
                : "",
            ].join(" ")}
          >
            Projects
          </div>
        </Link>
      </div>
      {/* 质押菜单项 */}
      <div className={[styles["menu-item"]].join(" ")}>
        <Link href="/stake">
          <div
            className={[
              styles.button,
              activeTabIndex == 1 ? styles["active"] : "",
            ].join(" ")}
          >
            Staking
          </div>
        </Link>
      </div>
      {/* 移动设备上的钱包按钮 */}
      <div className={[styles["menu-item"]].join(" ")}>
        <WalletButton
          className={styles["wallet-button-mobile"]}
          style={{ background: "none", boxShadow: "none" }}
        />
      </div>
    </div>
  );

  // 组件的返回值，渲染页面头部
  return (
    <Header className={styles.header}>
      {/* 使用 Row 和 Col 组件进行布局 */}
      <Row className="main-content">
        {/* 左侧 logo 区域 */}
        <Col span={6}>
          {/* logo 链接到首页 */}
          <Link href="/">
            <div className={styles["logo"]} style={{ cursor: "pointer" }}>
              <h1 className={"Boba title app-name " + styles.title}>
                <span className={styles.logo}></span>
              </h1>
            </div>
          </Link>
        </Col>
        {/* 右侧菜单区域，根据设备类型和路由路径显示不同内容 */}
        <Col
          span={isDesktopOrLaptop ? 18 : 4}
          offset={isDesktopOrLaptop ? 0 : 14}
        >
          {isDesktopOrLaptop ? (
            // 显示桌面版菜单
            <Row
              className={styles.menu}
              key="desktop"
              justify="space-between"
              align="middle"
            >
              <Link href="/">
                <div
                  className={[
                    styles.button,
                    activeTabIndex == 0 ? styles["active"] : "",
                  ].join(" ")}
                >
                  Home
                </div>
              </Link>
              <Link href="/farming">
                <div
                  className={[
                    styles.button,
                    activeTabIndex == 2 ? styles["active"] : "",
                  ].join(" ")}
                >
                  Farm
                </div>
              </Link>
              <Link href="/pools">
                <div
                  className={[
                    styles.button,
                    activeTabIndex == 3 || activeTabIndex == 4
                      ? styles["active"]
                      : "",
                  ].join(" ")}
                >
                  Projects
                </div>
              </Link>
              <Link href="/stake">
                <div
                  className={[
                    styles.button,
                    activeTabIndex == 1 ? styles["active"] : "",
                  ].join(" ")}
                >
                  Staking
                </div>
              </Link>
              <WalletButton />
              <NetworkButton />
            </Row>
          ) : ["/safepal"].includes(router.pathname) ? ( // 如果当前路由是 /safepal
            <>
              <WalletButton className={styles["wallet-button-safepal"]} />
            </>
          ) : (
            <>
              {/* 移动设备上的菜单图标，点击切换侧边栏显示状态 */}
              <Row
                justify="end"
                align="middle"
                style={{ width: "100%", height: "100%" }}
              >
                <MenuOutlined
                  style={{ fontSize: "0.36rem" }}
                  onClick={() => setShowSider(!showSider)}
                />
              </Row>
              {/* 侧边栏菜单 */}
              <Layout.Sider
                collapsed={!showSider}
                collapsedWidth={0}
                theme="light"
                onClick={() => setShowSider(!showSider)}
                style={{
                  position: "fixed",
                  right: "0",
                  textIndent: "1em",
                  zIndex: "100",
                }}
              >
                {menu}
              </Layout.Sider>
              {/* 侧边栏背景遮罩，点击隐藏侧边栏 */}
              <div
                className={styles["sider-background"]}
                onClick={() => setShowSider(!showSider)}
                style={{ display: showSider ? "block" : "none" }}
              >
                &nbsp;
              </div>
            </>
          )}
        </Col>
      </Row>
    </Header>
  );
}
