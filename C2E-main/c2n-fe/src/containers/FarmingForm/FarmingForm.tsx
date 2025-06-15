import { useEffect, useState, useMemo } from "react";
import { InputNumber, Row, Col, Divider, Tabs, Modal, Spin } from "antd";
const { TabPane } = Tabs;
import Router from "next/router";
import TransactionButton from "@src/components/elements/TransactionButton";
import { useAppDispatch } from "../../redux/hooks";
import { formatEther, seperateNumWithComma } from "@src/util/index";
import { useWallet } from "@src/hooks/useWallet";
import { useStake } from "@src/hooks/useStake";
import { useMessage } from "@src/hooks/useMessage";
import { useResponsive } from "@src/hooks/useResponsive";

import styles from "./FarmingForm.module.scss";
import { useErrorHandler } from "@src/hooks/useErrorHandler";
import AppPopover from "@src/components/elements/AppPopover";

type FarmingFormProps = {
  chainId; // 链 ID
  depositTokenAddress; // 质押代币地址
  earnedTokenAddress; // 收益代币地址
  stakingAddress; // 质押合约地址
  poolId; // 池子 ID
  available; // 是否可用
  depositSymbol; // 质押代币符号
  earnedSymbol; // 收益代币符号
  title; // 标题
  depositLogo; // 质押代币图标
  earnedLogo; // 收益代币图标
  getLptHref; // 获取流动性代币的链接
  aprRate; // 年化收益率
  aprUrl; // 年化收益率信息的链接
};

export default function FarmingForm(props: FarmingFormProps) {
  const [depositNum, setDepositNum] = useState<number>(); // 定义 depositNum 状态，用于存储质押数量，初始值为 undefined
  const [withdrawNum, setWithdrawNum] = useState<number>(); // 定义 withdrawNum 状态，用于存储提取数量，初始值为 undefined
  const [poolInfo, setPoolInfo] = useState<any>(null); // 定义 poolInfo 状态，用于存储池子信息，初始值为 null
  const [formVisible, setFormVisible] = useState<boolean>(false); // 定义 formVisible 状态，用于控制表单模态框的显示与隐藏，初始值为 false
  let poolInfoTimer = null; // 定义 poolInfoTimer 变量，用于存储定时器 ID，初始值为 null
  const [apr] = useState<any>("**"); // 定义 apr 状态，用于存储年化收益率，初始值为 '**'

  // 使用 useStake 钩子获取质押相关的状态和函数
  const {
    depositedAmount, // 已质押的数量
    earnedBre, // 已获得的收益
    balance, // 余额
    approve, // 授权函数
    deposit, // 质押函数
    withdraw, // 提取函数
    updateBalanceInfo, // 更新余额信息函数
    stakingContract, // 质押合约实例
    viewStakingContract, // 查看质押合约实例
    setDepositTokenAddress, // 设置质押代币地址函数
    setStakingAddress, // 设置质押合约地址函数
    setAllowanceAddress, // 设置授权地址函数
    setPoolId, // 设置池子 ID 函数
  } = useStake();

  // 从属性中解构出质押代币符号和收益代币符号
  const depositSymbol = props.depositSymbol;
  const earnedSymbol = props.earnedSymbol;

  const { setSuccessMessage, setErrorMessage } = useMessage();

  // 使用 useErrorHandler 钩子获取处理错误信息的函数
  const { getErrorMessage } = useErrorHandler();

  const { isDesktopOrLaptop } = useResponsive();

  // TODO: modify pool id
  const poolId = props.poolId;

  const { signer, chain, switchNetwork } = useWallet();

  // 当组件挂载时，设置池子 ID
  useEffect(() => {
    setPoolId(props.poolId);
  }, []);

  // 当 stakingContract 发生变化时，更新池子信息和余额信息
  useEffect(() => {
    if (!stakingContract) {
      clearInterval(poolInfoTimer);
      return;
    }
    clearInterval(poolInfoTimer);
    /**
     * 获取farm池子信息
     */
    const schedule = () => {
      getPoolInfo(poolId);
      updateBalanceInfo();
    };

    schedule();
    poolInfoTimer = setInterval(() => schedule, 20000);

    return () => {
      clearInterval(poolInfoTimer);
    };
  }, [stakingContract]);

  // 使用 useMemo 记忆化计算总质押量
  const totalDeposits = useMemo(() => {
    if (poolInfo) {
      return poolInfo.totalDeposits || 0;
    } else {
      return 0;
    }
  }, [poolInfo]);

  // 定义一年的秒数
  const secondsPerYear = 60 * 60 * 24 * 365;

  // 使用 useMemo 记忆化计算当前链是否可用
  const isChainAvailable = useMemo(() => {
    return chain?.chainId == props.chainId;
  }, [chain]);

  // 当链可用性或链信息发生变化时，更新质押代币地址或清除定时器
  useEffect(() => {
    if (isChainAvailable) {
      setDepositTokenAddress(props.depositTokenAddress);
    } else {
      clearInterval(poolInfoTimer);
    }
  }, [isChainAvailable, chain]);

  // 当签名者或链信息发生变化时，更新质押合约
  useEffect(() => {
    updateContracts();
  }, [signer, chain]);

  // 当已质押数量发生变化时，获取池子信息
  useEffect(() => {
    getPoolInfo(poolId);
  }, [depositedAmount]);

  /**
   * update staking contracts according to signer/chain
   * 根据签名者和链信息更新质押合约
   */
  function updateContracts() {
    if (chain?.chainId != props.chainId || !signer) {
      // clear contracts
      setStakingAddress("");
      setAllowanceAddress("");
      return;
    }
    if (props.stakingAddress) {
      setStakingAddress(props.stakingAddress);
      setAllowanceAddress(props.stakingAddress);
    }
  }

  /**
   * 获取池子信息
   * @param poolId 池子 ID
   */
  async function getPoolInfo(poolId) {
    if (!viewStakingContract) {
      return Promise.reject();
    }
    try {
      const ret =
        viewStakingContract.poolInfo &&
        (await viewStakingContract.poolInfo(poolId));
      setPoolInfo(ret);
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * on stake button click
   * 质押按钮点击事件处理函数
   */
  async function onStakeButtonClick() {
    if (depositNum == 0) {
      return;
    }
    await updateBalanceInfo();
    if (depositNum > formatEther(balance)) {
      setErrorMessage(`Not enough ${depositSymbol} to stake!`);
      return;
    }
    return approve(props.stakingAddress, depositNum)
      .then((txHash) => {
        return deposit(poolId, depositNum)
          .then((transaction) => transaction.wait())
          .then(() => {
            setSuccessMessage(
              "Congratulations, you have successfully deposited " +
                depositNum +
                " " +
                depositSymbol
            );
            setDepositNum(0);
            updateBalanceInfo();
          });
      })
      .catch((e) => {
        console.error(e);
        let msg = getErrorMessage(e);
        // FIXME: error of object cannot catch, hence handle string here.
        // 处理特定错误信息
        if (
          typeof e === "string" &&
          e.indexOf("ERC20: transfer amount exceeds allowance") > -1
        ) {
          msg = "Approve amount should be greater than staking amount!";
        }
        setErrorMessage("Stake failed. " + (msg || ""));
        updateBalanceInfo();
      });
  }

  /**
   * 提取按钮点击事件处理函数
   */
  function onWithdrawButtonClick() {
    return withdraw(poolId, withdrawNum)
      .then((transaction) => transaction.wait())
      .then(() => {
        setSuccessMessage("Withdraw success!");
        setWithdrawNum(0);
        updateBalanceInfo();
      })
      .catch((e) => {
        console.error(e);
        let msg = getErrorMessage(e);
        setErrorMessage("Withdraw failed. " + (msg || ""));
      });
  }

  /**
   * 收获按钮点击事件处理函数
   */
  function onHarvestButtonClick() {
    return withdraw(poolId, 0)
      .then((transaction) => {
        return transaction.wait();
      })
      .then(() => {
        setSuccessMessage("Harvest success!");
        updateBalanceInfo();
      })
      .catch((e) => {
        console.error(e);
        let msg = getErrorMessage(e);
        setErrorMessage("Harvest failed. " + (msg || ""));
      });
  }

  // 格式化已获得的收益
  const earnedBreInEther: number = formatEther(earnedBre);
  // 格式化已质押的数量
  const depositedAmountInEther: number =
    formatEther(depositedAmount, 4)?.toFixed(4) || 0;

  /**
   * 获取最大输入数量
   * @param num 输入的数量
   */
  function maxNumber(num) {
    return num > 0.01 ? num - 0.01 : num;
  }

  // 检查质押代币地址、收益代币地址和质押合约地址是否有效
  const checkValid =
    props.depositTokenAddress &&
    props.earnedTokenAddress &&
    props.stakingAddress;

  return (
    <div>
      {/* deposit form */}
      <Modal
        open={formVisible}
        title={null}
        footer={null}
        onCancel={() => {
          setFormVisible(false);
        }}
      >
        <Tabs
          className={styles["modal"]}
          type="card"
          items={[
            {
              label: "Stake", // 质押标签页
              key: "1",
              children: (
                <Row justify="space-between" gutter={[16, 16]}>
                  <Col span={isDesktopOrLaptop ? 24 : 24}>
                    <Row justify="space-between">
                      <div className="balance">
                        {stakingContract ? (
                          <>
                            Balance: {formatEther(balance, 4)?.toFixed(4)}{" "}
                            {depositSymbol}
                          </>
                        ) : (
                          <>Balance: -</>
                        )}
                      </div>
                      <div
                        className={styles["max"]}
                        onClick={() =>
                          setDepositNum(maxNumber(formatEther(balance)))
                        }
                      >
                        MAX
                      </div>
                    </Row>
                  </Col>
                  <Col span={isDesktopOrLaptop ? 24 : 24}>
                    <div className={styles["input"]}>
                      <InputNumber
                        className={styles["number"]}
                        value={depositNum}
                        max={formatEther(balance, 4)}
                        step="0.0001"
                        onChange={(value) =>
                          setDepositNum(value > 0 ? value : "")
                        }
                        stringMode
                        controls={false}
                        bordered={false}
                      />
                      <div className={styles["unit"]}>{depositSymbol}</div>
                    </div>
                  </Col>
                  <Col span={isDesktopOrLaptop ? 24 : 24}>
                    {props.available ? (
                      <TransactionButton
                        className={styles["button"]}
                        onClick={onStakeButtonClick}
                        loadingText="staking"
                        noConnectText={"Connect wallet to stake"}
                        requiredChainId={props.chainId}
                        switchNetworkText={"Switch network to stake"}
                        style={{ width: "100%" }}
                      >
                        Stake
                      </TransactionButton>
                    ) : (
                      <AppPopover content={"Coming soon"} wrap={true}>
                        <TransactionButton
                          className={[
                            styles["button"],
                            styles["disabled"],
                          ].join(" ")}
                          disabled={true}
                          onClick={() => {}}
                          requiredChainId={props.chainId}
                          switchNetworkText={"Switch network to stake"}
                          noConnectText={"Connect wallet to stake"}
                          style={{ width: "100%" }}
                        >
                          Stake
                        </TransactionButton>
                      </AppPopover>
                    )}
                  </Col>
                </Row>
              ),
            },
            {
              label: "Claim", // 收获标签页
              key: "2",
              children: (
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <div style={{ textAlign: "center", fontSize: "1.6em" }}>
                      Reward
                    </div>
                  </Col>
                  <Col span={24}>
                    <div style={{ textAlign: "center" }}>
                      <span style={{ fontSize: "1.2em" }}>
                        {earnedBre === null ? <Spin /> : earnedBreInEther}{" "}
                        {earnedSymbol}
                      </span>
                    </div>
                  </Col>
                  <Col span={isDesktopOrLaptop ? 24 : 24}>
                    {props.available ? (
                      <TransactionButton
                        className={styles["button"]}
                        onClick={onHarvestButtonClick}
                        noConnectText={"Connect wallet to withdraw"}
                        style={{ width: "100%" }}
                        loadingText="claiming"
                      >
                        Claim
                      </TransactionButton>
                    ) : (
                      <AppPopover content={"Coming soon"} wrap={true}>
                        <TransactionButton
                          className={[
                            styles["button"],
                            styles["disabled"],
                          ].join(" ")}
                          disabled={true}
                          onClick={() => {}}
                          noConnectText={"Connect wallet to claim"}
                          style={{ width: "100%" }}
                        >
                          Claim
                        </TransactionButton>
                      </AppPopover>
                    )}
                  </Col>
                </Row>
              ),
            },
            {
              label: "Unstake", // 提取标签页
              key: "3",
              children: (
                <Row gutter={[16, 16]}>
                  <Col span={isDesktopOrLaptop ? 24 : 24}>
                    <Row justify="space-between">
                      {stakingContract ? (
                        <>
                          <div className="balance">
                            Balance:{" "}
                            {formatEther(depositedAmount, 4)?.toFixed(4)}{" "}
                            {depositSymbol}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="balance">Balance: -</div>
                        </>
                      )}
                      <div
                        className={styles["max"]}
                        onClick={() =>
                          setWithdrawNum(
                            maxNumber(formatEther(depositedAmount, 4))
                          )
                        }
                      >
                        MAX
                      </div>
                    </Row>
                  </Col>
                  <Col span={isDesktopOrLaptop ? 24 : 24}>
                    <div className={styles["input"]}>
                      <InputNumber
                        className={styles["number"]}
                        value={withdrawNum}
                        max={formatEther(depositedAmount, 4)}
                        step="0.0001"
                        onChange={(value) =>
                          setWithdrawNum(value > 0 ? value : "")
                        }
                        stringMode
                        controls={false}
                        bordered={false}
                      />
                      <div className={styles["unit"]}>{depositSymbol}</div>
                    </div>
                  </Col>
                  <Col span={isDesktopOrLaptop ? 24 : 24}>
                    {props.available ? (
                      <TransactionButton
                        className={styles["button"]}
                        onClick={onWithdrawButtonClick}
                        loadingText="withdrawing"
                        noConnectText={"Connect wallet to withdraw"}
                        style={{ width: "100%" }}
                      >
                        Unstake
                      </TransactionButton>
                    ) : (
                      <AppPopover content={"Coming soon"} wrap={true}>
                        <TransactionButton
                          className={[
                            styles["button"],
                            styles["disabled"],
                          ].join(" ")}
                          disabled={true}
                          onClick={() => {}}
                          noConnectText={"Connect wallet to unstake"}
                          style={{ width: "100%" }}
                        >
                          Unstake
                        </TransactionButton>
                      </AppPopover>
                    )}
                  </Col>
                </Row>
              ),
            },
          ]}
        />
      </Modal>
      <div className={styles["farming-card"]}>
        {/* Disable in wrong network */}
         {/* 如果当前链不可用，显示遮罩层并允许切换网络 */}
        {isChainAvailable ? (
          <></>
        ) : (
          <div
            className={styles["mask"]}
            onClick={() => {
              switchNetwork(props.chainId);
            }}
          ></div>
        )}
        <section className={styles["container"]}>
          <Row
            className={styles["container-title"]}
            align="middle"
            justify="start"
          >
            &nbsp;
            {props.title}
          </Row>
          <Divider style={{ margin: "0" }}></Divider>
          <Row className={styles["apy"]} justify="center">
            {apr === null ? <Spin /> : <>{apr || "-"} %</>}
          </Row>
          <Row className={styles["apy-extra"]} justify="center">
            APR
          </Row>
          <div className={styles["records"]}>
            <Row className={styles["record"]} justify="space-between">
              <Col className={styles["record-label"]}>Earned</Col>
              <Col className={styles["record-value"]}>{earnedSymbol}</Col>
            </Row>
            <Row className={styles["record"]} justify="space-between">
              <Col className={styles["record-label"]}>Total staked</Col>
              <Col className={styles["record-value"]}>
                {poolInfo === null ? (
                  <Spin />
                ) : (
                  seperateNumWithComma(formatEther(totalDeposits))
                )}{" "}
                {depositSymbol}
              </Col>
            </Row>
            <Row className={styles["record"]} justify="space-between">
              <Col className={styles["record-label"]}>My staked</Col>
              <Col className={styles["record-value"]}>
                {depositedAmount === null ? <Spin /> : depositedAmountInEther}{" "}
                {depositSymbol}
              </Col>
            </Row>
            <Row className={styles["record"]} justify="space-between">
              <Col className={styles["record-label"]}>Available</Col>
              <Col className={styles["record-value"]}>
                {balance === null ? (
                  <Spin />
                ) : (
                  formatEther(balance, 4)?.toFixed(4) || 0
                )}{" "}
                {depositSymbol}
              </Col>
            </Row>
          </div>
          <Row>
            <TransactionButton
              className={[
                styles["button"],
                !checkValid && styles["disabled"],
              ].join(" ")}
              disabled={!checkValid}
              onClick={() => setFormVisible(true)}
              noConnectText={"Connect wallet to stake"}
              disabledText="Address not available"
              style={{ width: "100%" }}
            >
              Stake
            </TransactionButton>
          </Row>
          <Row className={styles["record"]} justify="space-between">
            <Col className={styles["record-label"]}>Rewards</Col>
            <Col className={styles["record-value"]}>
              {earnedBre === null ? <Spin /> : earnedBreInEther} {earnedSymbol}{" "}
              &nbsp;
              {checkValid && (
                <span
                  onClick={() => {
                    props.available && setFormVisible(true);
                  }}
                  className={styles["link"]}
                  style={{ background: "#DEDEDE", color: "#707070" }}
                >
                  Claim
                </span>
              )}
            </Col>
          </Row>
          <Row className={styles["record"]} justify="space-between">
            <Col className={styles["record-label"]}>{props.title}</Col>
            <Col className={styles["record-value"]}>
              <span
                onClick={() => {
                  Router.push("/");
                }}
                className={styles["link"]}
                style={{ background: "#D9EE77" }}
              >
                GET {depositSymbol}
              </span>
            </Col>
          </Row>
        </section>
      </div>
    </div>
  );
}
