// 引入 @nomiclabs/hardhat-waffle 插件，该插件用于在 Hardhat 中使用 Waffle 进行测试
require("@nomiclabs/hardhat-waffle");
// 引入 @nomiclabs/hardhat-ethers 插件，该插件用于在 Hardhat 中集成 ethers.js 库，方便与以太坊合约进行交互
require("@nomiclabs/hardhat-ethers");
// 引入 solidity-coverage 插件，该插件用于生成 Solidity 代码的测试覆盖率报告
require("solidity-coverage");
// 引入 dotenv 库并调用其 config 方法，用于加载 .env 文件中的环境变量
require("dotenv").config();

// 引入 Node.js 的 fs 模块，用于进行文件系统操作
const fs = require("fs");
// 以下代码被注释掉了，原本是用于读取 .infuraid 文件的内容，获取 Infura ID
// const infuraId = fs.readFileSync(".infuraid").toString().trim() || "";

// 定义一个名为 "accounts" 的 Hardhat 任务，用于打印出可用的账户列表
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  // 使用 hre.ethers.getSigners() 方法获取所有可用的账户签名者
  const accounts = await hre.ethers.getSigners();

  // 遍历账户签名者数组
  for (const account of accounts) {
    // 打印每个账户的地址
    console.log(account.address);
  }
});

// 导出 Hardhat 的配置对象
module.exports = {
  // 设置默认网络为 "hardhat"，即使用 Hardhat 内置的本地开发网络
  defaultNetwork: "hardhat",
  // 定义不同的网络配置
  networks: {
    // 配置 Hardhat 本地开发网络
    hardhat: {
      // 设置 Hardhat 网络的链 ID 为 31337
      chainId: 31337,
    },
    // 以下网络配置被注释掉了，可根据需要取消注释并配置相应的网络
    // sepolia: {
    //   url: "https://eth-sepolia.g.alchemy.com/v2/I3eHFhWUQaZueOZP5BPt3jdFLebK9aEe",
    //   accounts: [process.env.PRIVATE_KEY],
    // },
    // mumbai: {
    //   url: `https://polygon-mumbai.g.alchemy.com/v2/nAhiCHKvZkhkp4A7PkkCIBON0-BXW26d`,
    //   //accounts: [process.env.privateKey]
    // },
    // matic: {
    //   url: "https://polygon-mainnet.g.alchemy.com/v2/nAhiCHKvZkhkp4A7PkkCIBON0-BXW26d",
    //   //accounts: [process.env.privateKey]
    // },
    // goerli: {
    //   url: process.env.REACT_APP_ALCHEMY_API_URL,
    //   accounts: [ process.env.REACT_APP_PRIVATE_KEY ]
    // }
  },
  // 配置 Solidity 编译器
  solidity: {
    // 指定 Solidity 编译器的版本为 0.8.26
    version: "0.8.26",
    // 编译器的设置选项
    settings: {
      // 启用代码优化器
      optimizer: {
        // 启用 Solidity 编译器的优化器。当设置为 true 时，编译器会在编译过程中尝试对合约代码进行优化，以减少字节码的大小和执行成本。
        // 优化后的字节码通常更小，部署和执行合约所需的 gas 费用也会降低。
        enabled: true,
        // 指定优化器的运行次数。这是一个权衡参数，它会影响优化的程度和编译时间。
        // 运行次数越多，编译器会尝试更多的优化策略，生成的字节码可能会更优，但编译时间也会相应增加。
        // 这里设置为 200，表示编译器会尝试 200 次不同的优化策略来寻找最优的字节码。
        runs: 200,
      },
    },
  },
};