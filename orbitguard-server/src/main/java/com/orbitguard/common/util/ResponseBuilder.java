package com.orbitguard.common.util;

import com.orbitguard.common.response.ApiResponse;

public final class ResponseBuilder {

    /**
     * Private constructor to prevent instantiation.
     */
    private ResponseBuilder() {
    }

    /**
     * Build Success Response
     */
    public static <T> ApiResponse<T> success(String message, T data) {

        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    /**
     * Build Success Response without Data
     */
    public static ApiResponse<Void> success(String message) {

        return ApiResponse.<Void>builder()
                .success(true)
                .message(message)
                .data(null)
                .build();
    }

}