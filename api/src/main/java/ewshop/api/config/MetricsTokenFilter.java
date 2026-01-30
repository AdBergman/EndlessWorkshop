package ewshop.api.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class MetricsTokenFilter extends OncePerRequestFilter {

    private static final String PROMETHEUS_PATH = "/actuator/prometheus";
    private static final String HEADER_NAME = "X-Metrics-Token";

    private final String metricsToken;

    public MetricsTokenFilter(String metricsToken) {
        this.metricsToken = metricsToken == null ? "" : metricsToken.trim();
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        if (path == null) return true;

        // Be slightly forgiving: allow a trailing slash
        if (path.endsWith("/")) {
            path = path.substring(0, path.length() - 1);
        }

        return !PROMETHEUS_PATH.equals(path);
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // Fail closed if token isn't configured
        if (metricsToken.isEmpty()) {
            response.sendError(HttpStatus.FORBIDDEN.value(), "Metrics endpoint is disabled");
            return;
        }

        String provided = request.getHeader(HEADER_NAME);
        if (provided == null || provided.isBlank()) {
            response.sendError(HttpStatus.UNAUTHORIZED.value(), "Missing " + HEADER_NAME);
            return;
        }

        if (!metricsToken.equals(provided.trim())) {
            response.sendError(HttpStatus.FORBIDDEN.value(), "Invalid " + HEADER_NAME);
            return;
        }

        filterChain.doFilter(request, response);
    }
}