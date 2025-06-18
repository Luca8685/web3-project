// 注释掉这行代码，该行代码原本用于加载 .env 文件中的环境变量，不过当前处于注释状态，可能在其他地方已经加载过环境变量
//require('dotenv').config();

// 从环境变量中获取 Pinata 的 API 密钥，该密钥用于身份验证，以便后续与 Pinata 服务进行交互
const key = process.env.REACT_APP_PINATA_KEY;
// 从环境变量中获取 Pinata 的 API 密钥对应的 Secret，这是额外的安全验证信息，与 API 密钥一同使用来确保请求的安全性
const secret = process.env.REACT_APP_PINATA_SECRET;

// 引入 axios 库，它是一个基于 Promise 的 HTTP 客户端，用于浏览器和 Node.js 环境，这里用于向 Pinata 的 API 发送 HTTP 请求
const axios = require('axios');
// 引入 FormData 库，它用于创建表单数据，在上传文件时会使用到，方便将文件和相关元数据封装成符合 HTTP 请求格式的数据
const FormData = require('form-data');

// 定义一个异步函数 uploadJSONToIPFS，用于将 JSON 数据上传到 IPFS（星际文件系统），并通过 Pinata 服务进行固定（pin）操作
// 函数接收一个 JSON 数据对象作为参数
export const uploadJSONToIPFS = async(JSONBody) => {
    // 定义 Pinata 提供的用于固定 JSON 数据到 IPFS 的 API 接口 URL
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    // 注释提示这里是使用 axios 发起 POST 请求到 Pinata 服务
    //making axios POST request to Pinata ⬇️

    // 使用 axios 发送 POST 请求，将 JSON 数据发送到指定的 Pinata API 接口
    return axios 
        .post(url, JSONBody, {
            // 设置请求头，包含 Pinata 的 API 密钥和 Secret，用于身份验证
            headers: {
                pinata_api_key: key,
                pinata_secret_api_key: secret,
            }
        })
        // 请求成功后的回调函数
        .then(function (response) {
            // 返回一个对象，包含上传成功的标志和通过 Pinata 网关访问 IPFS 上该 JSON 数据的 URL
           return {
               success: true,
               pinataURL: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash
           };
        })
        // 请求失败后的回调函数
        .catch(function (error) {
            // 打印错误信息到控制台
            console.log(error)
            // 返回一个对象，包含上传失败的标志和错误信息
            return {
                success: false,
                message: error.message,
            }
    });
};

// 定义一个异步函数 uploadFileToIPFS，用于将文件上传到 IPFS 并通过 Pinata 服务进行固定操作
// 函数接收一个文件对象作为参数
export const uploadFileToIPFS = async(file) => {
    // 定义 Pinata 提供的用于固定文件到 IPFS 的 API 接口 URL
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    // 注释提示这里是使用 axios 发起 POST 请求到 Pinata 服务
    //making axios POST request to Pinata ⬇️

    // 创建一个 FormData 实例，用于封装要上传的文件和相关元数据
    let data = new FormData();
    // 向 FormData 实例中添加要上传的文件，字段名为 'file'
    data.append('file', file);

    // 定义文件的元数据，这里包含一个名称和一些键值对信息，将其转换为 JSON 字符串
    const metadata = JSON.stringify({
        name: 'testname',
        keyvalues: {
            exampleKey: 'exampleValue'
        }
    });
    // 向 FormData 实例中添加文件的元数据，字段名为 'pinataMetadata'
    data.append('pinataMetadata', metadata);

    // 定义 Pinata 的可选配置选项，这里指定了 CID 版本和自定义的固定策略，将其转换为 JSON 字符串
    //pinataOptions are optional
    const pinataOptions = JSON.stringify({
        cidVersion: 0,
        customPinPolicy: {
            regions: [
                {
                    id: 'FRA1',
                    desiredReplicationCount: 1
                },
                {
                    id: 'NYC1',
                    desiredReplicationCount: 2
                }
            ]
        }
    });
    // 向 FormData 实例中添加 Pinata 的可选配置选项，字段名为 'pinataOptions'
    data.append('pinataOptions', pinataOptions);

    // 使用 axios 发送 POST 请求，将封装好的文件和元数据发送到指定的 Pinata API 接口
    return axios 
        .post(url, data, {
            // 设置请求体的最大长度为无限，以处理可能较大的文件上传
            maxBodyLength: 'Infinity',
            // 设置请求头，包含 Content-Type 以表明请求体是多部分表单数据，同时包含 Pinata 的 API 密钥和 Secret 用于身份验证
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                pinata_api_key: key,
                pinata_secret_api_key: secret,
            }
        })
        // 请求成功后的回调函数
        .then(function (response) {
            // 打印文件上传成功后的 IPFS 哈希值到控制台
            console.log("image uploaded", response.data.IpfsHash)
            // 返回一个对象，包含上传成功的标志和通过 Pinata 网关访问 IPFS 上该文件的 URL
            return {
               success: true,
               pinataURL: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash
           };
        })
        // 请求失败后的回调函数
        .catch(function (error) {
            // 打印错误信息到控制台
            console.log(error)
            // 返回一个对象，包含上传失败的标志和错误信息
            return {
                success: false,
                message: error.message,
            }
    });
};