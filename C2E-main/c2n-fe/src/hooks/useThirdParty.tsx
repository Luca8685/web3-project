import axios from "@src/api/axios";
import { useAppSelector, useAppDispatch } from "@src/redux/hooks";
import {
  setBobaToUsd,
  setEthToUsd,
  setBreToUsd,
} from "@src/redux/modules/third-party";

export const useThirdParty = () => {
  const dispatch = useAppDispatch();
  const bobaToUsd = useAppSelector((state) => state.thirdParty.bobaToUsd);
  const ethToUsd = useAppSelector((state) => state.thirdParty.ethToUsd);
  const breToUsd: number = useAppSelector((state) => state.thirdParty.breToUsd);

  /**
   * 异步函数，用于获取 Boba 到美元的兑换率
   */
  async function getBobaToUsd() {
    const ret: any = await axios.get(
      "https://price-api.crypto.com/price/v1/exchange/boba-network"
    );
    dispatch(setBobaToUsd(ret.fiat.usd));
  }

  /**
   * 函数，用于获取以太坊到美元的兑换率
   */
  function getEthToUsd() {
    return axios
      .get(
        "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=BTC,USD,EUR"
      )
      .then((response: any) => {
        dispatch(setEthToUsd(response.USD));
      });
  }

  /**
   * 函数，用于获取 BRE 到美元的兑换率
   */
  function getBreToUsd() {
    return axios.get("/boba/apr/bre_price").then((response: any) => {
      dispatch(setBreToUsd(Number(response.data)));
    });
  }

  return {
    bobaToUsd, // Boba 到美元的兑换率
    ethToUsd, // 以太坊到美元的兑换率
    breToUsd, // BRE 到美元的兑换率
    stakedTokenToUsd: breToUsd, // 质押代币到美元的兑换率，这里使用 BRE 到美元的兑换率
    earnedTokenToUsd: breToUsd, // 赚取代币到美元的兑换率，这里使用 BRE 到美元的兑换率

    getBobaToUsd, // 用于获取 Boba 到美元兑换率的函数
    getEthToUsd, // 用于获取以太坊到美元兑换率的函数
    getBreToUsd, // 用于获取 BRE 到美元兑换率的函数
  };
};
