package ewshop.api.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);

    private static final String CORRELATION_ID_KEY = "correlationId";
    private static final String CORRELATION_ID_HEADER = "X-Request-Id";

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();

        // Skip very noisy / low-value endpoints
        if (path.startsWith("/actuator/health")) {
            return true;
        }
        if (path.startsWith("/swagger") || path.startsWith("/v3/api-docs")) {
            return true;
        }
        if (path.startsWith("/error")) {
            return true;
        }
        return path.startsWith("/graphics/")
                || path.endsWith(".css")
                || path.endsWith(".js")
                || path.endsWith(".ico")
                || path.endsWith(".png")
                || path.endsWith(".jpg")
                || path.endsWith(".jpeg")
                || path.endsWith(".webp");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        long start = System.currentTimeMillis();

        String method = request.getMethod();
        String uri = request.getRequestURI();
        String query = request.getQueryString();
        String fullPath = (query != null) ? uri + "?" + query : uri;

        String correlationId = request.getHeader(CORRELATION_ID_HEADER);
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString();
        }

        MDC.put(CORRELATION_ID_KEY, correlationId);
        response.setHeader(CORRELATION_ID_HEADER, correlationId);

        try {
            filterChain.doFilter(request, response);
        } finally {
            long durationMs = System.currentTimeMillis() - start;
            int status = response.getStatus();

            if (status >= 500) {
                log.error("HTTP {} {} -> {} ({} ms)", method, fullPath, status, durationMs);
            } else if (status >= 400) {
                log.warn("HTTP {} {} -> {} ({} ms)", method, fullPath, status, durationMs);
            } else {
                log.info("HTTP {} {} -> {} ({} ms)", method, fullPath, status, durationMs);
            }

            // Important: avoid MDC leaks in thread pools
            MDC.remove(CORRELATION_ID_KEY);
        }
    }
}