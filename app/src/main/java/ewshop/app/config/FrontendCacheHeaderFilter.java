package ewshop.app.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

@Component
public class FrontendCacheHeaderFilter extends OncePerRequestFilter {

    private static final String CACHE_CONTROL = "Cache-Control";
    private static final String HTML_REVALIDATE = "no-cache, max-age=0, must-revalidate";
    private static final String IMMUTABLE_ASSET = "public, max-age=31536000, immutable";
    private static final Set<String> SPA_ENTRY_ROUTES = Set.of(
            "",
            "/",
            "/tech",
            "/units",
            "/summary",
            "/codex",
            "/quests",
            "/mods",
            "/info",
            "/admin/import"
    );

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        String path = request.getRequestURI();
        if (isSpaHtmlShell(path)) {
            response.setHeader(CACHE_CONTROL, HTML_REVALIDATE);
        } else if (path.startsWith("/assets/")) {
            response.setHeader(CACHE_CONTROL, IMMUTABLE_ASSET);
        }

        filterChain.doFilter(request, response);
    }

    private static boolean isSpaHtmlShell(String path) {
        return path.endsWith(".html")
                || SPA_ENTRY_ROUTES.contains(path)
                || path.startsWith("/quests/");
    }
}
