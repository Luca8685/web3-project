import { message } from "antd";
import { useEffect } from "react";

export function useMessage() {
  useEffect(() => {
    //window.message = message：将 antd 的 message 组件挂载到 window 对象上，
    // 这样在全局作用域中都可以访问 message 组件。
    if (typeof window !== "undefined") {
      window.message = message;
    }
  }, []);

  //setSuccessMessage：定义了一个函数，用于显示成功消息。
  // message.success：调用 antd 的 message 组件的 success 方法，显示一个成功类型的消息提示框。
  // { content, duration: 1 }：传递一个对象作为参数，content 是消息的内容，duration 是消息提示框显示的时长，单位为秒，这里设置为 1 秒。
  const setSuccessMessage = (content) => {
    message.success({
      content,
      duration: 1,
    });
  };

  return {
    setSuccessMessage,
    setWarningMessage: message.warning,
    setErrorMessage: message.error,
  };
}
