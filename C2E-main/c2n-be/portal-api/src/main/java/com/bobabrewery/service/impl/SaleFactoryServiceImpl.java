package com.bobabrewery.service.impl;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;

import com.bobabrewery.service.IProjectService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.web3j.abi.EventEncoder;
import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.request.EthFilter;
import org.web3j.protocol.http.HttpService;

import com.bobabrewery.repo.common.model.ProductPO;
import com.bobabrewery.service.SaleContractService;
import com.bobabrewery.service.SaleFactoryService;
import com.bobabrewery.util.CredentialsUtils;

import lombok.extern.slf4j.Slf4j;

/**
 * 销售工厂服务
 */
@Component
@Slf4j
public class SaleFactoryServiceImpl implements SaleFactoryService {
    @Resource
    private CredentialsUtils credentialsUtils;

    @Resource
    private SaleContractService saleContractService;
    @Value("${contract.saleFactory.address}")
    private String saleFactoryAddress;


    private String SALE_DEPLOY_TOPIC = "SaleDeployed(address)";


    @Resource
    private IProjectService productContractService;

    /**
     * 启动销售工厂监听
     */
    @PostConstruct
    // 使用 @PostConstruct 注解，确保该方法在 Bean 初始化完成后执行
    public void init() {
        log.info(String.format("初始化服务开启销售工厂监听,监听销售创建,address=%s", saleFactoryAddress));
        // 调用 startSaleFactoryListen 方法启动监听
        startSaleFactoryListen();
    }

    @Override
    public void startSaleFactoryListen() {
        // 创建 Web3j 实例，通过 HTTP 协议连接到以太坊网络，使用 credentialsUtils 中的网络 URL
        Web3j web3 = Web3j.build(new HttpService(credentialsUtils.networkUrl));
        // 创建一个以太坊日志过滤器，过滤从最早块到最新块的指定销售工厂合约地址的日志
        EthFilter filter = new EthFilter(DefaultBlockParameterName.EARLIEST, DefaultBlockParameterName.LATEST, saleFactoryAddress);
        // 为过滤器添加单一主题，即销售部署事件的签名，用于过滤特定的事件
        filter.addSingleTopic(EventEncoder.buildEventSignature(SALE_DEPLOY_TOPIC));
        // 订阅过滤器的日志流，当有符合条件的日志时执行回调函数
        web3.ethLogFlowable(filter).subscribe(eventLog -> {
            // 从事件日志中获取数据
            String _data = eventLog.getData();
            // 使用 FunctionReturnDecoder 解码数据，获取销售合约地址
            String saleAddress = FunctionReturnDecoder.decodeAddress(_data);
            // 注释掉的代码，原本计划使用线程池提交任务，处理销售参数变更事件
//            executorService.submit(new SaleParamChangeRunnable(saleAddress));
            // 调用 saleContractService 的 listenSaleChange 方法，监听销售合约的变更事件
            saleContractService.listenSaleChange(saleAddress, event -> {
                try {
                    // 调用 saleContractService 的 querySaleInfo 方法，查询销售合约的信息，并封装到 ProductPO 对象中
                    ProductPO productPO = saleContractService.querySaleInfo(saleAddress);
                    // 调用 productContractService 的 updateByProduct 方法，根据 ProductPO 对象更新项目信息
                    productContractService.updateByProduct(productPO);
                    // 记录日志，表明监听到销售变更消息，并输出组装的 ProductPO 对象
                    log.info(String.format("监听到销售变更消息,组装productPo=%s", productPO));
                } catch (Exception e) {
                    e.printStackTrace();
                }
            });
        });

    }

//    class SaleParamChangeRunnable implements Runnable {
//
//        /**
//         * 销售地址
//         */
//        private String saleAddress;
//
//        public SaleParamChangeRunnable(String _saleAddress) {
//            saleAddress = _saleAddress;
//        }
//
//        @Override
//        public void run() {
//            log.info(String.format("提交销售协议变更事件的监听,address=%s", saleAddress));
//            saleContractService.listenSaleChange(saleAddress, event -> {
//                try {
//                    ProductPO productPO = saleContractService.querySaleInfo(saleAddress);
//                    productContractService.updateByProduct(productPO);
//                    log.info(String.format("监听到销售变更消息,组装productPo=%s", productPO));
//                } catch (Exception e) {
//                    e.printStackTrace();
//                }
//            });
//        }
//    }
}
