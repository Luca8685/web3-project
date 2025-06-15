import LivePoolCard from "../../components/elements/LivePoolCard";
import styles from "./LivePools.module.scss";
import Router from "next/router";
import { Row, Col } from "antd";

import { ProjectData } from "@src/types/ProjectData";

import { IconPoolsEmpty } from "@src/components/icons";

import { useResponsive } from "@src/hooks/useResponsive";

type LivePoolsProds = {
  className?: string;
  children?: any;
  data?: Array<ProjectData>;
};

export default function LivePools(props: LivePoolsProds) {
  const poolData = props.data || [];

  const { isDesktopOrLaptop } = useResponsive();

  const onCardClick = (info) => {
    if (info?.type == 0) {
      Router.push({ pathname: "/project", query: { id: info.id } });
      return;
    }
  };

  return (
    <div className={styles["live-pools"] + " " + (props.className || "")}>
      {props.children}
      <h2 className={styles.title}>Live Pools</h2>
      {poolData && poolData.length > 0 ? (
        <>
          <div className={styles["sub-title"]}></div>
          <Row
            className={styles["live-pool-list"]}
            gutter={isDesktopOrLaptop ? 16 : [0, 16]}
          >
            {poolData.map((info, index) => {
              return (
                <Col
                  span={isDesktopOrLaptop ? 12 : 24}
                  style={{ width: "100%" }}
                  key={index}
                >
                  <LivePoolCard
                    onClick={() => onCardClick(info)}
                    info={info}
                    className={styles["card"]}
                  />
                </Col>
              );
            })}
          </Row>
        </>
      ) : (
        <>
          <Row justify="center">
            <IconPoolsEmpty style={{ marginTop: "30px" }} />
          </Row>
          <Row justify="center">
            <div className={styles["empty-text"]}>
              There are no more projects at the moment
            </div>
          </Row>
        </>
      )}
    </div>
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
