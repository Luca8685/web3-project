/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@src/redux/hooks";
import { useWeb3React } from "@web3-react/core";
import { providers, Contract } from "ethers";
import {
  VALID_CHAINS,
  tokenAbi,
  stakingPoolAddresses,
  VALID_CHAIN_IDS,
} from "@src/config";
import abiJSON from "@src/util/abis.json";
import chains from "@src/util/chain_id";

import { message } from "antd";

import * as contractActions from "@src/redux/modules/contract";
import * as walletActions from "@src/redux/modules/wallet";

import { useLocalStorage } from "./useLocalStorage";
import {
  connectorLocalStorageKey,
  walletLocalStorageKey,
} from "@src/types/Connector";

const validChains = VALID_CHAINS;

function checkMetaMask() {
  return window && window.ethereum && window.ethereum.isMetaMask;
}

export function listenToWallet() {
  // 获取 Redux 的 dispatch 函数，用于分发 action
  const dispatch = useAppDispatch();
  // 从 Redux 状态中获取钱包地址
  let walletAddress = useAppSelector(
    (state) => state && state.contract.walletAddress
  );
  // 从 Redux 状态中获取签名者对象
  let signer = useAppSelector((state) => state && state.contract.signer);
  // 从 Redux 状态中获取当前链信息
  let chain = useAppSelector((state) => state && state.wallet.chain);

  // 使用 useWeb3React 钩子获取当前的链 ID、账户和连接器
  const { chainId, account, connector } = useWeb3React();

  // 使用自定义的 useLocalStorage 钩子获取本地存储的操作函数
  const { getLocal } = useLocalStorage();

  // 第一个 useEffect 钩子，在组件挂载时执行一次
  useEffect(function mount() {
    // auto connect to wallet iff user has connected
    // 检查本地存储中是否有连接器的 ID，如果有则表示用户之前已经连接过钱包
    if (~~getLocal(connectorLocalStorageKey)) {
      //这里注释掉的代码表示自动连接钱包，隐藏错误信息
      // getAccount({hideError: true});
      // 监听钱包的连接事件，当钱包连接时自动获取账户信息
      // window.ethereum && window.ethereum.on('connect', (connectInfo: any) => {
      //   getAccount({hideError: true});
      // });
    }
    // getNetwork();
    // 监听账户改变事件，当账户改变时调用 handleAccountsChanged 函数
    window.ethereum &&
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    // 监听链改变事件，当链改变时调用 handleChainChanged 函数
    window.ethereum && window.ethereum.on("chainChanged", handleChainChanged);
    // 监听钱包断开连接事件，这里注释掉的代码表示当钱包断开连接时调用 disconnect 函数
    // window.ethereum && window.ethereum.on('disconnect', disconnect);
    // 监听钱包错误事件，当发生错误时显示错误信息
    window.ethereum &&
      window.ethereum.on("error", (res) => message.error("Transaction Error"));
  }, []);

  // 第二个 useEffect 钩子，当 account 变化时执行
  useEffect(() => {
    handleAccountsChanged(account);
  }, [account]);

  // 第三个 useEffect 钩子，当 chainId 变化时执行
  useEffect(() => {
    handleChainChanged(chainId);
  }, [chainId]);

  // 第四个 useEffect 钩子，当 connector、walletAddress 或 chain 变化时执行
  useEffect(() => {
    // if (!walletAddress || !chain) {
    // 如果钱包地址或链信息不存在，则将签名者对象置为 null
    if (!walletAddress || !chain) {
      dispatch(contractActions.setSigner(null));
      return;
    }
    // 如果窗口对象存在且连接器存在
    if (typeof window !== "undefined" && connector) {
      (async () => {
        // 创建一个 Web3Provider 对象，用于与以太坊网络交互
        const _provider = new providers.Web3Provider(
          await connector.getProvider()
        );
        // Client-side-only code
        const _signer = _provider.getSigner();
        if (_signer) {
          // 如果签名者对象存在，则将其更新到 Redux 状态中
          dispatch(contractActions.setSigner(_signer));
        } else {
          // do nothing
          // 如果签名者对象不存在，则将其置为 null
          dispatch(contractActions.setSigner(null));
        }
      })();
    }
  }, [connector, walletAddress, chain]);

  // 第五个 useEffect 钩子，当 signer 或 chain 变化时执行
  useEffect(() => {
    if (!chain) {
      // 如果链信息不存在，则清除合约信息
      clearContracts();
      return;
    }

    // 如果签名者对象不存在，则清除合约信息
    if (!signer) {
      clearContracts();
      return;
    } else {
      // 根据当前链信息找到对应的存款代币地址  C2N-TOKEN
      const depositTokenAddress = stakingPoolAddresses.find(
        (v) => v.chainId == chain.chainId
      )?.depositTokenAddress;
      // 创建存款代币合约对象
      const depositTokenContract = new Contract(
        depositTokenAddress,
        tokenAbi,
        signer
      );
      // 根据当前链信息找到对应的收益代币地址 C2N-TOKEN
      const earnedTokenAddress = stakingPoolAddresses.find(
        (v) => v.chainId == chain.chainId
      )?.earnedTokenAddress;
      // 创建收益代币合约对象
      const breContract = new Contract(earnedTokenAddress, tokenAbi, signer);

      // 将合约信息更新到 Redux 状态中
      dispatch(
        contractActions.setContracts({
          depositTokenContract,
          breContract,
        })
      );
    }
  }, [signer, chain]);

  // 清除合约信息的函数
  function clearContracts() {
    // 将合约信息置为 null，并更新到 Redux 状态中
    dispatch(
      contractActions.setContracts({
        depositTokenContract: null,
        breContract: null,
        stakingContract: null,
        saleContract: null,
      })
    );
  }

  // 处理账户改变事件的函数
  async function handleAccountsChanged(account: string) {
    if (!account) {
      // MetaMask is locked or the user has not connected any accounts
      // message.warning('Please connect to your wallet.');
      // 如果账户不存在，则将钱包地址置为 null
      dispatch(contractActions.setWalletAddress(null));
    } else if (account !== walletAddress) {
      // Do any other work!
      dispatch(contractActions.setWalletAddress(account));
      // 如果账户发生改变，则更新钱包地址，并显示成功信息
      message.success({
        content: "You have connected to account " + account,
        duration: 1,
      });
    }
  }

  // 处理链改变事件的函数
  async function handleChainChanged(chainId: number) {
    const chain = chains.find((v) => v.chainId == chainId); // 根据链 ID 找到对应的链信息
    if (!chain) {
      // select 1337, this would switch to 31337
      // 如果链信息不存在，则返回
      return;
    }
    // 将链信息更新到 Redux 状态中
    dispatch(walletActions.setChain(chain));
    // FIXME: do nothing now
    // if (VALID_CHAIN_IDS.includes(~~chainId)) {
    // } else if (chainId) {
    //   // invalid network
    //   message.error('Please connect to the right network.');
    //   clearContracts();
    //   dispatch(walletActions.setChain(null));
    //   location.reload();
    // }
  }

  return;
}

// 定义一个名为 useWallet 的自定义 React Hook
export const useWallet = () => {
  // 使用 useAppDispatch 从 Redux 中获取 dispatch 函数，用于触发 action
  const dispatch = useAppDispatch();
  // 从 Redux 状态中选择 contract.loading 状态，表示合约操作的加载状态
  const loading = useAppSelector((state) => state && state.contract.loading);
  // 从 Redux 状态中选择 contract.signer 状态，表示以太坊签名者对象
  const signer = useAppSelector((state) => state && state.contract.signer);
  // 从 Redux 状态中选择 wallet.show 状态，表示钱包模态框是否显示
  const walletShowed = useAppSelector((state) => state.wallet.show);
  // 从 Redux 状态中选择 wallet.chain 状态，表示当前连接的区块链网络信息
  const chain = useAppSelector((state) => state.wallet.chain);
  // 从 Redux 状态中选择 wallet.isWalletInstalled 状态，表示 MetaMask 钱包是否已安装
  const isWalletInstalled = useAppSelector(
    (state) => state.wallet.isWalletInstalled
  );
  // 从 Redux 状态中选择 contract.walletAddress 状态，表示当前连接的钱包地址
  const walletAddress = useAppSelector((state) => state.contract.walletAddress);
  // 从 Redux 状态中选择 contract.depositTokenContract 状态，表示存款代币合约实例
  const depositTokenContract = useAppSelector(
    (state) => state.contract.depositTokenContract
  );
  // 从 Redux 状态中选择 contract.breContract 状态，表示 BRE 代币合约实例
  const breContract = useAppSelector((state) => state.contract.breContract);
  // 从 Redux 状态中选择 contract.saleContract 状态，表示销售合约实例
  const saleContract = useAppSelector((state) => state.contract.saleContract);
  // 使用 useState 钩子定义一个名为 saleAddress 的状态变量，初始值为空字符串，
  // 以及用于更新该状态的函数 setSaleAddress
  const [saleAddress, setSaleAddress] = useState("");
  // 从 useLocalStorage 钩子中获取 setLocal 函数，用于设置本地存储的值
  const { setLocal } = useLocalStorage();
  /**
   * Init saleContract when saleAddress/userWalletAddress changes
   * 当 saleAddress 或 signer 发生变化时，初始化销售合约
   */
  useEffect(() => {
    // 如果 signer 或 saleAddress 为空，则不进行任何操作，直接返回
    if (!signer || !saleAddress) {
      return;
    }
    // 使用 ethers 的 Contract 类创建一个新的销售合约实例，需要传入合约地址、ABI 和签名者对象
    const saleContract = new Contract(
      saleAddress,
      abiJSON["hardhat"]["C2NSale"],
      signer
    );
    // 调用 dispatch 函数，触发 contractActions.setContracts action，
    // 将新创建的销售合约实例更新到 Redux 状态中
    dispatch(
      contractActions.setContracts({
        saleContract,
      })
    );
  }, [saleAddress, signer]);

  /**
   * 获取用户的以太坊账户信息
   * @param options - 可选参数，包含是否隐藏错误信息的配置
   */
  async function getAccount(options?) {
    // 根据传入的 options 参数决定是否隐藏错误信息
    const hideError = options && options.hideError;
    const showError = !hideError;
    // 检查 MetaMask 钱包是否已安装
    if (!checkMetaMask()) {
      // 如果未安装且不隐藏错误信息，则显示错误消息
      showError &&
        message.error({
          content: "Please install metamask!",
        });
      // 调用 dispatch 函数，触发 walletActions.setisWalletInstalled action，
      // 将 isWalletInstalled 状态设置为 false
      dispatch(walletActions.setisWalletInstalled(false));
      // 返回一个被拒绝的 Promise
      return Promise.reject();
    } else {
      // 如果已安装，调用 dispatch 函数，触发 walletActions.setisWalletInstalled action，
      // 将 isWalletInstalled 状态设置为 true
      dispatch(walletActions.setisWalletInstalled(true));
    }
    // 检查 window.ethereum 是否已连接
    if (!window.ethereum.isConnected()) {
      // 如果未连接且不隐藏错误信息，则显示错误消息
      showError &&
        message.error({
          content: "Please connect to metamask!",
        });
      // 返回一个被拒绝的 Promise
      return Promise.reject();
    }

    try {
      // 使用 window.ethereum.request 方法请求用户的账户信息
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      // 调用 dispatch 函数，触发 contractActions.setWalletAddress action，
      // 将获取到的第一个账户地址更新到 Redux 状态中
      dispatch(contractActions.setWalletAddress(accounts[0]));
      // 返回一个已解决的 Promise，其值为获取到的第一个账户地址
      return Promise.resolve(accounts[0]);
    } catch (e) {
      // 如果出现错误，打印错误信息
      console.log("connect error", e);
    }
  }

  /**
   * 获取当前连接的区块链网络信息
   */
  async function getNetwork() {
    // 检查 MetaMask 钱包是否已安装
    if (!checkMetaMask()) {
      message.error({
        content: "Please install metamask!",
      });
      // 调用 dispatch 函数，触发 walletActions.setisWalletInstalled action，
      // 将 isWalletInstalled 状态设置为 false
      dispatch(walletActions.setisWalletInstalled(false));
      return Promise.reject();
    } else {
      // 如果已安装，调用 dispatch 函数，触发 walletActions.setisWalletInstalled action，
      // 将 isWalletInstalled 状态设置为 true
      dispatch(walletActions.setisWalletInstalled(true));
    }
    try {
      // 使用 window.ethereum.request 方法请求当前的链 ID
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      // 在 validChains 数组中查找与链 ID 匹配的网络信息
      const chain = validChains.find((v) => v.chainId == chainId);
      // 调用 dispatch 函数，触发 walletActions.setChain action，
      // 将找到的网络信息更新到 Redux 状态中
      dispatch(walletActions.setChain(chain));
    } catch (e) {
      console.error(e);
    }
    // 返回一个已解决的 Promise，其值为找到的网络信息
    return Promise.resolve(chain);
  }

  /**
   * 设置合约操作的加载状态
   * @param data - 加载状态数据
   */
  function setLoading(data) {
    dispatch(contractActions.setLoading(data));
  }

  /**
   * 向 MetaMask 钱包中添加 ERC20 代币
   * @param tokenAddress - 代币合约地址
   * @param symbolName - 代币符号
   */
  async function addToken(tokenAddress, symbolName) {
    console.log({ tokenAddress, symbolName }, "add-token");
    // 使用 window.ethereum.request 方法调用 wallet_watchAsset 方法，传入代币的相关信息
    await window.ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20", // Initially only supports ERC20, but eventually more! 目前仅支持 ERC20 代币，未来可能支持更多类型
        options: {
          address: tokenAddress, // The address that the token is at. 代币合约地址
          symbol: symbolName, // A ticker symbol or shorthand, up to 5 chars. 代币符号，最多 5 个字符
          decimals: 18, // The number of decimals in the token 代币的小数位数
        },
      },
    });
  }

  /**
   * 显示或隐藏钱包模态框
   * @param value - 可选参数，用于指定钱包模态框的显示状态
   */
  function showWallet(value?) {
    if (value === undefined) {
      // 如果未传入 value 参数，则切换钱包模态框的显示状态
      dispatch(walletActions.showWallet(!walletShowed));
      return;
    }
    // 如果传入了 value 参数，则将其转换为布尔值，并更新钱包模态框的显示状态
    dispatch(walletActions.showWallet(!!value));
    return;
  }

  /**
   * 切换以太坊网络
   * @param chainId - 目标网络的链 ID
   */
  async function switchNetwork(chainId: number) {
    // 如果当前没有连接的钱包地址，打印警告信息
    if (!walletAddress) {
      console.warn("no wallet address", walletAddress);
    }
    // 在 chains 数组中查找与链 ID 匹配的网络信息，如果未找到则使用 validChains 数组的第一个元素
    const chain =
      chains.find((chain) => chain.chainId == chainId) || validChains[0];
    // 构建网络参数
    const params = [
      {
        chainId: `0x${chain.chainId.toString(16)}`, // 链 ID 的十六进制表示
        chainName: chain.name, // 链名称
        nativeCurrency: {
          name: chain.nativeCurrency.name, // 原生货币名称
          symbol: chain.nativeCurrency.symbol, // 原生货币符号
          decimals: chain.nativeCurrency.decimals, // 原生货币小数位数
        },
        rpcUrls: chain.rpc, // RPC 节点地址
        blockExplorerUrls: [`${chain.infoURL}/`], // 区块浏览器地址
      },
    ];
    try {
      // 使用 window.ethereum.request 方法调用 wallet_switchEthereumChain 方法，尝试切换网络
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x" + chain.chainId.toString(16) }],
      });
      // 切换网络成功后，调用 getNetwork 函数更新网络信息
      await getNetwork();
    } catch (switchError) {
      console.log("error");
      // This error code indicates that the chain has not been added to MetaMask.
      // 如果错误代码为 4902，表示该网络未添加到 MetaMask
      if (switchError.code === 4902) {
        try {
          // 使用 window.ethereum.request 方法调用 wallet_addEthereumChain 方法，尝试添加网络
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: params,
          });
        } catch (addError) {
          // 如果添加网络出现错误，打印错误信息
          console.warn("addError", addError);
          // handle "add" error
          // 处理添加网络的错误
        }
      }
      // handle other "switch" errors // 处理其他切换网络的错误
    }
  }

  /**
   * 连接钱包
   */
  async function connect() {
    // 先调用 getAccount 函数获取账户信息，然后调用 getNetwork 函数获取网络信息
    await getAccount()
      .then(getNetwork)
      .then((chain) => {
        // 连接成功后，显示成功消息
        message.success({
          content: "Welcome, you're currently connected to metamask",
          duration: 1,
        });
        // auto connect next time
        // 设置本地存储的值，表示下次自动连接钱包
        setLocal("auto_connect_wallet", 1);
      });
    // 返回一个已解决的 Promise
    return Promise.resolve();
  }

  /**
   * 断开钱包连接
   */
  function disconnect() {
    // 调用 dispatch 函数，触发 contractActions.setWalletAddress action，
    // 将钱包地址设置为 null
    dispatch(contractActions.setWalletAddress(null));
    // 调用 dispatch 函数，触发 walletActions.setChain action，将网络信息设置为 null
    dispatch(walletActions.setChain(null));
    // 设置本地存储的值，表示下次不自动连接钱包
    setLocal("auto_connect_wallet", 0);
    // 返回一个已解决的 Promise
    return Promise.resolve();
  }

  // 返回一个对象，包含所有与钱包交互相关的状态和函数，
  // 以及一个 isConnected 布尔值，表示钱包是否已连接
  return {
    isWalletInstalled,
    walletAddress,
    depositTokenContract,
    breContract,
    saleContract,
    loading,
    saleAddress,
    validChains,
    signer,

    setSaleAddress,
    getAccount,
    setLoading,
    addToken,
    showWallet,
    walletShowed,
    chain,
    switchNetwork,
    connect,
    disconnect,

    isConnected: walletAddress && chain,
  };
};
