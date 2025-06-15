import { useEffect, useMemo, useState } from "react";
import { Provider } from "react-redux";
import type { AppProps } from "next/app";

import store from "@src/redux/store";
import axios from "@src/api/axios";

import PoolCard from "@src/components/elements/PoolCard";
import LivePools from "@src/containers/LivePools/LivePools";
import FinishedPools from "@src/containers/FinishedPools/FinishedPools";
import styles from "./pools.module.scss";
import WalletButton from "@src/components/elements/WalletButton";

import { useThirdParty } from "@src/hooks/useThirdParty";
import { usePageLoading } from "@src/hooks/usePageLoading";
import { useResponsive } from "@src/hooks/useResponsive";
import { useMessage } from "@src/hooks/useMessage";

import { Row, Col } from "antd";

export default function Pools({ Component, pageProps }: AppProps) {
  const {} = useThirdParty();

  const { PageLoader, setPageLoading } = usePageLoading();

  const { isDesktopOrLaptop, isTabletOrMobile } = useResponsive();

  const { setErrorMessage } = useMessage();

  const [data, setData] = useState<Array<any>>([]);
  const livePoolsData = useMemo(() => {
    // 过滤 data 数组，只保留状态为 -1, 0, 1, 2, 3, 4 的池子
    return data.filter((v) => {
      return [-1, 0, 1, 2, 3, 4].includes(v.status);
    });
  }, [data]);

  const finishedPoolsData = useMemo(() => {
    // 过滤 data 数组，只保留状态为 5 的池子
    let d = data
      .filter((v) => {
        return [5].includes(v.status);
      })
      .sort((a, b) => {
        return a.saleEnd > b.saleEnd ? -1 : 0;
      }); // 对已结束的池子数据按 saleEnd 字段降序排序
    return d;
  }, [data]);

  // 使用 useEffect 钩子，在组件挂载时发起 HTTP 请求获取池子数据
  useEffect(() => {
    setPageLoading(true);

    axios
      .get("/boba/product/list")
      .then((res) => {
        setData(res.data);
      })
      .catch((error) => {
        setErrorMessage(
          "Network error, please check your network and refresh."
        );
        console.error(error);
      })
      .finally(() => {
        setPageLoading(false);
      });
  }, []);

  return (
    <main className={["container", styles["pools"]].join(" ")}>
      {/* 使用 PageLoader 组件包裹内容，在页面加载时显示加载提示 */}
      <PageLoader>
        <section className={styles["sec-1"]}>
          {/* 第一个 section 用于显示正在进行的池子列表 */}
          <LivePools
            className={[styles["live-pools"], "main-content"].join(" ")}
            data={livePoolsData}
          />
        </section>
        {/* 第二个 section 用于显示已结束的池子列表 */}
        <section className={styles["sec-2"]}>
          {/* 如果已结束的池子数据不为空，则显示 FinishedPools 组件 */}
          {finishedPoolsData && finishedPoolsData.length > 0 ? (
            <FinishedPools className="main-content" data={finishedPoolsData} />
          ) : (
            <></>
          )}
        </section>
      </PageLoader>
    </main>
  );
}

/**
http://localhost:8080/boba/product/list
{
  "code": 200,
  "data": [
    {
      "id": 3,
      "name": "pcontract_3",
      "description": "pcontract_3 desc",
      "img": "/img/pc_3.jpg",
      "status": 0,
      "amount": "10000000000000000000000",
      "saleContractAddress": "0x8acd85898458400f7db866d53fcff6f0d49741ff",
      "tokenAddress": "0x959922be3caee4b8cd9a407cc3ac1c251c2007b1",
      "paymentToken": "200",
      "follower": 0,
      "tge": 1715244469000,
      "projectWebsite": "http://404.com",
      "aboutHtml": "http://404.com/about.html",
      "registrationTimeStarts": 1749948362000,
      "registrationTimeEnds": 1749948482000,
      "saleStart": 1749948492000,
      "saleEnd": 1749948552000,
      "maxParticipation": "10",
      "tokenPriceInPT": "100000000000",
      "totalTokensSold": "10000000000000000000000000",
      "amountOfTokensToSell": "30",
      "totalRaised": "111",
      "symbol": "MCK",
      "decimals": 18,
      "unlockTime": 1749948782000,
      "medias": null,
      "numberOfRegistrants": 1,
      "vesting": null,
      "tricker": null,
      "tokenName": "DemoToken1",
      "roi": "1",
      "vestingPortionsUnlockTime": null,
      "vestingPercentPerPortion": null,
      "createTime": 1714019107000,
      "updateTime": 1749921951000,
      "type": 0,
      "cardLink": "http://card_link2.com",
      "tweetId": "tweet_id_1",
      "chainId": 11155111,
      "paymentTokenDecimals": 18,
      "currentPrice": 0
    }
  ],
  "message": "success"
}
 */
