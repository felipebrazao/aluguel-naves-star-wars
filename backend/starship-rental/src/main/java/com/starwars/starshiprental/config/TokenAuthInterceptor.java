package com.starwars.starshiprental.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.util.Set;

@Component
public class TokenAuthInterceptor implements HandlerInterceptor {

    private static final Set<String> PUBLIC_POST_PATHS = Set.of("/users", "/users/login");

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws IOException {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String normalizedPath = normalizePath(request.getRequestURI());
        if (isPublicRoute(request.getMethod(), normalizedPath)) {
            return true;
        }

        String authorization = request.getHeader("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ") || authorization.substring(7).isBlank()) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Token de autorização ausente ou inválido\"}");
            return false;
        }

        return true;
    }

    private boolean isPublicRoute(String method, String path) {
        return "POST".equalsIgnoreCase(method) && PUBLIC_POST_PATHS.contains(path);
    }

    private String normalizePath(String path) {
        if (path == null || path.isBlank()) {
            return "/";
        }

        if (path.length() > 1 && path.endsWith("/")) {
            return path.substring(0, path.length() - 1);
        }

        return path;
    }
}
