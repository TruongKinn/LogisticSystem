package vn.logistic.logisticsservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.logistic.logisticsservice.dto.SagaTransactionResponse;
import vn.logistic.logisticsservice.service.LogisticsService;

import java.util.List;

@RestController
@RequestMapping("/orchestrator/order-saga/transactions")
@RequiredArgsConstructor
public class OrchestratorController {

    private final LogisticsService logisticsService;

    @GetMapping
    public ResponseEntity<List<SagaTransactionResponse>> getTransactions() {
        return ResponseEntity.ok(logisticsService.getSagaTransactions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SagaTransactionResponse> getTransaction(@PathVariable String id) {
        return ResponseEntity.ok(logisticsService.getSagaTransaction(id));
    }
}
