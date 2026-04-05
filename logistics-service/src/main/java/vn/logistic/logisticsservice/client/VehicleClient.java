package vn.logistic.logisticsservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import vn.logistic.logisticsservice.dto.VehicleDto;

@FeignClient(name = "vehicle-service", url = "${service.vehicle.url}")
public interface VehicleClient {

    @GetMapping("/vehicle/{id}")
    VehicleDto getVehicleById(@PathVariable("id") Long id);

    @PutMapping("/vehicle/{id}/status")
    VehicleDto updateVehicleStatus(@PathVariable("id") Long id, @RequestParam("status") String status);

    @PutMapping("/vehicle/{id}/assign-driver/{driverId}")
    VehicleDto assignDriver(@PathVariable("id") Long id, @PathVariable("driverId") Long driverId);

    @PutMapping("/vehicle/{id}/unassign-driver")
    VehicleDto unassignDriver(@PathVariable("id") Long id);
}
