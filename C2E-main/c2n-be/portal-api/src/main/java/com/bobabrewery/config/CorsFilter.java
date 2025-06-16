package com.bobabrewery.config;

import org.springframework.stereotype.Component;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * @author orange
 * CorsFilter 类是一个用于处理跨域资源共享（CORS）问题的过滤器。
 * 它通过设置 HTTP 响应头，允许来自不同域名的请求访问服务器资源，
 * 并支持携带凭证和指定的 HTTP 请求方法。这样可以解决浏览器的同源策略限制，
 * 使得前端应用可以与后端 API 进行跨域通信。
 */
@Component
public class CorsFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {
        HttpServletResponse response = (HttpServletResponse) res;

        HttpServletRequest reqs = (HttpServletRequest) req;

        String originHeader = reqs.getHeader("Origin");
        String requestHeader = reqs.getHeader("Access-Control-Request-Headers");

        if (originHeader != null) {
            response.setHeader("Access-Control-Allow-Origin", originHeader);
        }

        if (requestHeader != null) {
            response.setHeader("Access-Control-Allow-Headers", requestHeader);
        }

        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Allow-Methods", "POST, GET, DELETE, PUT");
        chain.doFilter(req, res);
    }

    @Override
    public void init(FilterConfig filterConfig) {
    }

    @Override
    public void destroy() {
    }
}