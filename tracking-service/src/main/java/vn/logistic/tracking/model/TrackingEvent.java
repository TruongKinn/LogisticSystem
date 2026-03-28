package vn.logistic.tracking.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "tracking_events")
public class TrackingEvent {
    
    @Id
    private String id;
    
    private Long shipmentId;
    
    private String shipmentCode;
    
    private String status;
    
    private String location;
    
    private String note;
    
    private String updatedBy;
    
    private Date timestamp;
}
