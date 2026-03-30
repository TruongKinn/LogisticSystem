package vn.logistic.logisticsservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import vn.logistic.logisticsservice.dto.ShipmentDto;

import java.util.List;

@FeignClient(name = "shipment-service", url = "${service.shipment.url}")
public interface ShipmentClient {

    @GetMapping("/shipment")
    List<ShipmentDto> getAllShipments();

    @GetMapping("/shipment/code/{code}")
    ShipmentDto getShipmentByCode(@PathVariable("code") String code);

    @PutMapping("/shipment/{id}/assign")
    ShipmentDto assignDriverAndVehicle(
            @PathVariable("id") Long id,
            @RequestParam("driverId") Long driverId,
            @RequestParam("vehicleId") Long vehicleId);
}
