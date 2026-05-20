package com.starwars.starshiprental.integration.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.starwars.starshiprental.config.TestContainersConfig;
import com.starwars.starshiprental.dto.PaymentRequestDTO;
import com.starwars.starshiprental.entity.*;
import com.starwars.starshiprental.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestContainersConfig.class)
@ActiveProfiles("test")
@Transactional
class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaymentStatusRepository paymentStatusRepository;

    @Autowired
    private PaymentMethodRepository paymentMethodRepository;

    @Autowired
    private RentalRepository rentalRepository;

    @Autowired
    private SpaceshipRepository spaceshipRepository;

    @Autowired
    private SpaceshipStatusRepository spaceshipStatusRepository;

    @Autowired
    private PlanetRepository planetRepository;

    @Autowired
    private RentalStatusRepository rentalStatusRepository;

    private PaymentMethod creditCardMethod;
    private PaymentMethod pixMethod;
    private PaymentStatus pendingStatus;
    private PaymentStatus paidStatus;
    private PaymentStatus cancelledStatus;

    @BeforeEach
    void setUp() {
        pendingStatus = getOrCreatePaymentStatus("pendente");
        paidStatus = getOrCreatePaymentStatus("pago");
        cancelledStatus = getOrCreatePaymentStatus("cancelado");

        creditCardMethod = getOrCreatePaymentMethod("Cartão de Crédito");
        pixMethod = getOrCreatePaymentMethod("PIX");
    }

    @Nested
    @DisplayName("GET /payments")
    class FindAllTests {

        @Test
        @DisplayName("Should return all payments")
        void shouldReturnAllPayments() throws Exception {
            Rental rental = createRental();
            createPayment(rental, pendingStatus, creditCardMethod);

            mockMvc.perform(get("/payments"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
        }
    }

    @Nested
    @DisplayName("GET /payments/{id}")
    class FindByIdTests {

        @Test
        @DisplayName("Should return payment by id")
        void shouldReturnPaymentById() throws Exception {
            Rental rental = createRental();
            Payment payment = createPayment(rental, pendingStatus, creditCardMethod);

            mockMvc.perform(get("/payments/{id}", payment.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(payment.getId()))
                    .andExpect(jsonPath("$.status").value("pendente"));
        }

        @Test
        @DisplayName("Should return 404 when payment not found")
        void shouldReturn404WhenPaymentNotFound() throws Exception {
            mockMvc.perform(get("/payments/{id}", 99999))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.message").value(containsString("Pagamento não encontrado")));
        }
    }

    @Nested
    @DisplayName("GET /payments/rental/{rentalId}")
    class FindByRentalIdTests {

        @Test
        @DisplayName("Should return payment by rental id")
        void shouldReturnPaymentByRentalId() throws Exception {
            Rental rental = createRental();
            Payment payment = createPayment(rental, pendingStatus, creditCardMethod);

            mockMvc.perform(get("/payments/rental/{rentalId}", rental.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.rentalId").value(rental.getId()));
        }

        @Test
        @DisplayName("Should return 404 when payment not found for rental")
        void shouldReturn404WhenPaymentNotFoundForRental() throws Exception {
            mockMvc.perform(get("/payments/rental/{rentalId}", 99999))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.message").value(containsString("Pagamento não encontrado para o rental")));
        }
    }

    @Nested
    @DisplayName("PATCH /payments/{id}/pay")
    class PayTests {

        @Test
        @DisplayName("Should process payment successfully")
        void shouldProcessPaymentSuccessfully() throws Exception {
            Rental rental = createRental();
            Payment payment = createPayment(rental, pendingStatus, creditCardMethod);

            PaymentRequestDTO requestDTO = new PaymentRequestDTO();
            requestDTO.setPaymentMethodId(pixMethod.getId());

            mockMvc.perform(patch("/payments/{id}/pay", payment.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(requestDTO)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(payment.getId()))
                    .andExpect(jsonPath("$.status").value("pago"))
                    .andExpect(jsonPath("$.paymentMethod").value("PIX"))
                    .andExpect(jsonPath("$.paidAt").exists());
        }

        @Test
        @DisplayName("Should return 400 when paying non-pending payment")
        void shouldReturn400WhenPayingNonPendingPayment() throws Exception {
            Rental rental = createRental();
            Payment payment = createPayment(rental, paidStatus, creditCardMethod);

            PaymentRequestDTO requestDTO = new PaymentRequestDTO();
            requestDTO.setPaymentMethodId(pixMethod.getId());

            mockMvc.perform(patch("/payments/{id}/pay", payment.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(requestDTO)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value(containsString("Apenas pagamentos pendentes podem ser pagos")));
        }
    }

    @Nested
    @DisplayName("PATCH /payments/{id}/cancel")
    class CancelTests {

        @Test
        @DisplayName("Should cancel pending payment successfully")
        void shouldCancelPendingPaymentSuccessfully() throws Exception {
            Rental rental = createRental();
            Payment payment = createPayment(rental, pendingStatus, creditCardMethod);

            mockMvc.perform(patch("/payments/{id}/cancel", payment.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(payment.getId()))
                    .andExpect(jsonPath("$.status").value("cancelado"));
        }

        @Test
        @DisplayName("Should return 400 when cancelling non-pending payment")
        void shouldReturn400WhenCancellingNonPendingPayment() throws Exception {
            Rental rental = createRental();
            Payment payment = createPayment(rental, paidStatus, creditCardMethod);

            mockMvc.perform(patch("/payments/{id}/cancel", payment.getId()))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value(containsString("Apenas pagamentos pendentes podem ser cancelados")));
        }
    }

    private PaymentStatus getOrCreatePaymentStatus(String name) {
        return paymentStatusRepository.findByName(name)
                .orElseGet(() -> {
                    PaymentStatus status = new PaymentStatus();
                    status.setName(name);
                    return paymentStatusRepository.save(status);
                });
    }

    private PaymentMethod getOrCreatePaymentMethod(String name) {
        return paymentMethodRepository.findById(1)
                .orElseGet(() -> {
                    PaymentMethod method = new PaymentMethod();
                    method.setName(name);
                    return paymentMethodRepository.save(method);
                });
    }

    private Planet createPlanet(String name) {
        Planet planet = new Planet();
        planet.setName(name);
        planet.setActive(true);
        return planetRepository.save(planet);
    }

    private Spaceship createSpaceship() {
        SpaceshipStatus status = spaceshipStatusRepository.findByName("disponivel")
                .orElseGet(() -> {
                    SpaceshipStatus s = new SpaceshipStatus();
                    s.setName("disponivel");
                    return spaceshipStatusRepository.save(s);
                });

        Spaceship spaceship = new Spaceship();
        spaceship.setName("Test Ship");
        spaceship.setModel("Model");
        spaceship.setManufacturer("Manufacturer");
        spaceship.setCapacity(4);
        spaceship.setDailyPrice(new BigDecimal("500.00"));
        spaceship.setStatus(status);
        spaceship.setActive(true);
        return spaceshipRepository.save(spaceship);
    }

    private Rental createRental() {
        Spaceship spaceship = createSpaceship();
        Planet pickupPlanet = createPlanet("Tatooine");
        Planet returnPlanet = createPlanet("Coruscant");

        RentalStatus status = rentalStatusRepository.findByName("ativa")
                .orElseGet(() -> {
                    RentalStatus s = new RentalStatus();
                    s.setName("ativa");
                    return rentalStatusRepository.save(s);
                });

        Rental rental = new Rental();
        rental.setUserId(1);
        rental.setSpaceship(spaceship);
        rental.setStatus(status);
        rental.setPickupPlanet(pickupPlanet);
        rental.setReturnPlanet(returnPlanet);
        rental.setStartDate(LocalDateTime.now());
        rental.setEndDate(LocalDateTime.now().plusDays(3));
        rental.setTotalPrice(new BigDecimal("1500.00"));
        return rentalRepository.save(rental);
    }

    private Payment createPayment(Rental rental, PaymentStatus status, PaymentMethod method) {
        Payment payment = new Payment();
        payment.setRental(rental);
        payment.setStatus(status);
        payment.setAmount(rental.getTotalPrice());
        payment.setPaymentMethod(method);
        return paymentRepository.save(payment);
    }
}
