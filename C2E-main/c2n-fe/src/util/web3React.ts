// 从 @web3-react/injected-connector 包中导入 InjectedConnector 类，用于连接注入式钱包，如 MetaMask
import { InjectedConnector } from "@web3-react/injected-connector";
// 从 @web3-react/walletconnect-connector 包中导入 WalletConnectConnector 类，
// 用于连接 WalletConnect 钱包
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
// 从 @web3-react/abstract-connector 包中导入 AbstractConnector 类，它是所有连接器的抽象基类
import { AbstractConnector } from "@web3-react/abstract-connector";
// 从 @binance-chain/bsc-connector 包中导入 BscConnector 类，用于连接币安智能链（BSC）钱包
import { BscConnector } from "@binance-chain/bsc-connector";
// 从 @pancakeswap/uikit 包中导入 ConnectorNames 类型，它定义了不同钱包连接器的名称枚举
import { ConnectorNames } from "@pancakeswap/uikit";
// 从 @ethersproject/bytes 包中导入 hexlify 函数，用于将字节数据转换为十六进制字符串
import { hexlify } from "@ethersproject/bytes";
// 从 @ethersproject/strings 包中导入 toUtf8Bytes 函数，用于将 UTF-8 字符串转换为字节数组
import { toUtf8Bytes } from "@ethersproject/strings";
// 从 @ethersproject/providers 包中导入 Web3Provider 类，用于创建一个 Web3 提供者实例
import { Web3Provider } from "@ethersproject/providers";
// 从 @src/config/constants/networks 模块中导入 CHAIN_ID 常量，它表示当前使用的区块链网络 ID
import { CHAIN_ID } from "@src/config/constants/networks";
// 从当前目录下的 getRpcUrl 模块中导入 getNodeUrl 函数，用于获取 RPC 节点的 URL
import getNodeUrl from "./getRpcUrl";

// 定义轮询间隔时间为 12000 毫秒，即 12 秒，用于钱包连接状态的轮询
const POLLING_INTERVAL = 12000;
// 调用 getNodeUrl 函数获取 RPC 节点的 URL
const rpcUrl = getNodeUrl();
// 将 CHAIN_ID 字符串转换为十进制整数，存储在 chainId 变量中
const chainId = parseInt(CHAIN_ID, 10);

// const injected = new InjectedConnector({ supportedChainIds: [chainId] })
// 创建一个注入式连接器实例，不限制支持的链 ID
const injected = new InjectedConnector({});
// 创建一个 WalletConnect 连接器实例
const walletconnect = new WalletConnectConnector({
  rpc: { [chainId]: rpcUrl }, // 配置 RPC 节点信息，使用前面获取的 chainId 和 rpcUrl
  qrcode: true, // 启用二维码扫描功能，方便通过移动钱包连接
  pollingInterval: POLLING_INTERVAL, // 设置轮询间隔时间
});

// const bscConnector = new BscConnector({ supportedChainIds: [chainId] })
// 创建一个币安智能链连接器实例，不限制支持的链 ID
const bscConnector = new BscConnector({});

// 定义一个对象 connectorsByName，将不同的连接器名称映射到对应的连接器实例
export const connectorsByName: { [connectorName in ConnectorNames]: any } = {
  [ConnectorNames.Injected]: injected, // 将 Injected 名称映射到注入式连接器实例
  [ConnectorNames.WalletConnect]: walletconnect, // 将 WalletConnect 名称映射到 WalletConnect 连接器实例
  [ConnectorNames.BSC]: bscConnector, // 将 BSC 名称映射到币安智能链连接器实例
};

// 定义一个函数 getLibrary，用于创建一个 Web3Provider 实例
export const getLibrary = (provider): Web3Provider => {
  // 使用传入的 provider 创建一个 Web3Provider 实例
  const library = new Web3Provider(provider);
  // 设置 Web3Provider 的轮询间隔时间
  library.pollingInterval = POLLING_INTERVAL;
  // 返回创建好的 Web3Provider 实例
  return library;
};

/**
 * BSC Wallet requires a different sign method //BSC Wallet 需要使用不同的签名方法
 * @see https://docs.binance.org/smart-chain/wallet/wallet_api.html#binancechainbnbsignaddress-string-message-string-promisepublickey-string-signature-string
 */
// 定义一个异步函数 signMessage，用于对消息进行签名
//signMessage 函数接收四个参数：一个钱包连接器对象、一个区块链提供者对象、
// 一个钱包账户地址和一个要签名的消息。函数将返回一个 Promise，
// 该 Promise 解决后将返回签名后的消息字符串。函数的具体实现逻辑应该在函数体中，
// 用于根据不同的钱包类型和提供者，选择合适的方法对消息进行签名。
export const signMessage = async (
  connector: AbstractConnector,
  provider: any,
  account: string,
  message: string
): Promise<string> => {
  // 检查是否存在 window.BinanceChain 对象，并且连接器是 BscConnector 类型
  if (window.BinanceChain && connector instanceof BscConnector) {
    // 调用 BinanceChain 的 bnbSign 方法对消息进行签名
    const { signature } = await window.BinanceChain.bnbSign(account, message);
    // 返回签名结果
    return signature;
  }

  /**
   * Wallet Connect does not sign the message correctly unless you use their method
   *  Wallet Connect 除非使用其特定方法，否则无法正确签名消息
   * @see https://github.com/WalletConnect/walletconnect-monorepo/issues/462
   */
  // 检查 provider 的 provider 属性中是否存在 wc 对象
  if (provider.provider?.wc) {
    // 将消息转换为十六进制字符串
    const wcMessage = hexlify(toUtf8Bytes(message));
    // 调用 WalletConnect 的 signPersonalMessage 方法对消息进行签名
    const signature = await provider.provider?.wc.signPersonalMessage([
      wcMessage,
      account,
    ]);
    return signature; // 返回签名结果
  }
  // 如果不是上述特殊情况，使用 provider 的 getSigner 方法获取签名者并对消息进行签名
  return provider.getSigner(account).signMessage(message);
};
