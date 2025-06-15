import { useMemo } from "react";
import styles from "./NetworkButton.module.scss";
import { useWallet } from "@src/hooks/useWallet";

import { Dropdown, MenuProps } from "antd";
import { IconDown } from "../icons";

/**
 * Button that connect wallet or show current account
 */
export default function NetworkButton(props) {
  const {
    walletAddress, // 用户的钱包地址
    chain, // 当前连接的区块链网络信息
    validChains, // 可用的区块链网络列表
    switchNetwork, // 切换区块链网络的方法
  } = useWallet();

  // 定义按钮点击事件处理函数，直接调用 switchNetwork 方法来切换网络
  const onButtonClick = switchNetwork;

  // 使用 useMemo 记忆化计算下拉菜单的菜单项
  const menus: MenuProps["items"] = useMemo(
    () =>
      validChains.map((item, i) => {
        return {
          key: i,
          label: (
            <div
              className={[
                styles["menu-item"],
                item.chainId == chain?.chainId ? styles["disabled"] : "",
              ].join(" ")}
              onClick={() => onButtonClick(item.chainId)}
              key={item.chainId}
            >
              <item.logo className={styles["logo"]}></item.logo>
              <div className={styles["text"]}>{item.name}</div>
            </div>
          ),
        };
      }),
    [validChains, chain]
  );

  // 使用 useMemo 记忆化计算当前链的元数据
  const chainMeta = useMemo(() => {
    let target = validChains.find((item) => {
      return item?.chainId == chain?.chainId;
    });
    return target;
  }, [chain]);

  return (
    <Dropdown menu={{ items: menus }}>
      {walletAddress ? (
        <div className={[styles["network-button"], props.className].join(" ")}>
          {chainMeta && chainMeta.logo ? (
            <chainMeta.logo></chainMeta.logo>
          ) : (
            <div className={styles["logo"]}></div>
          )}
          <div className={styles["text"]}>
            {(chainMeta && chainMeta.name) || "Switch Network"}
          </div>
          <IconDown className={styles["down"]}></IconDown>
        </div>
      ) : (
        <div />
      )}
    </Dropdown>
  );
}
