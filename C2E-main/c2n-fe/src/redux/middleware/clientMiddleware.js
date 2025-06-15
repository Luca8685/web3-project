export default function clientMiddleware(client) {
  // 第一层函数接收一个 client 参数，这个 client 通常是一个用于发起请求的客户端实例，
  // 比如 Axios 实例，它会在后续的异步操作中被使用
  return ({ dispatch, getState }) => {
    // 第二层函数接收一个包含 dispatch 和 getState 的对象
    // dispatch 用于派发 action 到 Redux store
    // getState 用于获取当前 Redux store 的状态
    return (next) => (action) => {
      // 第三层函数接收 next 和 action 两个参数
      // next 是一个函数，用于将 action 传递给下一个中间件或者最终的 reducer
      // action 是当前被派发的 action

      if (typeof action === "function") {
        // 检查 action 是否为函数
        // 如果 action 是函数，说明它是一个 thunk action（使用了 redux-thunk 中间件）
        // 调用这个函数并传入 dispatch 和 getState 作为参数
        // 让这个函数可以在内部进行异步操作并自行派发新的 action
        return action(dispatch, getState);
      }

      // 使用对象解构赋值从 action 中提取 promise、types 和剩余的属性
      // promise 是一个函数，用于发起异步请求，返回一个 Promise 对象
      // types 是一个包含三个元素的数组，分别代表请求开始、请求成功和请求失败时的 action 类型
      // rest 是一个对象，包含了 action 中除了 promise 和 types 之外的其他属性
      const { promise, types, ...rest } = action; // eslint-disable-line no-redeclare

      // 检查 action 中是否包含 promise 属性
      if (!promise) {
        // 如果不包含 promise 属性，说明这个 action 不需要进行异步处理
        // 直接调用 next(action) 将 action 传递给下一个中间件或者最终的 reducer
        return next(action);
      }

      // 从 types 数组中提取请求开始、请求成功和请求失败时的 action 类型
      const [REQUEST, SUCCESS, FAILURE] = types;

      // 派发一个请求开始的 action，通知应用程序异步请求已经开始
      // 使用 ...rest 展开运算符将 rest 对象中的属性合并到新的 action 对象中
      next({ ...rest, type: REQUEST });

      // 调用 promise 函数并传入 client 作为参数，发起异步请求
      // 返回一个 Promise 对象
      const actionPromise = promise(client);
      // 使用 then 方法处理 Promise 的结果
      // 当 Promise 成功时，派发一个请求成功的 action
      // 将请求结果 result 合并到新的 action 对象中
      // 当 Promise 失败时，派发一个请求失败的 action
      // 将错误信息 error 合并到新的 action 对象中
      // 使用 catch 方法捕获 Promise 链中可能出现的错误，打印错误信息到控制台，派发一个请求失败的 action
      actionPromise
        .then(
          (result) => next({ ...rest, result, type: SUCCESS }),
          (error) => next({ ...rest, error, type: FAILURE })
        )
        .catch((error) => {
          console.error("MIDDLEWARE ERROR:", error);
          next({ ...rest, error, type: FAILURE });
        });
      // 返回 actionPromise，以便调用者可以继续处理这个异步操作的结果
      return actionPromise;
    };
  };
}
