package com.scinar.giderlerim.dto.response;

public record ApiResponse<T>(
        boolean success,
        String message,
        T data
) {
    public static <T> ApiResponse<T> basarili(T data) {
        return new ApiResponse<>(true, null, data);
    }

    public static <T> ApiResponse<T> basarili(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    public static <T> ApiResponse<T> basarisiz(String message) {
        return new ApiResponse<>(false, message, null);
    }
}
