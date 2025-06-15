import { useAppSelector, useAppDispatch } from "@src/redux/hooks";
import { setMediaQuery } from "@src/redux/modules/media-query";
import { useEffect } from "react";

/*
useResponsiveInit 是一个自定义 Hook，用于初始化响应式状态并监听窗口大小变化。
dispatch：通过 useAppDispatch 获取 Redux 的 dispatch 函数，用于分发 action。
_setMediaQuery 函数：根据窗口的 innerWidth 判断当前设备类型，并通过 dispatch 分发 setMediaQuery action 来更新 Redux 状态。
如果窗口宽度大于 769 像素，认为是桌面或笔记本设备。
如果窗口宽度小于等于 768 像素，认为是平板或手机设备。
useEffect：在组件挂载时执行一次。
调用 _setMediaQuery 函数来初始化设备类型状态。
监听 resize 事件，当窗口大小改变时，再次调用 _setMediaQuery 函数更新状态。
返回一个清理函数，在组件卸载时移除 resize 事件监听器，防止内存泄漏。
*/
export const useResponsiveInit = () => {
  const dispatch = useAppDispatch();

  function _setMediaQuery() {
    if (window.innerWidth > 769) {
      dispatch(
        setMediaQuery({
          isDesktopOrLaptop: true,
          isBigScreen: false,
          isTabletOrMobile: false,
        })
      );
    }
    if (window.innerWidth <= 768) {
      dispatch(
        setMediaQuery({
          isDesktopOrLaptop: false,
          isBigScreen: false,
          isTabletOrMobile: true,
        })
      );
    }
  }
  useEffect(() => {
    _setMediaQuery();
    window.addEventListener("resize", _setMediaQuery);
  }, []);
};

/*
useResponsive 是另一个自定义 Hook，用于从 Redux 状态中选择设备类型信息。
useAppSelector：从 Redux 状态中选择 mediaQuery 部分的 isDesktopOrLaptop、isBigScreen 和 isTabletOrMobile 状态。
返回一个对象，包含这些设备类型的布尔值，供组件使用。
*/
export const useResponsive = () => {
  const isDesktopOrLaptop = useAppSelector(
    (state) => state && state.mediaQuery.isDesktopOrLaptop
  );
  const isBigScreen = useAppSelector(
    (state) => state && state.mediaQuery.isBigScreen
  );
  const isTabletOrMobile = useAppSelector(
    (state) => state && state.mediaQuery.isTabletOrMobile
  );

  return {
    isDesktopOrLaptop,
    isBigScreen,
    isTabletOrMobile,
  };
};
