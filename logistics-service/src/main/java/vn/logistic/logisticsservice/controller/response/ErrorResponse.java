package vn.logistic.logisticsservice.controller.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ErrorResponse {
    private Instant timestamp;
    private int status;
    private String code;
    private String message;
    private String path;
    private String traceId;
}
