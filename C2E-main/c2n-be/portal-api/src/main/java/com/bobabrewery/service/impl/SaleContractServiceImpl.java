package com.bobabrewery.service.impl;

import java.util.Date;

import javax.annotation.Resource;

import org.springframework.stereotype.Component;
import org.web3j.abi.EventEncoder;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.request.EthFilter;
import org.web3j.protocol.http.HttpService;
import org.web3j.tuples.generated.Tuple14;
import org.web3j.tuples.generated.Tuple3;
import org.web3j.tx.gas.DefaultGasProvider;

import com.bobabrewery.repo.common.model.ProductPO;
import com.bobabrewery.service.SaleContractService;
import com.bobabrewery.util.C2NSale;
import com.bobabrewery.util.CredentialsUtils;

import lombok.extern.slf4j.Slf4j;

/**
 * 销售合约服务，
 */
@Component
@Slf4j
public class SaleContractServiceImpl implements SaleContractService {

    @Resource
    private CredentialsUtils credentialsUtils;

    /**
     * 事件topic-销售合约创建
     */
    private static String SALE_EVENT_CREATED = "SaleCreated(address,uint256,uint256,uint256)";

    /**
     * 事件topic-销售合约修改创建时间
     */
    private static String SALE_EVENT_STARTTIME = "StartTimeSet(uint256)";

    /**
     * 修改注册时间
     */
    private static String SALE_EVENT_REGISTRATIONTIME = "RegistrationTimeSet(uint256,uint256)";

    /**
     * @see SaleContractService#querySaleInfo(String)
     * 实现 SaleContractService 接口中的 querySaleInfo 方法，用于查询销售合约的信息
     * querySaleInfo 方法：用于查询指定销售合约地址的销售信息，包括销售代币、销售所有者、价格、时间等，
     * 并将这些信息封装到 ProductPO 对象中返回。

     */
    @Override
    public ProductPO querySaleInfo(String saleAddress) throws Exception {
        // 创建 Web3j 实例，连接到以太坊网络，使用 credentialsUtils 中的网络 URL
        Web3j web3 = Web3j.build(new HttpService(credentialsUtils.networkUrl)); // defaults to http://localhost:8545/

        // 创建默认的 gas 提供者，用于设置交易的 gas 价格和限制
        DefaultGasProvider contractGasProvider = new DefaultGasProvider();
        // 根据 credentialsUtils 中的私钥创建 Credentials 实例，用于签署交易
        Credentials credentials = Credentials.create(credentialsUtils.privateKey);
        // 加载指定地址的 C2NSale 合约实例
        C2NSale contractInstance = C2NSale.load(saleAddress, web3, credentials, contractGasProvider);
        // 调用合约的 sale 方法，获取销售信息，返回一个 Tuple14 对象
        Tuple14 saleInfo = contractInstance.sale().send();
        // 调用合约的 registration 方法，获取注册信息，返回一个 Tuple3 对象
        Tuple3 registrationInfo = contractInstance.registration().send();
        // 从contract.sale.token获取 // 从 saleInfo 中获取销售代币地址
        String _saleToken = saleInfo.component1().toString();
        // event.saleOwner // 从 saleInfo 中获取销售所有者地址
        String _saleOwner = saleInfo.component6().toString();
        // event.tokenPriceInETH // 从 saleInfo 中获取代币的 ETH 价格
        String tokenPriceInEth = saleInfo.component7().toString();
        // event.amountOfTokenToSell  // 从 saleInfo 中获取要销售的代币总数
        String totalTokens = saleInfo.component8().toString();
        // event.saleEnd // 从 saleInfo 中获取销售结束时间
        String saleEndTime = saleInfo.component12().toString();

        // contract.sale.tokensUnlockTime // 从 saleInfo 中获取代币解锁时间
        String tokensUnlockTime = saleInfo.component13().toString();
        // contract.registration.registrationTimeStarts  // 从 registrationInfo 中获取注册开始时间
        String registrationStart = registrationInfo.component1().toString();
        // contract.registration.registrationTimeEnds // 从 registrationInfo 中获取注册结束时间
        String registrationEnd = registrationInfo.component2().toString();
        // contract.sale.saleStart // 从 saleInfo 中获取销售开始时间
        String saleStartTime = saleInfo.component11().toString();

        ProductPO productPO = new ProductPO();
        productPO.setId(3);
        productPO.setSaleAddress(contractInstance.getContractAddress());
        productPO.setSaleToken(_saleToken);
        productPO.setSaleOwner(_saleOwner);
        productPO.setRegistrationEnd(new Date(Long.parseLong(registrationEnd.concat("000"))));
        productPO.setRegistrationStart(new Date(Long.parseLong(registrationStart.concat("000"))));
        productPO.setSaleEndTime(new Date(Long.parseLong(saleEndTime.concat("000"))));
        productPO.setTotalTokens(totalTokens);
        productPO.setTokensUnlockTime(new Date(Long.parseLong(tokensUnlockTime.concat("000"))));
        productPO.setSaleStartTime(new Date(Long.parseLong(saleStartTime.concat("000"))));
        productPO.setTokenPriceInPT(tokenPriceInEth);
        return productPO;
    }

    /**
     * @see SaleContractService#listenSaleChange(String, SaleChangeExecutor)
     * 实现 SaleContractService 接口中的 listenSaleChange 方法，用于监听销售合约的变更事件
     * listenSaleChange 方法：用于监听指定销售合约地址的特定事件（销售合约创建、修改创建时间、修改注册时间），
     * 当监听到这些事件时，记录日志并调用传入的执行器处理事件日志。
     */
    @Override
    public void listenSaleChange(String saleAddress, SaleChangeExecutor executor) {
        // 创建 Web3j 实例，连接到以太坊网络，使用 credentialsUtils 中的网络 URL
        Web3j web3 = Web3j.build(new HttpService(credentialsUtils.networkUrl)); // defaults to http://localhost:8545/

        // 创建一个以太坊日志过滤器，过滤从最早块到最新块的指定销售合约地址的日志
        EthFilter filter = new EthFilter(DefaultBlockParameterName.EARLIEST,
                DefaultBlockParameterName.LATEST, saleAddress);
        // 为过滤器添加可选的事件签名，用于过滤特定的事件
        filter.addOptionalTopics(EventEncoder.buildEventSignature(SALE_EVENT_CREATED), EventEncoder.buildEventSignature(SALE_EVENT_STARTTIME),
            EventEncoder.buildEventSignature(SALE_EVENT_REGISTRATIONTIME));
        // 订阅过滤器的日志流，当有符合条件的日志时执行回调函数
        web3.ethLogFlowable(filter).subscribe(eventLog -> {
            // 记录监听到的销售变更消息，包含销售合约地址和事件的第一个 topic
            log.info(String.format("监听到销售变更消息,address=%s,topic0=%s", saleAddress, eventLog.getTopics().get(0)));
            executor.execute(eventLog);

        });



    }


}
