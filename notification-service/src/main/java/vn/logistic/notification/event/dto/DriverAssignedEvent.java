package vn.logistic.notification.event.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverAssignedEvent {
    private String eventId;
    private String eventType;
    private int eventVersion;
    private Instant occurredAt;
    private String producer;
    private String traceId;
    private DriverAssignedPayload payload;
}
