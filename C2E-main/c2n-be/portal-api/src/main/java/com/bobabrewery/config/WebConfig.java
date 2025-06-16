package com.bobabrewery.config;

import org.springframework.boot.SpringBootConfiguration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * @author yanpanyi
 * WebConfig 类是一个 Spring Boot 配置类，通过实现 WebMvcConfigurer 接口，
 * 重写 addCorsMappings 方法来配置跨域资源共享（CORS）规则。该配置允许所有来源的请求，
 * 允许携带任意请求头，支持 GET、POST、PUT 和 DELETE 方法，允许携带凭证，并设置了预检请求的缓存时间。
 * 这样可以解决浏览器的同源策略限制，使得前端应用可以与后端 API 进行跨域通信。
 */
@SpringBootConfiguration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
//                .allowedOrigins("*")
                .allowedOriginPatterns("*")
                .allowedHeaders("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
