package com.bobabrewery.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.web3j.crypto.Credentials;
import org.web3j.crypto.Hash;
import org.web3j.crypto.Sign;
import org.web3j.utils.Numeric;

import javax.annotation.PostConstruct;

/**
 * @author PailieXiangLong
 */
@Component
public class CredentialsUtils {
    /**
     * 私钥
     */
    @Value("${owner.private.key}")
    public String privateKey;

    @Value("${network.url}")
    public String networkUrl;



    private Credentials credentials;

    @PostConstruct
    public void init() {
        credentials = Credentials.create(privateKey);
    }

    /**
     * 签名方法
     *
     * @param hexString 待签名的十六进制字符串
     * @return 签名后的十六进制字符串
     */
    public String getSign(String hexString) {
        // 第一步：将输入的十六进制字符串转换为字节数组，然后对该字节数组进行SHA-3哈希计算
        // Numeric.hexStringToByteArray(hexString)：将十六进制字符串转换为字节数组
        // Hash.sha3(...)：对字节数组进行SHA-3哈希计算，得到消息的哈希值
        byte[] messageHash = Hash.sha3(Numeric.hexStringToByteArray(hexString));
        // 第二步：对消息的哈希值进行处理，得到符合以太坊标准的消息哈希值
        // Sign.getEthereumMessageHash(...)：将普通的消息哈希值转换为以太坊消息哈希值
        // 以太坊消息哈希值是在原始消息哈希值的基础上进行了一些额外处理，以确保签名的安全性和一致性
        byte[] ethereumMessageHash = Sign.getEthereumMessageHash(messageHash);
        // 第三步：使用椭圆曲线密钥对（EC Key Pair）对以太坊消息哈希值进行签名
        // Sign.signMessage(...)：使用指定的椭圆曲线密钥对和以太坊消息哈希值进行签名
        // this.credentials.getEcKeyPair()：从凭证对象中获取椭圆曲线密钥对
        // false：表示不使用恢复ID（recovery ID），在某些场景下可能需要使用恢复ID来恢复签名者的地址
        Sign.SignatureData signatureData = Sign.signMessage(ethereumMessageHash, this.credentials.getEcKeyPair(), false);
        // 第四步：将签名数据（SignatureData）转换为十六进制字符串并拼接起来
        // Numeric.toHexStringNoPrefix(...)：将字节数组转换为十六进制字符串，并且不包含 "0x" 前缀
        // signatureData.getR()、signatureData.getS()、signatureData.getV()：分别获取签名数据中的R、S和V值
        // R和S是椭圆曲线签名的两个部分，V是恢复ID
        // .concat(...)：将R、S和V的十六进制字符串拼接起来，形成最终的签名结果
        return Numeric.toHexStringNoPrefix(signatureData.getR()).concat(Numeric.toHexStringNoPrefix(signatureData.getS())).concat(Numeric.toHexStringNoPrefix(signatureData.getV()));
    }

    public Credentials getCredentials() {
        return credentials;
    }
}
