package ewshop.api.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorDto> handleIllegalArgument(
            IllegalArgumentException ex,
            HttpServletRequest request
    ) {
        return badRequest("INVALID_REQUEST", ex, request);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiErrorDto> handleIllegalState(
            IllegalStateException ex,
            HttpServletRequest request
    ) {
        return badRequest("IMPORT_REJECTED", ex, request);
    }

    private static ResponseEntity<ApiErrorDto> badRequest(
            String code,
            RuntimeException ex,
            HttpServletRequest request
    ) {
        String message = ex.getMessage() == null ? ex.getClass().getSimpleName() : ex.getMessage();
        String path = request == null ? null : request.getRequestURI();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiErrorDto(code, message, path));
    }
}
