package vn.logistic.vehicleservice;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "vn.logistic.vehicle")
@EntityScan(basePackages = "vn.logistic.vehicle.model")
@EnableJpaRepositories(basePackages = "vn.logistic.vehicle.repository")
public class VehicleServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(VehicleServiceApplication.class, args);
	}

}
