package com.starwars.starshiprental.service;

import com.starwars.starshiprental.dto.PaymentRequestDTO;
import com.starwars.starshiprental.dto.PaymentResponseDTO;
import com.starwars.starshiprental.entity.*;
import com.starwars.starshiprental.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentStatusRepository paymentStatusRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final RentalRepository rentalRepository;

    public PaymentService(PaymentRepository paymentRepository,
                          PaymentStatusRepository paymentStatusRepository,
                          PaymentMethodRepository paymentMethodRepository,
                          RentalRepository rentalRepository) {
        this.paymentRepository = paymentRepository;
        this.paymentStatusRepository = paymentStatusRepository;
        this.paymentMethodRepository = paymentMethodRepository;
        this.rentalRepository = rentalRepository;
    }

    public Payment createPending(Rental rental, PaymentMethod paymentMethod) {
        PaymentStatus pending = paymentStatusRepository.findByName("pendente")
                .orElseThrow(() -> new IllegalStateException("Status 'pendente' não encontrado"));

        Payment payment = new Payment();
        payment.setRental(rental);
        payment.setStatus(pending);
        payment.setAmount(rental.getTotalPrice());
        payment.setPaymentMethod(paymentMethod);

        return paymentRepository.save(payment);
    }

    public List<PaymentResponseDTO> findAll() {
        return paymentRepository.findAll().stream()
                .map(PaymentResponseDTO::new)
                .toList();
    }

    public PaymentResponseDTO findById(Integer id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pagamento não encontrado com id: " + id));
        return new PaymentResponseDTO(payment);
    }

    public PaymentResponseDTO findByRentalId(Integer rentalId) {
        Payment payment = paymentRepository.findByRentalId(rentalId)
                .orElseThrow(() -> new IllegalArgumentException("Pagamento não encontrado para o rental id: " + rentalId));
        return new PaymentResponseDTO(payment);
    }

    public PaymentResponseDTO pay(Integer id, PaymentRequestDTO dto) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pagamento não encontrado com id: " + id));

        if (!payment.getStatus().getName().equals("pendente")) {
            throw new IllegalStateException("Apenas pagamentos pendentes podem ser pagos");
        }

        PaymentMethod method = paymentMethodRepository.findById(dto.getPaymentMethodId())
                .orElseThrow(() -> new IllegalArgumentException("Método de pagamento não encontrado com id: " + dto.getPaymentMethodId()));

        PaymentStatus paid = paymentStatusRepository.findByName("pago")
                .orElseThrow(() -> new IllegalStateException("Status 'pago' não encontrado"));

        payment.setPaymentMethod(method);
        payment.setStatus(paid);
        payment.setPaidAt(LocalDateTime.now());

        return new PaymentResponseDTO(paymentRepository.save(payment));
    }

    public PaymentResponseDTO cancel(Integer id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pagamento não encontrado com id: " + id));

        if (!payment.getStatus().getName().equals("pendente")) {
            throw new IllegalStateException("Apenas pagamentos pendentes podem ser cancelados");
        }

        PaymentStatus cancelled = paymentStatusRepository.findByName("cancelado")
                .orElseThrow(() -> new IllegalStateException("Status 'cancelado' não encontrado"));

        payment.setStatus(cancelled);

        return new PaymentResponseDTO(paymentRepository.save(payment));
    }
}

