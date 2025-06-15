// Set of helper functions to facilitate wallet setup
import { getNodes, getChain } from "./getRpcUrl";

/**
 * Prompt the user to add BSC as a network on Metamask, or switch to BSC if the wallet is on a different network
 * @returns {boolean} true if the setup succeeded, false otherwise
 * 提示用户在 Metamask 上添加 BSC 网络，如果钱包当前处于不同网络，则切换到 BSC 网络
 * @返回 {boolean} 如果设置成功返回 true，否则返回 false
 */
export const setupNetwork = async () => {
  // 获取浏览器窗口中的以太坊提供者对象，通常是 Metamask 注入的
  const provider = window.ethereum;
  // 检查是否存在以太坊提供者对象
  if (provider) {
    // 从环境变量中获取链 ID 并转换为整数
    const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID, 10);
    // 根据链 ID 获取链的相关信息
    const chain = getChain(chainId);
    try {
      // 向以太坊提供者发送请求，请求添加以太坊链
      await provider.request({
        method: "wallet_addEthereumChain", // 请求的方法为 'wallet_addEthereumChain'，用于添加新的以太坊链
        params: [
          {
            chainId: `0x${chainId.toString(16)}`, // 链 ID，转换为十六进制字符串
            chainName: chain.name, // 链的名称
            nativeCurrency: {
              // 链的原生货币信息
              name: chain.nativeCurrency.name, // 原生货币的名称
              symbol: chain.nativeCurrency.symbol, // 原生货币的符号
              decimals: chain.nativeCurrency.decimals, // 原生货币的小数位数
            },
            rpcUrls: getNodes(chainId), // 链的 RPC 节点 URL 列表
            blockExplorerUrls: [`${chain.infoURL}/`], // 链的区块浏览器 URL
          },
        ],
      });
      return true; // 如果请求成功，返回 true 表示设置成功
    } catch (error) {
      console.error("Failed to setup the network in Metamask:", error);
      return false;
    }
  } else {
    console.error(
      "Can't setup the BSC network on metamask because window.ethereum is undefined"
    );
    return false;
  }
};
