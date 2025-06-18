// 引入 chai 库中的 expect 断言函数，用于编写测试断言
const { expect } = require("chai");
// 引入 hardhat 中的 ethers 库，用于与以太坊智能合约进行交互
const { ethers } = require("hardhat");

/**
 * 定义一个测试套件，名为 "NFTMarket_Normal"，用于测试正常情况下的 NFT 市场操作
 */
describe("NFTMarket_Normal", function () {
  // 声明一个变量 nftMarket，用于存储部署后的 NFTMarketplace 合约实例
  let nftMarket;
  /**
   * 在每个测试用例执行之前执行的钩子函数
   * 用于部署 NFTMarketplace 合约并等待其部署完成
   */
  beforeEach(async function () {
    // 通过 ethers 库获取 NFTMarketplace 合约的工厂实例
    const contract = await ethers.getContractFactory("NFTMarketplace");
    // 使用工厂实例部署 NFTMarketplace 合约
    nftMarket = await contract.deploy();
    // 等待合约部署完成
    await nftMarket.deployed();
  });

  /**
   * 定义一个测试用例，名为 "create token return tokenId "
   * 用于测试创建 NFT 时是否正确返回 tokenId
   */
  it("create token return tokenId ", async function () {
    // 获取列出 NFT 的价格
    const listPrice = await nftMarket.getListPrice();
    // console.log("listPrice=====>",listPrice);
    // 调用合约的 createToken 方法创建一个 NFT，传入 tokenURI 和价格，并支付列出价格
    await nftMarket.createToken("/uri", 5, {
      value: listPrice,
    });
    // 断言最新创建的 NFT 的 tokenId 为 1
    expect(await nftMarket.getLatestIdToListedToken()).eq(1);
  });

  /**
   * 定义一个测试用例，名为 "create token tokenId increment "
   * 用于测试连续创建 NFT 时 tokenId 是否正确递增
   */
  it("create token tokenId increment ", async function () {
    // 获取列出 NFT 的价格
    const listPrice = await nftMarket.getListPrice();
    // 调用合约的 createToken 方法创建一个 NFT，传入 tokenURI 和价格，并支付列出价格
    await nftMarket.createToken("/uri", 5, {
      value: listPrice,
    });
    // 断言最新创建的 NFT 的 tokenId 为 1
    expect(await nftMarket.getLatestIdToListedToken()).eq(1);
    // 再次调用合约的 createToken 方法创建一个 NFT，传入不同的价格，并支付列出价格
    await nftMarket.createToken("/uri", 4, {
      value: listPrice,
    });
    // 断言最新创建的 NFT 的 tokenId 为 2
    expect(await nftMarket.getLatestIdToListedToken()).eq(2);
  });

  /**
   * 定义一个测试用例，名为 "execuate sale token  "
   * 用于测试执行 NFT 销售操作是否正确
   */
  it("execuate sale token  ", async function () {
    // 获取两个签名者实例，分别代表不同的用户
    const [signer1, signer2] = await ethers.getSigners();
    // 获取列出 NFT 的价格
    let listPrice = await nftMarket.getListPrice();
    // 调用合约的 createToken 方法创建一个 NFT，传入 tokenURI 和价格，并支付列出价格
    await nftMarket.createToken("/uri", 5, {
      value: listPrice,
    });
    // 断言最新创建的 NFT 的 tokenId 为 1
    expect(await nftMarket.getLatestIdToListedToken()).eq(1);
    // 获取 tokenId 为 1 的 NFT 的详细信息
    let listToken = await nftMarket.getListedTokenForId(1);
    // 断言该 NFT 的卖家地址为 signer1 的地址
    expect(listToken.seller).eq(signer1.address);
    // 断言该 NFT 的所有者地址为合约地址
    expect(await listToken.owner).eq(nftMarket.address);
    // 断言 tokenId 为 1 的 NFT 的所有者地址为合约地址
    expect(await nftMarket.ownerOf(1)).eq(nftMarket.address);
    // 使用 signer2 连接到合约，并调用 executeSale 方法执行 NFT 销售操作，传入 tokenId 并支付 NFT 的价格
    await nftMarket.connect(signer2).executeSale(1, { value: listToken.price });
    // 再次获取 tokenId 为 1 的 NFT 的详细信息
    listToken = await nftMarket.getListedTokenForId(1);
    // 断言该 NFT 的卖家地址为 signer2 的地址
    expect(listToken.seller).eq(signer2.address);
    // 断言该 NFT 的所有者地址为合约地址
    expect(await listToken.owner).eq(nftMarket.address);
    // 断言 tokenId 为 1 的 NFT 的所有者地址为 signer2 的地址
    expect(await nftMarket.ownerOf(1)).eq(signer2.address);

    // console.log("=========>",await listToken.owner);
    // console.log("=========>",await nftMarket.ownerOf(1));
  });
});

/**
 * 定义一个测试套件，名为 "NFTMarket_Exception"
 * 用于测试 NFT 市场操作中的异常情况
 */
describe("NFTMarket_Exception", function () {
  // 声明一个变量 nftMarket，用于存储部署后的 NFTMarketplace 合约实例
  let nftMarket;
  /**
   * 在每个测试用例执行之前执行的钩子函数
   * 用于部署 NFTMarketplace 合约并等待其部署完成
   */
  beforeEach(async function () {
    // 通过 ethers 库获取 NFTMarketplace 合约的工厂实例
    const contract = await ethers.getContractFactory("NFTMarketplace");
    // 使用工厂实例部署 NFTMarketplace 合约
    nftMarket = await contract.deploy();
    // 等待合约部署完成
    await nftMarket.deployed();
  });

  /**
   * 定义一个测试用例，名为 "create token list price error "
   * 用于测试创建 NFT 时未支付足够列出价格的异常情况
   */
  it("create token list price error ", async function () {
    // 断言调用 createToken 方法时未支付列出价格会抛出指定的错误信息
    await expect(nftMarket.createToken("/uri", 5)).revertedWith(
      "need send enough list price"
    );
  });

  /**
   * 定义一个测试用例，名为 "create token token price error "
   * 用于测试创建 NFT 时价格为 0 的异常情况
   */
  it("create token token price error ", async function () {
    // 断言调用 createToken 方法时传入价格为 0 会抛出指定的错误信息
    await expect(nftMarket.createToken("/uri", 0)).revertedWith(
      "price must greater than zero"
    );
  });

  /**
   * 定义一个测试用例，名为 "excute sale price is not enough "
   * 用于测试执行 NFT 销售操作时支付价格不足的异常情况
   */
  it("excute sale price is not enough ", async function () {
    // 获取两个签名者实例，分别代表不同的用户
    const [signer1, signer2] = await ethers.getSigners();
    // 获取列出 NFT 的价格
    let listPrice = await nftMarket.getListPrice();
    // 调用合约的 createToken 方法创建一个 NFT，传入 tokenURI 和价格，并支付列出价格
    await nftMarket.createToken("/uri", 5, {
      value: listPrice,
    });
    // 断言最新创建的 NFT 的 tokenId 为 1
    expect(await nftMarket.getLatestIdToListedToken()).eq(1);
    // 获取 tokenId 为 1 的 NFT 的详细信息
    let listToken = await nftMarket.getListedTokenForId(1);
    // 断言使用 signer2 连接到合约并调用 executeSale 方法时未支付足够价格会抛出指定的错误信息
    await expect(nftMarket.connect(signer2).executeSale(1)).revertedWith(
      "price not enough"
    );
  });
});

/**
 * 定义一个测试套件，名为 "NFTMarket_HELPER"
 * 用于测试 NFT 市场的辅助功能
 */
describe("NFTMarket_HELPER", function () {
  // 声明一个变量 nftMarket，用于存储部署后的 NFTMarketplace 合约实例
  let nftMarket;
  /**
   * 在每个测试用例执行之前执行的钩子函数
   * 用于部署 NFTMarketplace 合约并等待其部署完成
   */
  beforeEach(async function () {
    // 通过 ethers 库获取 NFTMarketplace 合约的工厂实例
    const contract = await ethers.getContractFactory("NFTMarketplace");
    // 使用工厂实例部署 NFTMarketplace 合约
    nftMarket = await contract.deploy();
    // 等待合约部署完成
    await nftMarket.deployed();
  });

  /**
   * 定义一个测试用例，名为 "list All"
   * 用于测试列出所有 NFT 的功能
   */
  it("list All", async function () {
    // 获取列出 NFT 的价格
    const listPrice = await nftMarket.getListPrice();
    // 获取两个签名者实例，分别代表不同的用户
    const [signer1, signer2] = await ethers.getSigners();
    // 使用 signer1 连接到合约并调用 createToken 方法创建一个 NFT，传入 tokenURI 和价格，并支付列出价格
    await nftMarket.createToken("/uri", 5, {
      value: listPrice,
    });
    // 使用 signer2 连接到合约并调用 createToken 方法创建一个 NFT，传入 tokenURI 和价格，并支付列出价格
    await nftMarket.connect(signer2).createToken("/uri", 5, {
      value: listPrice,
    });
    // 调用合约的 getAllNFTs 方法获取所有 NFT 的列表
    const allNfts = await nftMarket.getAllNFTs();
    // 断言获取到的 NFT 列表长度为 2
    expect(allNfts.length).eq(2);
  });

  /**
   * 定义一个测试用例，名为 "list My token"
   * 用于测试列出某个用户的所有 NFT 的功能
   */
  it("list My token", async function () {
    // 获取列出 NFT 的价格
    const listPrice = await nftMarket.getListPrice();
    // 获取两个签名者实例，分别代表不同的用户
    const [signer1, signer2] = await ethers.getSigners();
    // 使用 signer1 连接到合约并调用 createToken 方法创建一个 NFT，传入 tokenURI 和价格，并支付列出价格
    await nftMarket.createToken("/uri", 5, {
      value: listPrice,
    });
    // 使用 signer1 连接到合约并再次调用 createToken 方法创建一个 NFT，传入 tokenURI 和价格，并支付列出价格
    await nftMarket.createToken("/uri", 5, {
      value: listPrice,
    });
    // 使用 signer2 连接到合约并调用 createToken 方法创建一个 NFT，传入 tokenURI 和价格，并支付列出价格
    await nftMarket.connect(signer2).createToken("/uri", 5, {
      value: listPrice,
    });
    // 调用合约的 getMyNFTs 方法获取 signer1 的所有 NFT 的列表
    let allNfts = await nftMarket.getMyNFTs();
    // 断言获取到的 signer1 的 NFT 列表长度为 2
    expect(allNfts.length).eq(2);
    // 使用 signer2 连接到合约并调用 getMyNFTs 方法获取 signer2 的所有 NFT 的列表
    allNfts = await nftMarket.connect(signer2).getMyNFTs();
    // 断言获取到的 signer2 的 NFT 列表长度为 1
    expect(allNfts.length).eq(1);
  });
});