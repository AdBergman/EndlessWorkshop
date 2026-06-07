package ewshop.api.controller;

public record ApiErrorDto(
        String code,
        String message,
        String path
) {}
