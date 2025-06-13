### Developement instructions

- `$ yarn install` - _Install all dependencies_
- `$ echo PK="PRIVATE_KEY" > .env` - _Add testing private key_
- `$ npx hardhat compile` - _Compile all contracts_
- `$ npx hardhat test` - _Run all tests_

- Migrations are inside `scripts/` folder.
- Tests are inside `test/` folder.

node 版本：v18.19.1

部署流程

1. `npx hardhat run --network local scripts/deployment/deploy_c2n_token.js`
2. `npx hardhat run --network local scripts/deployment/deploy_airdrop_c2n.js`
3. `npx hardhat run --network local scripts/deployment/deploy_farm.js`
4. `npx hardhat run --network local scripts/deployment/deploy_ido.js`
5. `npx hardhat run --network local scripts/deployment/deploy_sales_token.js`
6. `npx hardhat run --network local scripts/deployment/deploy_sales.js`
7. `npx hardhat run --network local scripts/deployment/deploy_tge.js`

## makefile 命令解释

将脚本命令简化成了 make 直接可执行的命令，写到了 makefile 中

需要安装`make`编译工具，如果没有安装，直接执行 makefile 文件中的 js 命令也可以

命令列表：

- farm
  C2N 代币&空投&Farm 及指令
- ido
  C2N 代币&空投&Farm&IDO 流程及指令
