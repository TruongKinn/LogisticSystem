package vn.logistic.logisticsservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import vn.logistic.logisticsservice.dto.DriverDto;

@FeignClient(name = "driver-service", url = "${service.driver.url}")
public interface DriverClient {

    @GetMapping("/driver/{id}")
    DriverDto getDriverById(@PathVariable("id") Long id);

    @PutMapping("/driver/{id}/status")
    DriverDto updateDriverStatus(@PathVariable("id") Long id, @RequestParam("status") String status);
}
