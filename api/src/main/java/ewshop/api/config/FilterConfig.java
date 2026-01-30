package ewshop.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FilterConfig {

    @Bean
    public AdminTokenFilter adminTokenFilter(@Value("${admin.token:}") String adminToken) {
        return new AdminTokenFilter(adminToken);
    }

    @Bean
    public MetricsTokenFilter metricsTokenFilter(@Value("${metrics.token:}") String metricsToken) {
        return new MetricsTokenFilter(metricsToken);
    }

    @Bean
    public RequestLoggingFilter requestLoggingFilter() {
        return new RequestLoggingFilter();
    }

    @Bean
    public FilterRegistrationBean<AdminTokenFilter> adminTokenFilterRegistration(AdminTokenFilter filter) {
        FilterRegistrationBean<AdminTokenFilter> reg = new FilterRegistrationBean<>();
        reg.setFilter(filter);
        reg.setOrder(0); // first
        return reg;
    }

    @Bean
    public FilterRegistrationBean<MetricsTokenFilter> metricsTokenFilterRegistration(MetricsTokenFilter filter) {
        FilterRegistrationBean<MetricsTokenFilter> reg = new FilterRegistrationBean<>();
        reg.setFilter(filter);
        reg.setOrder(5); // after admin token, before logging
        return reg;
    }

    @Bean
    public FilterRegistrationBean<RequestLoggingFilter> requestLoggingFilterRegistration(RequestLoggingFilter filter) {
        FilterRegistrationBean<RequestLoggingFilter> reg = new FilterRegistrationBean<>();
        reg.setFilter(filter);
        reg.setOrder(10); // after auth-ish filters
        return reg;
    }
}