import React, { useCallback, useMemo, useState, useEffect } from "react";
import { ProjectData } from "@src/types/ProjectData";
import { formatDate } from "@src/util/index";
import { Row, Col, Statistic } from "antd";
import styleNames from "./LivePoolCard.module.scss";
import AppPopover from "@src/components/elements/AppPopover";
import {
  formatEther,
  seperateNumWithComma,
  formatNumber,
} from "@src/util/index";
import { useThirdParty } from "@src/hooks/useThirdParty";
import { useResponsive } from "@src/hooks/useResponsive";

const { Countdown } = Statistic;
/**
 * Basic Button
 */

interface LivePoolCardProds {
  info: ProjectData;
  className?: any;
  styleNames?: any;
  onClick?: any;
}

/**
 * 判断是否添加 'loading-element' 类名
 * @param className - 原始类名
 * @param value - 要判断的值
 * @returns 如果值存在，则返回原始类名；否则返回添加了 'loading-element' 的类名
 */
const judgeClassName = (className, value) => {
  return value !== undefined ? className : className + " loading-element";
};

export default function LivePoolCard(props: LivePoolCardProds) {
  // 从属性中获取项目信息，如果未提供则初始化为空对象
  const info = props.info || ({} as ProjectData);
  // 合并默认样式和可能传入的自定义样式
  const styles =
    (props.styleNames && Object.assign(styleNames, props.styleNames)) ||
    styleNames;

  const { ethToUsd, getEthToUsd } = useThirdParty();

  // 使用 useThirdParty 钩子获取以太坊到美元的兑换率和更新该兑换率的函数
  useEffect(() => {
    getEthToUsd();
  }, [info]);

  const { isDesktopOrLaptop } = useResponsive();

  // 定义状态变量 status，用于存储项目的状态，初始值为 -1
  const [status, setStatus] = useState<number>(-1);

  useEffect(() => {
    info && setStatus(info.status);
  }, [info]);

  // console.log(status);
  // 定义一个函数format，用于将时间戳格式化为指定的日期时间格式
  function format(dataString) {
    // 将dataString转换为Date对象
    var time = new Date(dataString);
    // 获取年份
    var year = time.getFullYear();
    // 获取月份，注意月份是从0开始计数的，所以要加1
    var month = time.getMonth() + 1;
    // 获取日期
    var day = time.getDate();
    // 获取小时
    var hour = time.getHours();
    // 获取分钟
    var minute = time.getMinutes();
    // 获取秒数
    var second = time.getSeconds();
    // 返回格式化后的日期时间字符串
    return (
      year +
      "-" +
      (month < 10 ? "0" + month : month) +
      "-" +
      (day < 10 ? "0" + day : day) +
      " " +
      (hour < 10 ? "0" + hour : hour) +
      ":" +
      (minute < 10 ? "0" + minute : minute) +
      ":" +
      (second < 10 ? "0" + second : second)
    );
  }
  console.log(
    format(info.registrationTimeStarts),
    format(info.registrationTimeEnds),
    format(info.saleStart),
    format(info.saleEnd),
    format(info.unlockTime)
  );
  /**
   * 创建基本元素的回调函数
   * @param key - 项目信息中的键
   * @param className - 元素的类名
   * @param mapper - 可选的映射函数，用于处理键对应的值
   * @returns JSX 元素
   */
  const basicElement = useCallback(
    (key, className, mapper?) => {
      const _className = (className || key || "")
        .replace(/([A-Z])/g, "-$1")
        .toLowerCase();
      const value = (mapper && mapper(info[key])) || info[key];
      return (
        <div className={judgeClassName(styles[_className], value)}>
          {value || "\u00a0"}
        </div>
      );
    },
    [info]
  );

  /**
   * 计算销售进度的记忆化函数
   * @returns 销售进度的百分比，范围在 0 到 100 之间，保留两位小数
   */
  const progress = useMemo(() => {
    let p =
      (formatEther(info.totalTokensSold) * 125) /
      formatEther(info.amountOfTokensToSell || 1);
    p = p > 100 ? 100 : p < 0 ? 0 : p;
    p = parseFloat(p.toFixed(2));
    return p;
  }, [info]);

  /**
   * 计算代币美元价格的记忆化函数
   * @returns 代币的美元价格，保留八位小数
   */
  const tokenPriceInUsd: number = useMemo(() => {
    // FIXME: get paymentTokenDecimals from backend
    // 从后端获取支付代币的小数位数，如果未提供则默认为 0
    const paymentTokenDecimals = props?.info?.paymentTokenDecimals || 0;
    // 计算代币的以太坊价格
    const tokenPriceInETH = props?.info?.tokenPriceInPT
      ? Number(props.info.tokenPriceInPT) / Math.pow(10, paymentTokenDecimals)
      : 0;
    return ethToUsd * tokenPriceInETH;
  }, [props]);

  /**
   * 创建倒计时组件的记忆化函数
   * @returns 倒计时组件或空元素
   */
  const timer = useMemo(() => {
    return (
      <div className={styles["timer"]}>
        <span style={{ marginRight: "4px" }}>
          {/* 根据项目状态显示相应的提示信息 */}
          {[
            "Register starts in:",
            "Register ends in:",
            "Sale starts in:",
            "Sale ends in:",
            "Token unlocks in:",
            "Sale ended",
          ][status] || "To start"}
        </span>
        {status > -1 && status < 5 ? (
          <Countdown
            className={styles["counter"]}
            valueStyle={{ fontSize: "16px", color: "#D7FF1E" }}
            key={status}
            value={
              [
                info.registrationTimeStarts,
                info.registrationTimeEnds,
                info.saleStart,
                info.saleEnd,
                info.unlockTime,
              ][info.status]
            }
            format="HH:mm:ss"
            onFinish={() => {
              setStatus(status + 1); // 倒计时结束时，将项目状态加 1
            }}
          />
        ) : (
          ""
        )}
      </div>
    );
  }, [info, status]);

  /**
   * 解析项目信息中的 'tricker' 字段的记忆化函数
   * @returns 解析后的对象或 undefined
   */
  const trickers = useMemo(() => {
    let ret;
    try {
      ret = JSON.parse(info?.tricker);
    } catch (e) {
      // do nothing
    }
    return ret;
  }, [info]);

  // 如果项目状态为 -1，表示项目尚未开始
  if (info.status == -1) {
    return (
      <div
        className={`${styles["live-pool-card"]} ${props.className || ""} ${
          styles["not-start"]
        }`}
        onClick={props.onClick}
        style={
          trickers?.cardBackground
            ? {
                backgroundImage: `url(${trickers.cardBackground})`,
              }
            : {}
        }
      >
        {isDesktopOrLaptop ? timer : <></>}
        <Row
          justify="start"
          align={isDesktopOrLaptop ? "middle" : "top"}
          gutter={16}
          style={{ marginTop: "30px" }}
        >
          <Col span={isDesktopOrLaptop ? 6 : 8} style={{ textAlign: "center" }}>
            {/* icon */}
            {/* 显示项目图标 */}
            <i
              className={judgeClassName(styles["icon-logo"], info.img)}
              style={info.img ? { backgroundImage: `url(${info.img})` } : {}}
            ></i>
          </Col>
          <Col span={isDesktopOrLaptop ? 18 : 16}>
            {/* product name / title */}
            {/* 显示项目名称 显示项目描述 如果是移动设备，则显示倒计时组件*/}
            {basicElement("name", "productName")}
            {basicElement("description", "describe")}
            {isDesktopOrLaptop ? <></> : timer}
          </Col>
        </Row>
        <Row
          justify="start"
          align="middle"
          style={{ marginTop: "20px" }}
          className={styles["total-raise-wrapper"]}
        >
          <div className={styles["total-raise-label"]}>Total raised</div>
          <AppPopover
            content={
              <>
                {seperateNumWithComma(
                  info && (info.totalRaised / 1).toFixed(2)
                )}
              </>
            }
          >
            {/* 显示总筹集金额，初始显示为 $ -- */}
            {basicElement("totalRaised", "totalRaise", (v) => `$ --`)}
          </AppPopover>
        </Row>
        <Row
          justify={"center"}
          style={{ marginTop: "20px" }}
          className={styles["bottom-info"]}
        >
          <div className={styles["coming-soon"]}>~ Coming Soon ~</div>
        </Row>
        <Row>
          <Col span={24} offset={0}>
            <div className={styles["card-progress"]}>
              <div className={styles["progress-background"]}></div>
            </div>
          </Col>
        </Row>
      </div>
    );
  }

  // 如果项目状态不为 -1，表示项目已经开始
  return (
    <div
      className={styles["live-pool-card"] + " " + (props.className || "")}
      onClick={props.onClick}
    >
      {isDesktopOrLaptop ? timer : <></>}
      <Row
        justify="start"
        align={isDesktopOrLaptop ? "middle" : "top"}
        gutter={16}
        style={{ marginTop: "30px" }}
      >
        <Col span={isDesktopOrLaptop ? 6 : 8} style={{ textAlign: "center" }}>
          {/* icon */}
          <i
            className={judgeClassName(styles["icon-logo"], info.img)}
            style={info.img ? { backgroundImage: `url(${info.img})` } : {}}
          ></i>
        </Col>
        <Col span={isDesktopOrLaptop ? 18 : 16}>
          {/* product name / title */}
          {basicElement("name", "productName")}
          {basicElement("description", "describe")}
          {isDesktopOrLaptop ? <></> : timer}
        </Col>
      </Row>
      <Row
        justify="start"
        align="middle"
        style={{ marginTop: "20px" }}
        className={styles["total-raise-wrapper"]}
      >
        <div className={styles["total-raise-label"]}>Total raised</div>
        <AppPopover
          content={
            <>
              {seperateNumWithComma(info && (info.totalRaised / 1).toFixed(2))}
            </>
          }
        >
          <div className={styles["total-raise"]}>
            {
              // 如果项目状态大于 2，则显示实际的总筹集金额；否则显示注册结束日期
              status > 2 ? (
                <>
                  ${" "}
                  {(info?.totalRaised &&
                    formatNumber((info?.totalRaised / 1).toFixed(2))) ||
                    "0.00"}
                </>
              ) : (
                <span style={{ fontSize: ".8em" }}>
                  Starts on{" "}
                  {formatDate(info.registrationTimeEnds, "Month DD, YYYY")}
                </span>
              )
            }
          </div>
        </AppPopover>
      </Row>
      <Row
        justify={"space-between"}
        style={{ marginTop: "20px" }}
        className={styles["bottom-info"]}
      >
        {/* 1 */}
        {/* 显示关注者数量 */}
        <Col span={8} className={styles["bottom-info-item"]}>
          <div className={styles["row"]}>
            <i className="bottom-icon icon icon-project-card-1"></i>
            <label className={styles["label"]}>Followers</label>
          </div>
          <div className={[styles["row"], styles["value"]].join(" ")}>
            {basicElement("follower", "followers", (v) => v || "0")}
          </div>
        </Col>
        {/* 2 */}
        {/* 显示项目开始日期 */}
        <Col span={8} className={styles["bottom-info-item"]}>
          <div className={styles["row"]}>
            <i className="bottom-icon icon icon-project-card-2"></i>
            <label className={styles["label"]}>Start Date</label>
          </div>
          <div className={[styles["row"], styles["value"]].join(" ")}>
            {basicElement("createTime", "startDate", (v) =>
              formatDate(v, "YYYY-MM-DD")
            )}
          </div>
        </Col>
        {/* 3 */}
        {/* 显示代币的美元价格 */}
        <Col span={8} className={styles["bottom-info-item"]}>
          <div className={styles["row"]}>
            <i className="bottom-icon icon icon-project-card-3"></i>
            <label className={styles["label"]}>Token Price In Usd</label>
          </div>
          <div className={[styles["row"], styles["value"]].join(" ")}>
            <AppPopover content={tokenPriceInUsd}>
              <div className={styles["token-price"]}>
                $ {tokenPriceInUsd && tokenPriceInUsd.toFixed(8)}
              </div>
            </AppPopover>
          </div>
        </Col>
      </Row>
      <Row>
        <Col span={24} offset={0}>
          <AppPopover content={`Sale: ${progress || "00.00"}%`}>
            <div className={styles["card-progress"]}>
              <div className={styles["progress-background"]}></div>
              <div
                className={styles["progress-colored"]}
                style={{ width: progress + "%" }}
              ></div>
            </div>
          </AppPopover>
        </Col>
      </Row>
    </div>
  );
}
