# 声明

该项目仅用于教学用途，不存在商业用途。

# 项目背景

基于社区发展和学员学习进阶需要，C2N 社区推出启动台项目。整体项目定位是社区基础项目发行平台。
项目除了满足学习用途，更加鼓励同学在平台贡献自己的智慧和代码。

项目发展一共分为三个阶段：

#### 第一阶段：学习和任务阶段，C2N 技术团队和社区同学一起迭代该项目（4-5 月份）

#### 第二阶段：社区内部项目孵化阶段，满足社区同学发挥团队的创造力（6 月份开始）

#### 第三阶段：外部合作和开源发展阶段（待定）

# 产品需求

内部版本没有 kyc，注册流程
C2N launchpad 是一个区块链上的一个去中心化发行平台，专注于启动和支持新项目。它提供了一个平台，允许新的和现有的项目通过代币销售为自己筹集资金，同时也为投资者提供了一个参与初期项目投资的机会。下面是 C2N launchpad 产品流程的大致分析：

1. 项目申请和审核

- 申请：项目方需要在 C2N launchpad 上提交自己项目的详细信息，包括项目介绍、团队背景、项目目标、路线图、以及如何使用筹集的资金等。
- 审核：C2N launchpad 团队会对提交的项目进行审核，评估项目的可行性、团队背景、项目的创新性、以及社区的兴趣等。这一过程可能还包括与项目方的面对面或虚拟会议。

2. 准备代币销售

- 设置条款：一旦项目被接受，C2N launchpad 和项目方将协商代币销售的具体条款，包括销售类型（如公开销售或种子轮）、价格、总供应量、销售时间等。
- 准备市场：同时，项目方需要准备营销活动来吸引潜在的投资者。C2N launchpad 也可能通过其平台和社区渠道为项目提供曝光。

3. KYC 和白名单

- KYC 验证：为了符合监管要求，参与代币销售的投资者需要完成 Know Your Customer（KYC）验证过程。
- 白名单：完成 KYC 的投资者可能需要被添加到白名单中，才能在代币销售中购买代币。

4. 代币销售

- 销售开启：在预定时间，代币销售开始。根据销售条款，投资者可以购买项目方的代币。
- 销售结束：销售在达到硬顶或销售时间结束时关闭。

5. 代币分发

- 代币分发：销售结束后，购买的代币将根据约定的条款分发给投资者的钱包。

用户质押平台币，获得参与项目 IDO 的购买权重，后端配置项目信息并操作智能合约生成新的 sale，用户在 sale 开始之后进行购买，项目结束后，用户进行 claim

# 项目说明

该代码仓库共分为两个项目，分别为 Farm（质押挖矿,流动性挖矿）与 Sale（项目 IDO)

质押挖矿（Farming）的概念

质押挖矿是指用户将流动性提供（LP）代币存入一个智能合约（称为农场，Farm）中，来获取特定的 ERC20 代币奖励的过程。该过程通常包括以下几个主要步骤：

    存入LP代币：
    用户将流动性提供（LP）代币存入农场合约中。存入的LP代币代表用户在去中心化交易所（如Uniswap或SushiSwap）中提供的流动性。

    获取奖励：
    用户根据其质押的LP代币数量和时间，按比例获得ERC20代币奖励。奖励是根据区块时间或秒计算的。

    提取LP代币和奖励：
    用户可以随时提取其质押的LP代币，并获取其累积的ERC20代币奖励。

合约中的具体运作机制

合约 FarmingC2N 具体实现了上述过程，以下是该合约的一些关键点：

    结构体：
        UserInfo：存储每个用户的质押数量和奖励债务。
        PoolInfo：存储每个流动性池的信息，包括LP代币合约地址、分配点数、最后奖励计算时间、每股累积的ERC20奖励和总质押数量。

    核心变量：
        erc20：奖励代币的合约地址。
        rewardPerSecond：每秒奖励的ERC20代币数量。
        startTimestamp和endTimestamp：质押挖矿的开始和结束时间。
        totalRewards：农场总奖励的ERC20代币数量。
        totalAllocPoint：所有流动性池的总分配点数。

    主要函数：
        fund：向农场添加奖励代币，并延长质押挖矿的结束时间。
        add：添加新的流动性池。
        set：更新流动性池的分配点数。
        deposit：用户存入LP代币并更新其奖励。
        withdraw：用户提取LP代币并获取奖励。
        emergencyWithdraw：紧急情况下，用户可以提取其所有质押的LP代币，但不会获取奖励。
        pending：查看用户的待领取奖励。
        updatePool和massUpdatePools：更新流动性池的奖励变量。

操作流程示例

    管理员添加奖励代币：
    管理员调用fund函数向农场添加奖励代币，并设置结束时间。

    用户质押LP代币：
    用户调用deposit函数，将LP代币存入农场。

    用户获取奖励：
    用户调用withdraw函数，提取其质押的LP代币并获取相应的ERC20代币奖励。

    紧急提取：
    在紧急情况下，用户可以调用emergencyWithdraw函数，提取所有质押的LP代币，但不会获取任何奖励。

通过这个智能合约，质押挖矿提供了一种激励机制，使用户能够通过提供流动性来获得额外的代币奖励。

# Farm 部署流程

进入合约目录 c2n-contracts，安装依赖
`yarn install`

1. 启动本地链
   `npx hardhat node`

2. 部署 c2n token
   `npx hardhat run scripts/deployment/deploy_c2n_token.js --network localhost`

3. 部署 airdrop 合约
   `npx hardhat run scripts/deployment/deploy_airdrop_c2n.js --network localhost`

4. 部署 farm 合约

部署 farm 合约
`npx hardhat run scripts/deployment/deploy_farm.js --network localhost`

进入前端目录 c2n-fe，安装依赖
`yarn install`

5. 运行项目
   `yarn dev`

部署完毕，可以使用账号体验 farm 功能

6. 【如果要部署到 sepolia 测试链则需要把上述部署 c2n token、airdrop 合约部署脚本中的 localhost 改为 sepolia，并修改 hardhat.config.js 中 networks 配置】，复制.env.example 到.env,修改 PRIVATE_KEY, 要求 sepolia 上有测试 eth

## 具体操作

1. Farm 流程需要用到我们的 Erc20 测试代币 C2N, 可以在首页领取 C2N(一个账户只能领取一次),并且添加到我们 metamask，添加之后我们可以在 metamask 看到我们领取的 C2N 代币

2. 在我们 farm 界面，我们可以质押 fc2n 代币获取 c2n, (方便大家操作，我们的测试网 fc2n，c2n 是在上一步中领取的同一代币)，在这里我们有三个操作，stake:质押，unstake(withdraw):撤回质押， 以及 claim:领取奖励;

点击 stake 或者 claim 进入对应的弹窗，切换 tab 可以进行对应的操作； 3. Stake ，输入要质押的 FC2N 代币数量，点击 stake 会唤起钱包，在钱包中 confirm，然后等待交易完成；

我们新增质押了 1FC2N,交易完成之后我们会看到，My staked 从 0.1 变成 1.1;
Total staked 的更新是一个定时任务，我们需要等待一小段时间之后才能看到更新

3. Claim 领取质押奖励的 C2N,点击 claim 并且在钱包确认

交易完成后我们会看到 Available 的 FC2N 数量增加了 96，钱包里面 C2N 的代币数量同样增加了 96

4. Unstake(withdraw),输入需要撤回的 FC2N 数量(小于已经质押的 Balance)，点击 withdraw，并且在钱包确认交易

unstake 完成后我们可以看到 my staked 的数量变为 0

# 学员任务

为了帮助学员逐步完成以太坊智能合约 C2N Launchpad 开发的学习任务，下面我将根据合约代码，拆分出一系列循序渐进的开发任务，并提供详细的文档。这将帮助学员理解并实践如何构建一个基于以太坊的农场合约（Farming contract），用于分配基于用户质押的流动性证明（LP tokens）的 ERC20 代币奖励。

## 概述

FarmingC2N 合约是一个基于以太坊的智能合约，主要用于管理和分发基于用户质押的流动性证明(LP)代币的 ERC20 奖励。该合约允许用户存入 LP 代币，并根据质押的数量和时间来计算和分发 ERC20 类型的奖励。
开发任务拆分

## 任务一：了解基础合约和库的使用

1. 阅读和理解 OpenZeppelin 库的文档：熟悉 IERC20、SafeERC20、SafeMath、Ownable 这些库的功能和用途。
2. 创建基础智能合约结构：根据 openZeppelin 库，导入上述合约。

## 任务二：用户和池子信息结构定义

1. 定义用户信息结构（UserInfo）：

- 学习如何在 Solidity 中定义结构体。
- 定义 uint256 类型的 amount,和 uint256 rewardDebt 字段
  在后续实现中会根据用户信息进行一些数学计算。

```
说明：在任何时间点，用户获得但还尚未分配的 ERC20 数量为：
pendingReward = (user.amount * pool.accERC20PerShare) - user.rewardDebt
每当用户向池中存入或提取 LP 代币时，会发生以下情况：
1. 更新池的 `accERC20PerShare`（和 `lastRewardBlock`）。
2. 用户收到发送到其地址的待分配奖励。
3. 用户的 `amount` 被更新。
4. 用户的 `rewardDebt` 被更新。
```

2. 定义池子信息结构（PoolInfo）：

- 理解并定义池子信息，包括 LP 代币地址、分配点、最后奖励时间戳等。

参考答案：

```
struct UserInfo {
    uint256 amount;
    uint256 rewardDebt;
}
struct PoolInfo {
    IERC20 lpToken;             // Address of LP token contract.
    uint256 allocPoint;         // How many allocation points assigned to this pool. ERC20s to distribute per block.
    uint256 lastRewardTimestamp;    // Last timstamp that ERC20s distribution occurs.
    uint256 accERC20PerShare;   // Accumulated ERC20s per share, times 1e36.
    uint256 totalDeposits; // Total amount of tokens deposited at the moment (staked)
}
```

## 任务三：合约构造函数和池子管理

首先我们先定义一些状态变量

- erc20：代表 ERC20 奖励代币的合约地址。
- rewardPerSecond：每秒产生的 ERC20 代币奖励数量。
- totalAllocPoint：所有矿池的分配点总和。
- poolInfo：所有矿池的数组。
- userInfo：记录每个用户在每个矿池中的信息。
- startTimestamp 和 endTimestamp：奖励开始和结束的时间戳。
- paidOut：已经支付的奖励总额。
- totalRewards：总的奖励额。

1. 编写合约的构造函数：

- 初始化 ERC20 代币地址、奖励生成速率和起始时间戳。

2. 实现添加新的 LP 池子的功能（add 函数）：

- 按照 poolInfo 的结构，添加一个 pool，并指定是否需要批量 update 合约资金信息
- 注意判断 lastRewardTimestamp 逻辑，如果大于 startTimestamp，则为当前块高时间，否则还未开始发放奖励，设置为 startTimestamp
- 学习权限管理，确保只有合约拥有者可以添加池子。

参考答案：

```
constructor(IERC20 _erc20, uint256 _rewardPerSecond, uint256 _startTimestamp) public {
    erc20 = _erc20;
    rewardPerSecond = _rewardPerSecond;
    startTimestamp = _startTimestamp;
    endTimestamp = _startTimestamp;
}

function add(uint256 _allocPoint, IERC20 _lpToken, bool _withUpdate) public onlyOwner {
    if (_withUpdate) {
        massUpdatePools();
    }
    uint256 lastRewardTimestamp = block.timestamp > startTimestamp ? block.timestamp : startTimestamp;
    totalAllocPoint = totalAllocPoint.add(_allocPoint);
    poolInfo.push(PoolInfo({
    lpToken : _lpToken,
    allocPoint : _allocPoint,
    lastRewardTimestamp : lastRewardTimestamp,
    accERC20PerShare : 0,
    totalDeposits : 0
    }));
}
```

## 任务四：fund 功能实现

合约的所有者或授权用户可以通过此函数向合约注入 ERC20 代币，以延长奖励分发时间。
需求：

1. 确保合约在当前时间点仍可接收资金，即未超过奖励结束时间
2. 从调用者账户向合约账户安全转移指定数量的 ERC20 代币
3. 根据注入的资金量和每秒奖励数量，计算并延长奖励发放的结束时间
4. 更新合约记录的总奖励量
   参考答案

```
function fund(uint256 _amount) public {
    require(block.timestamp < endTimestamp, "fund: too late, the farm is closed");
    erc20.safeTransferFrom(address(msg.sender), address(this), _amount);
    endTimestamp += _amount.div(rewardPerSecond);
    totalRewards = totalRewards.add(_amount);
}
```

## 任务五：核心功能开发，奖励机制的实现

编写更新单个池子奖励的函数（updatePool）：

- 理解如何计算每个池子的累计 ERC20 代币每股份额。
- 需求说明: 该函数主要功能是确保矿池的奖励数据是最新的，并根据最新数据更新矿池的状态，需要实现以下功能：
  1. 更新矿池的奖励变量
     updatePool 需要针对指定的矿池 ID 更新矿池中的关键奖励变量，确保其反映了最新的奖励情况。这包括：
  - 更新最后奖励时间戳： 如果池子还未结束，将矿池的 lastRewardTimestamp 更新为当前时间戳，以确保奖励的计算与时间同步，否则 lastRewardTimestamp = endTimestamp
  - 计算新增的奖励：根据从上次奖励时间到现在的时间差，结合矿池的分配点数和全局的每秒奖励率，计算此期间应该新增的 ERC20 奖励量。
  2. 累加每股累积奖励
     根据新计算出的奖励量，更新矿池的 accERC20PerShare（每股累积 ERC20 奖励）：
  - 奖励分配：将新增的奖励量按照矿池中当前 LP 代币的总量（totalDeposits）进行分配，计算出每份 LP 代币所能获得的奖励，并更新 accERC20PerShare。
  3. 确保时间和奖励的正确性
     处理边界条件，确保在计算奖励时，各种时间点和奖励量的处理是合理和正确的：
  - 时间边界处理：如果当前时间已经超过了奖励分配的结束时间（endTimestamp），则需要相应调整逻辑以防止奖励超发。
  - LP 代币总量检查：如果矿池中没有 LP 代币（totalDeposits 为 0），则不进行奖励计算，直接更新时间戳。
    参考实现：

```
function updatePool(uint256 _pid) public {
    PoolInfo storage pool = poolInfo[_pid];
    uint256 lastTimestamp = block.timestamp < endTimestamp ? block.timestamp : endTimestamp;

    if (lastTimestamp <= pool.lastRewardTimestamp) {
        return;
    }
    uint256 lpSupply = pool.totalDeposits;

    if (lpSupply == 0) {
        pool.lastRewardTimestamp = lastTimestamp;
        return;
    }

    uint256 nrOfSeconds = lastTimestamp.sub(pool.lastRewardTimestamp);
    uint256 erc20Reward = nrOfSeconds.mul(rewardPerSecond).mul(pool.allocPoint).div(totalAllocPoint);

    pool.accERC20PerShare = pool.accERC20PerShare.add(erc20Reward.mul(1e36).div(lpSupply));
    pool.lastRewardTimestamp = block.timestamp;
}
```

1. 实现用户存入和提取 LP 代币的功能（deposit 和 withdraw 函数）：

- 理解如何更新用户的 amount 和 rewardDebt。 - Deposit: 函数允许用户将 LP 代币存入指定的矿池，以参与 ERC20 代币的分配。 - 更新矿池奖励数据：调用 updatePool 函数，保证矿池数据是最新的，确保奖励计算的正确性。 - 计算并发放挂起的奖励：如果用户已有存款，则计算用户从上次存款后到现在的挂起奖励，并通过 erc20Transfer 发放这些奖励。 - 接收用户存款：通过 safeTransferFrom 函数，从用户账户安全地转移 LP 代币到合约地址。 - 更新用户存款数据：更新用户在该矿池的存款总额和奖励债务，为下次奖励计算做准备。 - 记录事件：发出 Deposit 事件，记录此次存款操作的详细信息。 - Withdraw - 更新矿池奖励数据：调用 updatePool 函数更新矿池的奖励变量，确保奖励的准确性。 - 计算并发放挂起的奖励：计算用户应得的挂起奖励，并通过 erc20Transfer 将奖励发放给用户。 - 提取 LP 代币：安全地将用户请求的 LP 代币数量从合约转移到用户账户。 - 更新用户存款数据：更新用户的存款总额和奖励债务，准确记录用户的新状态。 - 记录事件：发出 Withdraw 事件，记录此次提款操作的详细信息。
  参考答案：

```
// Deposit LP tokens to Farm for ERC20 allocation.
function deposit(uint256 _pid, uint256 _amount) public {
    PoolInfo storage pool = poolInfo[_pid];
    UserInfo storage user = userInfo[_pid][msg.sender];

    updatePool(_pid);

    if (user.amount > 0) {
        uint256 pendingAmount = user.amount.mul(pool.accERC20PerShare).div(1e36).sub(user.rewardDebt);
        erc20Transfer(msg.sender, pendingAmount);
    }

    pool.lpToken.safeTransferFrom(address(msg.sender), address(this), _amount);
    pool.totalDeposits = pool.totalDeposits.add(_amount);

    user.amount = user.amount.add(_amount);
    user.rewardDebt = user.amount.mul(pool.accERC20PerShare).div(1e36);
    emit Deposit(msg.sender, _pid, _amount);
}

// Withdraw LP tokens from Farm.
function withdraw(uint256 _pid, uint256 _amount) public {
    PoolInfo storage pool = poolInfo[_pid];
    UserInfo storage user = userInfo[_pid][msg.sender];
    require(user.amount >= _amount, "withdraw: can't withdraw more than deposit");
    updatePool(_pid);

    uint256 pendingAmount = user.amount.mul(pool.accERC20PerShare).div(1e36).sub(user.rewardDebt);

    erc20Transfer(msg.sender, pendingAmount);
    user.amount = user.amount.sub(_amount);
    user.rewardDebt = user.amount.mul(pool.accERC20PerShare).div(1e36);
    pool.lpToken.safeTransfer(address(msg.sender), _amount);
    pool.totalDeposits = pool.totalDeposits.sub(_amount);

    emit Withdraw(msg.sender, _pid, _amount);
}
```

## 任务六：紧急提款和奖励分配

1. 实现紧急提款功能（emergencyWithdraw 函数）：

- 让用户在紧急情况下提取他们的 LP 代币，但不获取奖励。

2. 实现 ERC20 代币转移的内部函数（erc20Transfer）：

- 确保奖励正确支付给用户。
  参考答案：

```
// Withdraw without caring about rewards. EMERGENCY ONLY.
function emergencyWithdraw(uint256 _pid) public {
    PoolInfo storage pool = poolInfo[_pid];
    UserInfo storage user = userInfo[_pid][msg.sender];
    pool.lpToken.safeTransfer(address(msg.sender), user.amount);
    pool.totalDeposits = pool.totalDeposits.sub(user.amount);
    emit EmergencyWithdraw(msg.sender, _pid, user.amount);
    user.amount = 0;
    user.rewardDebt = 0;
}

// Transfer ERC20 and update the required ERC20 to payout all rewards
function erc20Transfer(address _to, uint256 _amount) internal {
    erc20.transfer(_to, _amount);
    paidOut += _amount;
}
```

## 任务七：合约测试和部署

1. 编写测试用例：

- 使用 Hardhat 的框架进行合约测试。

2. 部署合约到测试网络（Sepolia）：

- 学习如何在公共测试网络上部署和管理智能合约。

## (选做) 前端集成和交互

1. 开发一个简单的前端应用：

- 使用 Web3.js 或 Ethers.js 与智能合约交互。

2. 实现用户界面：

- 允许用户通过网页界面存入、提取 LP 代币，查看待领取奖励。

# 任务重难点分析

在上述的智能合约代码中，奖励机制的核心功能围绕着分配 ERC20 代币给在不同流动性提供池（LP pools）中质押 LP 代币的用户。这个过程涉及多个关键步骤和计算，用以确保每个用户根据其质押的 LP 代币数量公平地获得 ERC20 代币奖励。下面将详细解释这个奖励机制的实现过程。

## 奖励计算原理

1. 用户信息（UserInfo）和池子信息（PoolInfo）：

- UserInfo 结构存储了用户在特定池子中质押的 LP 代币数量（amount）和奖励债务（rewardDebt）。奖励债务表示在最后一次处理后，用户已经计算过但尚未领取的奖励数量。
- PoolInfo 结构包含了该池子的信息，如 LP 代币地址、分配点（用于计算该池子在总奖励中的比例）、最后一次奖励时间戳、累计每股分配的 ERC20 代币数（accERC20PerShare）等。

2. 累计每股分配的 ERC20 代币（accERC20PerShare）的计算：

- 当一个池子接收到新的存款、提款或奖励分配请求时，系统首先调用 updatePool 函数来更新该池子的奖励变量。
- 计算从上一次奖励到现在的时间内，该池子应分配的 ERC20 代币总量。这个总量是基于时间差、池子的分配点和每秒产生的奖励量来计算的。
- 将计算出的奖励按照池子中总 LP 代币数量平分，更新 accERC20PerShare，确保每股的奖励反映了新加入的奖励。

3. 用户奖励的计算：

- 当用户调用 deposit 或 withdraw 函数时，合约首先计算用户在这次操作前的待领取奖励。
- 待领取奖励是通过将用户质押的 LP 代币数量乘以池子的 accERC20PerShare，然后减去用户的 rewardDebt 来计算的。这样可以得到自上次用户更新以来所产生的新奖励。
- 用户完成操作后，其 amount（如果是存款则增加，如果是提款则减少）和 rewardDebt 都将更新。新的 rewardDebt 是用户更新后的 LP 代币数量乘以最新的 accERC20PerShare。

## 奖励发放

- 在用户进行提款（withdraw）操作时，计算的待领取奖励会通过 erc20Transfer 函数直接发送到用户的地址。
- 这种奖励分配机制确保了用户每次质押状态变更时，都会根据其质押的时间和数量公平地获得相应的 ERC20 代币奖励。

通过这种设计，智能合约能够高效且公平地管理多个 LP 池子中的奖励分配，使得用户对质押 LP 代币和领取奖励的过程感到透明和公正。

# IDO

## IDO 部署流程

1. 后台启动

按照 c2n-be 中的 README 执行部署

2. 合约部署

`cd c2n-contract`

安装合约依赖

`yarn install`

启动本地链

`npx hardhat node`

部署相关合约

`make ido`

3. 前台启动

进入前端目录

`cd c2n-fe`

安装依赖

`yarn install`(farm 流程中安装过可以跳过)

本地启动前台项目

`yarn dev`

## 具体操作

以下合约部署内容(带\*步骤)以及需要的参数设置部分都简化到了 Makefile 当中，直接执行`make ido`即可完成部署，同学先将项目部署运行，学习时再拆开理解每步操作的含义

1. 启动 docker 后台（部署项目后台）
2. 启动本地链
3. 部署销售工厂和质押合约\*
4. 部署 mock 代币合约\*
5. 设置 IDO 销售流程（salesConfig.json）参数，部署销售合约\*
6. 将部署销售合约后的 json 写入后台数据库\*
7. 将 MCK 打入销售合约地址\*
8. 环境部署完成，启动前台应用
9. 质押 C2N 代币获取注册权限（无 C2N 代币需要领空投）
10. 项目 IDO 注册开始后进行注册
11. MCK 代币销售流程时购买代币
12. 等待代币解锁后提取 MCK 代币

# 学员任务

## 概述

LaunchPad-IDO 是 launchPad 去中心化平台提供的发行代币的业务，项目发行代币在 web3 中是一个非常重要的过程，IDO 模块的学习与 Farm 部分的目标不同，在 IDO 的学习中，建议同学更侧重对业务流程的学习，通过学习 IDO 可以了解一个 web3 项目在实际生产中，如何通过一个平台发行自己的项目代币，这之中需要经历的具体流程及其实现。

## 任务一：了解 IDO 的业务流程

观看视频学习 IDO 的业务流程，了解一些基本概念，在项目学习过程中会需要这些基本概念作为铺垫

了解业务中 平台、项目方、投资人各自扮演的角色。

项目中涉及到的平台代币 C2N 和项目代币 MCK，需要理解这两个代币的角色。

了解 IDO 的步骤：质押、注册、准备、销售、发放，理解每个状态对应的操作。

作为扩展了解，同学可以简单了解 IEO、IPO、ICO（ICO 在我国已经禁止，但可以学习了解，以太币就是 ICO）等流程

## 任务二：熟悉业务操作流程

结合视频部署教学，自行操作部署 IDO 相关合约和环境，在实践中带入理解整个流程

理解每一步部署的合约的作用

### 合约部署

以下步骤是`make ido`执行的脚本内容（除开部署 c2n、farm、airdrop 合约的部分）

1. deploy_singletons.js：用于部署质押合约和销售工厂合约，质押合约的作用是，参与购买项目代币的用户，前提需要质押一定数量的 C2N 代币，这里的质押就是这个合约的作用。销售工厂合约的作用是后面部署销售合约使用。
2. deploy_mock_token.js：mock_token 是课程中使用的项目代币合约 MCK，IDO 之后投资人购买的就是 MCK 代币。
3. deploy_sales.js：用于部署 IDO 销售流程的合约，包含了 IDO 的核心流程，对应需要在 saleConfig.js 中配置 IDO 的每个步骤时间节点。sales 合约部署后，会生成一个 json，这个 json 会保存到 docker 启动的后台数据库中，后台存储这部分项目数据到数据库，前台和后台数据库交互（为什么有些内容要用到后台数据库：项目数据不涉及金融交易，不用所有的数据都存储在链上，链上存储是非常昂贵的，如果有条件，非关键数据尽量不存储在链上，另外比如跨链的数据访问，以后台作为中转，展示起来也更方便），saleConfig.json 中几个关键参数：
   1. registrationStartAt：【测试推荐设置当前时间半分钟后】注册开始时间（用户等待注册开始后才能注册）
   2. registrationLength：【测试推荐设置 100】注册持续时间（用户需要质押 C2N 代币才能注册，这个时间之后关闭用户注册）
   3. delayBetweenRegistrationAndSale：【测试推荐设置 10，因为测试实际没有操作，设置一个非 0 值快速跳过即可】（注册和销售之间的时间，一般这段时间平台方会进行项目和注册用户的资格审查，添加黑白名单，项目运营等活动）
   4. saleRoundLength：购买时间【推荐设置 200】，这个时间里，用户购买 MCK 代币，但此时代币还没真正转给用户。
   5. TGE：代币生成事件，这个事件代表代币生成的时间，这个时间点后用户可以真实获取到代币。【设置到上述参数时间之和之后】
   6. 以下三个参数，项目中前后台交互部分作了省略，做个介绍，有能力同学可以扩展
      1. unlockingTimes、portionPercents、portionVestingPrecision，这两个参数是配置分批量发行，如果一次性发放所有的代币，如果有购买的用户大量抛售，会导致代币价格产生大幅波动，为避免这种现象，一般会分批次解锁代币，这三个参数就是设置解锁的时间和比例的参数。设置条件：portionVestingPrecision 设置 10000，那么 portionPercents 数组的总和保证是 10000，portionPercents 的数组长度和 unlockingTimes 保持一致，unlockingTimes 是一个递增数组。
      2. 项目中未对该处做限定，一次解锁所有代币，【unlockingTimes 参数设置到 TGE 之后即可】
4. deploy_tge.js：我们需要将一些 MCK 打入 sale 地址，作为初始化发行 token 的数量。

### 后台监听

上述的 deploy_sale.js 步骤中，后台 java 监听了销售合约的部署，将部署的参数设置到了后台数据库中【即前台在 ido 页面看到的项目的内容】，再次说明，为什么有些内容要用到后台数据库：项目数据不涉及重要业务（比如转账）的部分，不用所有的数据都存储在链上，链上存储是非常昂贵的，如果有条件，非关键数据可以尽量不存储在链上，另外的场景比如跨链的数据访问，以后台作为中转，展示起来也更方便

### 前台操作

启动前台项目，进入项目页面，完成上述 IDO 合约部署操作后，可以看到项目正在等在注册流程开始

前台页面操作，执行 IDO 流程

1. 等待 IDO 注册开始后，质押代币，获得参与购买 MCK-TOKEN 的权限
2. 等待销售流程开始
3. 销售流程开始后，使用 ETH 购买 MCK-TOKEN，此时，MCK-TOKEN 没有打入用户账户中，而是锁定在合约中，等待解锁
4. 等待代币解锁时间到后，用户可以 withdraw MCK-TOKEN，用户在前台页面 withdraw MCK-TOKEN，IDO 执行完成

### 流程说明

- 如何开启 IDO：项目团队准备好白皮书、智能合约和代币分发计划等必要材料，寻找交易平台发起 IDO，并且对即将开始的 IDO 进行各种渠道的推广（媒体、社交平台等）。

- 平台方审核材料后，启动项目 IDO，这个过程中，投资者（本项目中就是购买 MCK 的人）等待 IDO 流程启动，这期间投资者关注项目的公告和时间表，了解 IDO 的具体时间和参与方式。

- 项目开始进入注册流程后，投资者通过质押 C2N 代币获得注册权限，通过注册获得参与购买 MCK 的权限，此时平台方还会对投资者进行资格审查，比如 KYC、AML 审查，确保投资的合法性

- 等到注册流程终止，投资者需等待代币销售流程开始，在销售开始之前，平台方还会进行各种活动，以及资格审查等操作，比如将部分投资者纳入黑白名单

- 销售代币流程开始，投资者在此期间参与 MCK-TOKEN 的购买，将自己的资金（一般是主流代币 ETH 或者一些稳定币比如 USDT、USDC 参与购买，本项目使用的 ETH）锁定在代币池中，此时投资者并没有获取这部分代币，只是锁定了代币，代币还不能使用，这一步不直接发放 TOKEN

- 交易结束后等待 TGE（代币生成事件），TGE 后购买的 MCK 才正式解锁，投资者在这之前还不能取走购买的 TOKEN，这期间平台准备以下这些操作

1. 审查交易记录，确定投资人白名单（或者黑名单）
2. 准备 TGE

- TGE 发生过后，投资人可以取走之前购买的 MCK，平台方一般不会一次性解锁全部代币以避免大量抛售导致的价格波动，一般会分批按比例解锁用户购买的代币，平台也可以分批将代币转入代币池中（具体可以看 deploy_tge.js 脚本中的内容），平台通过将 MCK 打入 sale 合约来出售代币。投资者在 TGE 后可以从代币池中取走代币，用于各种交易和投资活动中。

## 任务三：签名加密

IDO 项目的注册流程中，后台用 web3.j 实践了以太坊签名验证，建议根据视频课程，学习以太坊相关的签名加密的内容，视频课程在网盘中，不限制一定要按照项目中的实现，重点了解签名工具方法的使用（主要是 keccak256【这个方法在以太坊中非常多的场景中有应用比如函数选择器】），对签名验证的函数做了解，知道如何使用即可（不需要关注椭圆加密的实现，r、s、v 这些参数是什么，为什么要这些参数【这块有兴趣了解自行查资料学习即可，实际使用不需要研究其数学原理】）

## 任务四：根据自身技术栈学习相关内容\*（自学部分）

根据自身技术栈学习相关内容，选择侧重点完善自己的简历
前端：

- web3react（初始化注入钱包：src/util/web3React，了解如何初始化钱包配置）、ethers.js（js 与区块链交互）
- antd 组件库、redux（前端状态管理库）
- nextjs（项目使用的服务端渲染框架）
- vercel（前端项目部署）
- 其它项目使用的一些三方库（可以添加到简历中【比如 qrcode.react 等】）

合约：（后端和合约建议关注同样的内容）

- 合约部分（openzeppelin、升级相关的合约内容代码了解）
- 合约单测
- 合约部署脚本

后端：

- docker 容器化部署
- web3j 做加密解密签名
- web3j 监听链上事件状态
- web3j 创建合约对象
- 链上事件监听后，将销售项目配置存储到数据库

## 建议有能力的同学拓展开发项目模块\*

1. 参考现在 java 的后台实现，用 go 重写后台逻辑（使用 go-ethereum），扩展业务内容，比如通过后台监听合约事件，存储变量
2. 前台工程化优化（脚本、配置等可以做生产、开发模式的工程化重构），加入一些性能监控、前台单测、打包优化、nextjs 升级等
