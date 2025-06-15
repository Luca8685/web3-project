import React from "react";
import { Modal, Row, Col } from "antd";

import { useWallet } from "@src/hooks/useWallet";
import BasicButton from "@src/components/elements/Button.Basic";

import styles from "./WalletModal.module.scss";
import { IconAccount, IconNetwork } from "@src/components/icons";
import connectors, {
  ConnectorNames,
  walletLocalStorageKey,
  connectorLocalStorageKey,
} from "@src/types/Connector";
import useAuth from "@src/hooks/useAuth";

/*
React：引入 React 库，用于创建 React 组件。
Modal, Row, Col：从 antd 库中引入模态框、行和列组件，用于布局和显示模态框。
useWallet：自定义钩子，用于获取钱包相关的状态和操作函数。
BasicButton：自定义的基础按钮组件。
styles：从 WalletModal.module.scss 文件中导入样式。
IconAccount, IconNetwork：自定义的图标组件。
connectors：钱包连接器数组，包含了支持的钱包信息。
ConnectorNames：钱包连接器名称的枚举类型。
walletLocalStorageKey, connectorLocalStorageKey：用于存储钱包名称和连接器 ID 的本地存储键。
useAuth：自定义钩子，用于获取用户认证相关的状态和操作函数。
*/

export default function WalletModal() {
  // 使用 useWallet 钩子获取钱包相关的状态和操作函数
  /*
  showWallet：用于控制钱包模态框显示或隐藏的函数。
  walletShowed：表示钱包模态框是否显示的状态。
  switchNetwork：用于切换网络的函数。
  chain：当前连接的网络信息。
  validChains：有效的网络列表。
  */
  const { showWallet, walletShowed, switchNetwork, chain, validChains } =
    useWallet();

  // 使用 useAuth 钩子获取用户认证相关的状态和操作函数
  // account：当前用户的账户信息。
  // login：用于登录钱包的函数。
  // logout：用于断开钱包连接的函数。
  const { account, login, logout } = useAuth();

  // 定义模态框关闭时的回调函数
  const onCancel = () => {
    showWallet(false); //模态框关闭时的回调函数，调用 showWallet(false) 隐藏模态框。
  };

  // 当用户当前连接的网络不正确时，显示该面板，提示用户切换网络。
  // 点击 “Switch Network” 按钮时，调用 switchNetwork 函数切换网络。
  const wrongNetworkPanel = (
    <>
      <Row justify="center" align="middle">
        <div className={styles["title"]}>Wrong Network</div>
      </Row>
      <Row justify="space-between" align="middle">
        <p>
          You are not currently connected to{" "}
          <b>{validChains && validChains[0].name}</b>. Please switch networks to
          use this application.
        </p>
      </Row>
      <Row justify="center">
        <BasicButton
          className={styles["connect-button"]}
          style={{ width: "100%" }}
          onClick={switchNetwork}
        >
          <span>Switch Network</span>
        </BasicButton>
      </Row>
    </>
  );

  let walletTitle = "";
  // 从本地存储中获取钱包名称，并赋值给 walletTitle。
  if (typeof window !== "undefined") {
    walletTitle = window.localStorage.getItem(walletLocalStorageKey);
  }

  // 当用户已连接钱包时，显示该面板，展示当前连接的钱包名称、账户信息和网络信息。
  // 点击 “Disconnect” 按钮时，调用 logout 函数断开钱包连接。
  const accountPanel = (
    <div style={{ width: "100%" }}>
      <Row justify="center">
        <div className={styles["title"]}>Connected With {walletTitle}</div>
      </Row>
      <Row>
        <Col span={2}>
          <IconAccount></IconAccount>
        </Col>
        <Col span={12} style={{ color: "#505050" }}>
          Current Account:
        </Col>
      </Row>
      <Row>
        <Col
          span={20}
          offset={2}
          style={{ fontSize: "14px", color: "#000000" }}
        >
          <p>{account}</p>
        </Col>
      </Row>
      <Row>
        <Col span={2}>
          <IconNetwork></IconNetwork>
        </Col>
        <Col span={12} style={{ color: "#505050" }}>
          Current Network:
        </Col>
      </Row>
      <Row>
        <Col
          span={20}
          offset={2}
          style={{ fontSize: "14px", color: "#000000" }}
        >
          <p>{chain && chain.name}</p>
        </Col>
      </Row>
      <Row justify="center">
        <BasicButton
          className={styles["connect-button"]}
          style={{ width: "100%" }}
          onClick={logout}
        >
          <span>Disconnect</span>
        </BasicButton>
      </Row>
    </div>
  );

  // 当用户未连接钱包时，显示该面板，列出支持的钱包列表。
  // 点击每个钱包选项时，根据用户的设备类型（iOS 设备不支持 Trust Wallet，会使用 WalletConnect 替代）调用 login 函数进行登录。
  // 登录成功后，将钱包名称和连接器 ID 存储到本地存储中，并隐藏模态框。
  const connectPanel = (
    <div>
      <Row justify="start">
        <div className={styles["title"]}>Connect wallet</div>
      </Row>
      <Row
        className={styles["connect-panel"]}
        justify="center"
        gutter={[16, 24]}
      >
        {connectors.map((connector, index) => {
          return (
            <Col
              className={styles["connect-button"]}
              span={24}
              key={index}
              onClick={() => {
                const isIOS =
                  /iPad|iPhone|iPod/.test(navigator.userAgent) &&
                  !window.MSStream;

                // Since iOS does not support Trust Wallet we fall back to WalletConnect
                if (connector.title === "Trust Wallet" && isIOS) {
                  login(ConnectorNames.WalletConnect);
                } else {
                  login(connector.connectorId);
                }

                localStorage.setItem(walletLocalStorageKey, connector.title);
                localStorage.setItem(
                  connectorLocalStorageKey,
                  connector.connectorId
                );
                showWallet(false);
              }}
            >
              <connector.icon
                className={[styles["icon"]].join(" ")}
              ></connector.icon>
              <span
                style={{
                  fontSize: "18px",
                  color: "#000000",
                  marginLeft: "12px",
                }}
              >
                {connector.title}
              </span>
            </Col>
          );
        })}
      </Row>
    </div>
  );

  // 根据 account 和 chain 的状态，决定显示哪个面板：
  // 如果 account 存在，且 chain 存在，则显示 accountPanel。
  // 如果 account 存在，但 chain 不存在，则显示 wrongNetworkPanel。
  // 如果 account 不存在，则显示 connectPanel。
  return (
    <Modal title={null} open={walletShowed} onCancel={onCancel} footer={null}>
      {account ? (chain ? accountPanel : wrongNetworkPanel) : connectPanel}
    </Modal>
  );
}

//Modal 组件的基本用途
//Modal 组件是 Ant Design 提供的一个用户界面组件，主要用于创建模态对话框，这种对话框会覆盖在当前页面之上，
//阻止用户与页面其他部分进行交互，直到对话框被关闭。模态框通常用于显示重要信息、确认操作、输入表单等场景。
