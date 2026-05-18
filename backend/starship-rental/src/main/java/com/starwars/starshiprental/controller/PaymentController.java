package com.starwars.starshiprental.controller;

import com.starwars.starshiprental.dto.PaymentRequestDTO;
import com.starwars.starshiprental.dto.PaymentResponseDTO;
import com.starwars.starshiprental.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping
    public ResponseEntity<List<PaymentResponseDTO>> findAll() {
        return ResponseEntity.ok(paymentService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponseDTO> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(paymentService.findById(id));
    }

    @GetMapping("/rental/{rentalId}")
    public ResponseEntity<PaymentResponseDTO> findByRentalId(@PathVariable Integer rentalId) {
        return ResponseEntity.ok(paymentService.findByRentalId(rentalId));
    }

    @PatchMapping("/{id}/pay")
    public ResponseEntity<PaymentResponseDTO> pay(@PathVariable Integer id,
                                                  @Validated @RequestBody PaymentRequestDTO dto) {
        return ResponseEntity.ok(paymentService.pay(id, dto));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<PaymentResponseDTO> cancel(@PathVariable Integer id) {
        return ResponseEntity.ok(paymentService.cancel(id));
    }
}

