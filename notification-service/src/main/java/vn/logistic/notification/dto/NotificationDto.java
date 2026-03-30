package vn.logistic.notification.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class NotificationDto {
    private long id;
    private String message;
    private String recipientId;
    private String type;
    private String title;
    private String referenceId;
    private String provider;
    private String status;
    private Instant createdAt;
    @JsonProperty("isRead")
    private boolean isRead;
}
