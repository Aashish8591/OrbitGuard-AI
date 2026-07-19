package com.orbitguard.common.response;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ErrorResponse {

    private boolean success;

    private String message;

    private int status;

    private LocalDateTime timestamp;

}