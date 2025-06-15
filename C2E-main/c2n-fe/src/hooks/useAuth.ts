import { useCallback, useEffect } from "react";
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import { NoBscProviderError } from "@binance-chain/bsc-connector";
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from "@web3-react/injected-connector";
import {
  UserRejectedRequestError as UserRejectedRequestErrorWalletConnect,
  WalletConnectConnector,
} from "@web3-react/walletconnect-connector";
import { ConnectorNames, connectorLocalStorageKey } from "@pancakeswap/uikit";
import { connectorsByName } from "@src/util/web3React";
import { setupNetwork } from "@src/util/wallet";
import { useMessage } from "./useMessage";
import { useAppDispatch } from "@src/redux/hooks";
import { useLocalStorage } from "./useLocalStorage";

/**
 * 定义了一个名为 useAuth 的自定义 React Hook，用于处理与以太坊钱包的认证和连接逻辑。
 * 它提供了登录、登出功能，并支持自动登录。
 * 同时，它还处理了各种连接错误，并提供了相应的错误消息提示。
 * @returns
 */
export const useAuth = () => {
  // 使用 useAppDispatch 钩子获取 Redux 的 dispatch 函数
  const dispatch = useAppDispatch();
  // 使用 useWeb3React 钩子获取链 ID、激活函数、停用函数、账户信息和连接状态
  const { chainId, activate, deactivate, account, active } = useWeb3React();
  // 从 useMessage 钩子中获取 setErrorMessage 函数，用于设置错误消息
  const { setErrorMessage } = useMessage();
  // 从 useLocalStorage 钩子中获取 getLocal 函数，用于获取本地存储的值
  const { getLocal } = useLocalStorage();

  // 使用 useCallback 钩子创建一个名为 login 的函数，
  // 该函数接收一个 connectorID 参数并返回一个 Promise
  const login: (connectorID: string) => Promise<any> = useCallback(
    (connectorID: string) => {
      // 根据 connectorID 从 connectorsByName 对象中获取对应的连接器
      const connector = connectorsByName[connectorID];
      // 如果找到了对应的连接器
      if (connector) {
        // 调用 activate 函数激活连接器，并传入一个错误处理回调函数
        return activate(connector, async (error: Error) => {
          // 如果错误类型是 UnsupportedChainIdError
          if (error instanceof UnsupportedChainIdError) {
            // 调用 setupNetwork 函数尝试设置网络，并等待结果
            const hasSetup = await setupNetwork();
            // 如果网络设置成功
            if (hasSetup) {
              // 再次激活连接器
              activate(connector);
            }
          } else {
            // 如果不是 UnsupportedChainIdError 错误，从本地存储中移除连接器 ID
            window.localStorage.removeItem(connectorLocalStorageKey);
            // 如果错误类型是 NoEthereumProviderError 或 NoBscProviderError
            if (
              error instanceof NoEthereumProviderError ||
              error instanceof NoBscProviderError
            ) {
              // 设置错误消息为 "No provider was found"
              setErrorMessage("No provider was found");
            } else if (
              error instanceof UserRejectedRequestErrorInjected ||
              error instanceof UserRejectedRequestErrorWalletConnect
            ) {
              // 如果连接器是 WalletConnectConnector 类型
              if (connector instanceof WalletConnectConnector) {
                // 将钱包连接器的 provider 设置为 null
                const walletConnector = connector as WalletConnectConnector;
                walletConnector.walletConnectProvider = null;
              }
              setErrorMessage("Please authorize to access your account");
            } else {
              // 其他类型的错误，设置错误消息为错误对象的消息内容
              setErrorMessage(error.message);
            }
          }
        }).then(() => {
          // 激活成功后，在本地存储中设置 "bobabrewery_auto_connect" 为 "1"
          window.localStorage.setItem("bobabrewery_auto_connect", "1");
        });
      } else {
        // 如果没有找到对应的连接器，设置错误消息并返回一个被拒绝的 Promise
        setErrorMessage(
          "The connector config of " + connectorID + " is wrong, "
        );
        return Promise.reject();
      }
    },
    [activate, setErrorMessage]
  );

  // 使用 useCallback 钩子创建一个名为 logout 的函数
  const logout = useCallback(() => {
    deactivate(); // 调用 deactivate 函数停用当前的连接器
    // clearUserStates(dispatch, chainId) // 注释掉的代码，原本可能用于清除用户状态
  }, [deactivate, dispatch, chainId]);

  useEffect(function mount() {
    // 从本地存储中获取 "bobabrewery_auto_connect" 的值
    let autoConnect = window.localStorage.getItem("bobabrewery_auto_connect");
    // 从本地存储中获取连接器 ID
    let connectorId = window.localStorage.getItem(connectorLocalStorageKey);
    // 如果连接器 ID 和 autoConnect 都存在
    if (connectorId && autoConnect) {
      // 从本地存储中移除 "bobabrewery_auto_connect"
      window.localStorage.removeItem("bobabrewery_auto_connect");
      // 调用 login 函数进行自动登录
      login(connectorId);
    }
  }, []);
  // 返回一个对象，包含 login、logout 函数，以及账户信息、连接状态和链 ID
  return { login, logout, account, active, chainId };
};

export default useAuth;
