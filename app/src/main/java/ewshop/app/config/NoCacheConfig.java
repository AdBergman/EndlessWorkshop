package ewshop.app.config;

import jakarta.servlet.Filter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class NoCacheConfig {

    @Bean
    public Filter noCacheFilter() {
        return (servletRequest, servletResponse, chain) -> {
            HttpServletRequest request = (HttpServletRequest) servletRequest;
            HttpServletResponse response = (HttpServletResponse) servletResponse;

            if (request.getRequestURI().equals("/") || request.getRequestURI().endsWith("index.html")) {
                response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
                response.setHeader("Pragma", "no-cache");
                response.setDateHeader("Expires", 0);
            }

            chain.doFilter(request, response);
        };
    }
}
