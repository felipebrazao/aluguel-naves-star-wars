package com.starwars.starshiprental.unit.service;

import com.starwars.starshiprental.dto.PaymentRequestDTO;
import com.starwars.starshiprental.dto.PaymentResponseDTO;
import com.starwars.starshiprental.entity.*;
import com.starwars.starshiprental.repository.PaymentMethodRepository;
import com.starwars.starshiprental.repository.PaymentRepository;
import com.starwars.starshiprental.repository.PaymentStatusRepository;
import com.starwars.starshiprental.repository.RentalRepository;
import com.starwars.starshiprental.service.PaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private PaymentStatusRepository paymentStatusRepository;

    @Mock
    private PaymentMethodRepository paymentMethodRepository;

    @Mock
    private RentalRepository rentalRepository;

    @InjectMocks
    private PaymentService paymentService;

    private PaymentStatus pendingStatus;
    private PaymentStatus paidStatus;
    private PaymentStatus cancelledStatus;
    private PaymentMethod creditCardMethod;
    private PaymentMethod pixMethod;
    private Rental rental;

    @BeforeEach
    void setUp() {
        pendingStatus = new PaymentStatus();
        pendingStatus.setId(1);
        pendingStatus.setName("pendente");

        paidStatus = new PaymentStatus();
        paidStatus.setId(2);
        paidStatus.setName("pago");

        cancelledStatus = new PaymentStatus();
        cancelledStatus.setId(3);
        cancelledStatus.setName("cancelado");

        creditCardMethod = new PaymentMethod();
        creditCardMethod.setId(1);
        creditCardMethod.setName("Cartão de Crédito");

        pixMethod = new PaymentMethod();
        pixMethod.setId(2);
        pixMethod.setName("PIX");

        rental = new Rental();
        rental.setId(1);
        rental.setTotalPrice(new BigDecimal("2000.00"));
    }

    @Nested
    @DisplayName("createPending")
    class CreatePendingTests {

        @Test
        @DisplayName("Should create pending payment successfully")
        void shouldCreatePendingPaymentSuccessfully() {
            when(paymentStatusRepository.findByName("pendente")).thenReturn(Optional.of(pendingStatus));

            Payment savedPayment = new Payment();
            savedPayment.setId(1);
            savedPayment.setRental(rental);
            savedPayment.setStatus(pendingStatus);
            savedPayment.setAmount(rental.getTotalPrice());
            savedPayment.setPaymentMethod(creditCardMethod);

            when(paymentRepository.save(any(Payment.class))).thenReturn(savedPayment);

            Payment result = paymentService.createPending(rental, creditCardMethod);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(1);
            assertThat(result.getAmount()).isEqualByComparingTo(new BigDecimal("2000.00"));
            assertThat(result.getStatus().getName()).isEqualTo("pendente");
            assertThat(result.getPaymentMethod()).isEqualTo(creditCardMethod);
        }

        @Test
        @DisplayName("Should throw exception when pending status not found")
        void shouldThrowExceptionWhenPendingStatusNotFound() {
            when(paymentStatusRepository.findByName("pendente")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> paymentService.createPending(rental, creditCardMethod))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Status 'pendente' não encontrado");

            verify(paymentRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("findAll")
    class FindAllTests {

        @Test
        @DisplayName("Should return all payments")
        void shouldReturnAllPayments() {
            Payment payment1 = createPayment(1, pendingStatus);
            Payment payment2 = createPayment(2, paidStatus);

            when(paymentRepository.findAll()).thenReturn(List.of(payment1, payment2));

            List<PaymentResponseDTO> result = paymentService.findAll();

            assertThat(result).hasSize(2);
            assertThat(result).extracting(PaymentResponseDTO::getStatus)
                    .containsExactlyInAnyOrder("pendente", "pago");
        }
    }

    @Nested
    @DisplayName("findById")
    class FindByIdTests {

        @Test
        @DisplayName("Should return payment when found")
        void shouldReturnPaymentWhenFound() {
            Payment payment = createPayment(1, pendingStatus);

            when(paymentRepository.findById(1)).thenReturn(Optional.of(payment));

            PaymentResponseDTO result = paymentService.findById(1);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(1);
            assertThat(result.getStatus()).isEqualTo("pendente");
            assertThat(result.getAmount()).isEqualByComparingTo(new BigDecimal("2000.00"));
        }

        @Test
        @DisplayName("Should throw exception when payment not found")
        void shouldThrowExceptionWhenPaymentNotFound() {
            when(paymentRepository.findById(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> paymentService.findById(999))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Pagamento não encontrado com id: 999");
        }
    }

    @Nested
    @DisplayName("findByRentalId")
    class FindByRentalIdTests {

        @Test
        @DisplayName("Should return payment when found by rental id")
        void shouldReturnPaymentWhenFoundByRentalId() {
            Payment payment = createPayment(1, pendingStatus);

            when(paymentRepository.findByRentalId(1)).thenReturn(Optional.of(payment));

            PaymentResponseDTO result = paymentService.findByRentalId(1);

            assertThat(result).isNotNull();
            assertThat(result.getRentalId()).isEqualTo(1);
        }

        @Test
        @DisplayName("Should throw exception when payment not found for rental")
        void shouldThrowExceptionWhenPaymentNotFoundForRental() {
            when(paymentRepository.findByRentalId(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> paymentService.findByRentalId(999))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Pagamento não encontrado para o rental id: 999");
        }
    }

    @Nested
    @DisplayName("pay")
    class PayTests {

        @Test
        @DisplayName("Should process payment successfully")
        void shouldProcessPaymentSuccessfully() {
            Payment payment = createPayment(1, pendingStatus);
            payment.setPaymentMethod(creditCardMethod);

            PaymentRequestDTO requestDTO = new PaymentRequestDTO();
            requestDTO.setPaymentMethodId(2);

            when(paymentRepository.findById(1)).thenReturn(Optional.of(payment));
            when(paymentMethodRepository.findById(2)).thenReturn(Optional.of(pixMethod));
            when(paymentStatusRepository.findByName("pago")).thenReturn(Optional.of(paidStatus));
            when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

            PaymentResponseDTO result = paymentService.pay(1, requestDTO);

            assertThat(result.getStatus()).isEqualTo("pago");
            assertThat(result.getPaymentMethod()).isEqualTo("PIX");
            assertThat(payment.getPaidAt()).isNotNull();
        }

        @Test
        @DisplayName("Should throw exception when payment is not pending")
        void shouldThrowExceptionWhenPaymentIsNotPending() {
            Payment payment = createPayment(1, paidStatus);

            PaymentRequestDTO requestDTO = new PaymentRequestDTO();
            requestDTO.setPaymentMethodId(1);

            when(paymentRepository.findById(1)).thenReturn(Optional.of(payment));

            assertThatThrownBy(() -> paymentService.pay(1, requestDTO))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Apenas pagamentos pendentes podem ser pagos");

            verify(paymentMethodRepository, never()).findById(any());
        }

        @Test
        @DisplayName("Should throw exception when payment not found")
        void shouldThrowExceptionWhenPaymentNotFoundForPay() {
            when(paymentRepository.findById(999)).thenReturn(Optional.empty());

            PaymentRequestDTO requestDTO = new PaymentRequestDTO();
            requestDTO.setPaymentMethodId(1);

            assertThatThrownBy(() -> paymentService.pay(999, requestDTO))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Pagamento não encontrado com id: 999");
        }

        @Test
        @DisplayName("Should throw exception when payment method not found")
        void shouldThrowExceptionWhenPaymentMethodNotFound() {
            Payment payment = createPayment(1, pendingStatus);

            PaymentRequestDTO requestDTO = new PaymentRequestDTO();
            requestDTO.setPaymentMethodId(999);

            when(paymentRepository.findById(1)).thenReturn(Optional.of(payment));
            when(paymentMethodRepository.findById(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> paymentService.pay(1, requestDTO))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Método de pagamento não encontrado com id: 999");
        }

        @Test
        @DisplayName("Should throw exception when paid status not found")
        void shouldThrowExceptionWhenPaidStatusNotFound() {
            Payment payment = createPayment(1, pendingStatus);

            PaymentRequestDTO requestDTO = new PaymentRequestDTO();
            requestDTO.setPaymentMethodId(1);

            when(paymentRepository.findById(1)).thenReturn(Optional.of(payment));
            when(paymentMethodRepository.findById(1)).thenReturn(Optional.of(creditCardMethod));
            when(paymentStatusRepository.findByName("pago")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> paymentService.pay(1, requestDTO))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Status 'pago' não encontrado");
        }
    }

    @Nested
    @DisplayName("cancel")
    class CancelTests {

        @Test
        @DisplayName("Should cancel pending payment successfully")
        void shouldCancelPendingPaymentSuccessfully() {
            Payment payment = createPayment(1, pendingStatus);

            when(paymentRepository.findById(1)).thenReturn(Optional.of(payment));
            when(paymentStatusRepository.findByName("cancelado")).thenReturn(Optional.of(cancelledStatus));
            when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

            PaymentResponseDTO result = paymentService.cancel(1);

            assertThat(result.getStatus()).isEqualTo("cancelado");
        }

        @Test
        @DisplayName("Should throw exception when cancelling non-pending payment")
        void shouldThrowExceptionWhenCancellingNonPendingPayment() {
            Payment payment = createPayment(1, paidStatus);

            when(paymentRepository.findById(1)).thenReturn(Optional.of(payment));

            assertThatThrownBy(() -> paymentService.cancel(1))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Apenas pagamentos pendentes podem ser cancelados");
        }

        @Test
        @DisplayName("Should throw exception when payment not found")
        void shouldThrowExceptionWhenPaymentNotFoundForCancel() {
            when(paymentRepository.findById(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> paymentService.cancel(999))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Pagamento não encontrado com id: 999");
        }

        @Test
        @DisplayName("Should throw exception when cancelled status not found")
        void shouldThrowExceptionWhenCancelledStatusNotFound() {
            Payment payment = createPayment(1, pendingStatus);

            when(paymentRepository.findById(1)).thenReturn(Optional.of(payment));
            when(paymentStatusRepository.findByName("cancelado")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> paymentService.cancel(1))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Status 'cancelado' não encontrado");
        }
    }

    private Payment createPayment(Integer id, PaymentStatus status) {
        Payment payment = new Payment();
        payment.setId(id);
        payment.setRental(rental);
        payment.setStatus(status);
        payment.setAmount(rental.getTotalPrice());
        payment.setPaymentMethod(creditCardMethod);
        payment.setCreatedAt(LocalDateTime.now());
        return payment;
    }
}
