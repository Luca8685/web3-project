// 定义一个名为 GetIpfsUrlFromPinata 的函数，并将其导出，以便在其他模块中使用
// 该函数的作用是将 Pinata 提供的 URL 转换为 IPFS 的标准访问 URL
export const GetIpfsUrlFromPinata = (pinataUrl) => {
    // 使用 split 方法将传入的 Pinata URL 按斜杠 "/" 进行分割，得到一个字符串数组
    // 例如，若 pinataUrl 为 "https://gateway.pinata.cloud/ipfs/QmSomeHash"，分割后得到 ["https:", "", "gateway.pinata.cloud", "ipfs", "QmSomeHash"]
    var IPFSUrl = pinataUrl.split("/");

    // 获取分割后的数组的长度，即元素的个数
    // 对于上述例子，lastIndex 的值为 5
    const lastIndex = IPFSUrl.length;

    // 构建一个新的 IPFS 标准访问 URL
    // 通过访问分割数组的最后一个元素（即 IPFS 的哈希值），并将其拼接到 "https://ipfs.io/ipfs/" 后面
    // 对于上述例子，最终得到的 IPFSUrl 为 "https://ipfs.io/ipfs/QmSomeHash"
    IPFSUrl = "https://ipfs.io/ipfs/" + IPFSUrl[lastIndex - 1];

    // 返回转换后的 IPFS 标准访问 URL
    return IPFSUrl;
};