package com.starwars.starshiprental.dto;

import com.starwars.starshiprental.entity.Payment;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
public class PaymentResponseDTO {

    private final Integer id;
    private final Integer rentalId;
    private final String status;
    private final BigDecimal amount;
    private final String paymentMethod;
    private final LocalDateTime paidAt;
    private final LocalDateTime createdAt;

    public PaymentResponseDTO(Payment payment) {
        this.id = payment.getId();
        this.rentalId = payment.getRental().getId();
        this.status = payment.getStatus().getName();
        this.amount = payment.getAmount();
        this.paymentMethod = payment.getPaymentMethod().getName();
        this.paidAt = payment.getPaidAt();
        this.createdAt = payment.getCreatedAt();
    }
}

