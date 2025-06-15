import { useMemo } from "react";
import { Row, Col, message } from "antd";
import { CopyOutlined } from "@ant-design/icons";

import { useResponsive } from "@src/hooks/useResponsive";
import { useWallet } from "@src/hooks/useWallet";
import { useMessage } from "@src/hooks/useMessage";

import styles from "./HomeBanner.module.scss";
import { IconC2n } from "@src/components/icons";
import { useAirdropContract } from "@src/hooks/useContract";
// 从 '@src/config' 中导入 tokenInfos，这是一个包含代币信息的数组
import { tokenInfos } from "@src/config";

export default function Header() {
  const { isDesktopOrLaptop } = useResponsive();

  const { chain, walletAddress } = useWallet();
  // 使用 useAirdropContract 钩子获取空投合约实例
  const airdropContract = useAirdropContract();
  // 使用 useMessage 钩子获取设置成功提示信息的函数
  const { setSuccessMessage } = useMessage();

  // 使用 useMemo 钩子记忆化计算当前网络对应的代币信息
  const token = useMemo(() => {
    return (
      // 从 tokenInfos 数组中查找与当前网络链 ID 匹配的代币信息，如果未找到则使用第一个代币信息
      tokenInfos.find((item) => item.chainId == chain?.chainId) || tokenInfos[0]
    );
  }, [chain]);

  /**
   * 复制文本到剪贴板的函数
   * @param {string} text - 要复制的文本
   */
  function copy(text) {
    navigator.clipboard.writeText(text).then(
      function () {
        setSuccessMessage("Copied");
      },
      function (err) {}
    );
  }

  /**
   * 向钱包添加代币的函数
   * @param {string} tokenAddress - 代币合约地址
   * @param {string} symbolName - 代币符号
   */
  async function addToken(tokenAddress, symbolName) {
    // 如果未连接钱包，显示错误提示信息并返回
    if (!chain) {
      message.error("connect wallet and try again !");
      return;
    }
    // 如果当前网络与代币所在网络不一致，显示错误提示信息并返回
    if (chain.chainId !== token.chainId) {
      message.error("switch network and try again !");
      return;
    }
    // 调用以太坊钱包的 wallet_watchAsset 方法，向钱包添加代币
    (await window.ethereum) &&
      window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20", // Initially only supports ERC20, but eventually more! 目前只支持 ERC20 代币，未来可能支持更多类型
          options: {
            address: tokenAddress, // The address that the token is at. 代币合约地址
            symbol: symbolName, // A ticker symbol or shorthand, up to 5 chars.  代币符号，最多 5 个字符
            decimals: 18, // The number of decimals in the token 代币的小数位数
            image: "", //代币的图标地址，这里留空
          },
        },
      });
  }

  /**
   * 处理领取空投代币的函数
   */
  const handleClaim = async () => {
    if (!airdropContract || !walletAddress) {
      message.warn("connect wallet first");
    }
    try {
      // 调用空投合约的 withdrawTokens 方法领取代币
      const res = await airdropContract.withdrawTokens();
      console.log(res, "re");
    } catch (error) {
      message.error(
        error.reason || error?.data?.message || error?.message || "claim failed"
      );
    }
  };

  // 组件的返回值，渲染首页横幅的 UI 结构
  return (
    <div className={styles["home-banner"]}>
      <Row justify="space-between" align="middle" className={styles["main"]}>
        <Col span={isDesktopOrLaptop ? 16 : 24}>
          <Row gutter={16}>
            <Col span={isDesktopOrLaptop ? 4 : 24}>
              <Row justify="center" align="middle">
                <IconC2n className={styles.icon} />
              </Row>
            </Col>
            <Col span={isDesktopOrLaptop ? 20 : 24}>
              <Row>
                <Col span={24} className={styles["text1"]}>
                  {token.symbol} Tokens Online Now!
                </Col>
                <Col className={styles["text2"]}>
                  Token Contract Address: &nbsp;
                  {isDesktopOrLaptop ? <></> : <br />}
                  {token.address}
                  &nbsp;
                  <CopyOutlined
                    className={styles["copy"]}
                    onClick={() => {
                      copy(token.address);
                    }}
                  />
                </Col>
                Airdrop Contract Address: &nbsp;
                {isDesktopOrLaptop ? <></> : <br />}
                {airdropContract.address}
                <CopyOutlined
                  className={styles["copy"]}
                  onClick={() => {
                    copy(airdropContract.address);
                  }}
                />
              </Row>
            </Col>
          </Row>
        </Col>
        <Col span={isDesktopOrLaptop ? 4 : 12}>
          <div className={styles["button"]} onClick={handleClaim}>
            Claim {token.symbol}
          </div>
        </Col>
        <Col span={isDesktopOrLaptop ? 4 : 12}>
          <div
            className={styles["button"]}
            onClick={() => addToken(token.address, token.symbol)}
          >
            Add {token.symbol} to Wallet
          </div>
        </Col>
      </Row>
    </div>
  );
}
