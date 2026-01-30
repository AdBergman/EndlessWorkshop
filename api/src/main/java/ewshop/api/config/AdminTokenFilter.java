package ewshop.api.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class AdminTokenFilter extends OncePerRequestFilter {

    private static final String ADMIN_PATH_PREFIX = "/api/admin/";
    private static final String HEADER_NAME = "X-Admin-Token";

    private final String adminToken;

    public AdminTokenFilter(String adminToken) {
        this.adminToken = adminToken == null ? "" : adminToken.trim();
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path == null || !path.startsWith(ADMIN_PATH_PREFIX);
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // Fail closed if token isn't configured
        if (adminToken.isEmpty()) {
            response.sendError(HttpStatus.FORBIDDEN.value(), "Admin endpoints are disabled");
            return;
        }

        String provided = request.getHeader(HEADER_NAME);
        if (provided == null || provided.isBlank()) {
            response.sendError(HttpStatus.UNAUTHORIZED.value(), "Missing " + HEADER_NAME);
            return;
        }

        if (!adminToken.equals(provided.trim())) {
            response.sendError(HttpStatus.FORBIDDEN.value(), "Invalid " + HEADER_NAME);
            return;
        }

        filterChain.doFilter(request, response);
    }
}