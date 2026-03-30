package vn.logistic.notification.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class NotificationPageResponse {
    private int page;
    private int size;
    private int total;
    private List<NotificationDto> items;
}
