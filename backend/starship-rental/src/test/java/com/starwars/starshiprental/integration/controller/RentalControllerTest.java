package com.starwars.starshiprental.integration.controller;

import tools.jackson.databind.ObjectMapper;
import com.starwars.starshiprental.dto.RentalRequestDTO;
import com.starwars.starshiprental.entity.*;
import com.starwars.starshiprental.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class RentalControllerTest {

    private static final String AUTH_HEADER = "Authorization";
    private static final String AUTH_TOKEN = "Bearer test-token";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RentalRepository rentalRepository;

    @Autowired
    private RentalStatusRepository rentalStatusRepository;

    @Autowired
    private SpaceshipRepository spaceshipRepository;

    @Autowired
    private SpaceshipStatusRepository spaceshipStatusRepository;

    @Autowired
    private PlanetRepository planetRepository;

    @Autowired
    private PaymentMethodRepository paymentMethodRepository;

    @Autowired
    private PaymentStatusRepository paymentStatusRepository;

    private SpaceshipStatus disponivelStatus;
    private SpaceshipStatus alugadaStatus;
    private RentalStatus ativaStatus;
    private RentalStatus concluidaStatus;
    private RentalStatus canceladaStatus;
    private Planet pickupPlanet;
    private Planet returnPlanet;
    private PaymentMethod paymentMethod;

    @BeforeEach
    void setUp() {
        disponivelStatus = getOrCreateSpaceshipStatus("disponivel");
        alugadaStatus = getOrCreateSpaceshipStatus("alugada");

        ativaStatus = getOrCreateRentalStatus("ativa");
        concluidaStatus = getOrCreateRentalStatus("concluida");
        canceladaStatus = getOrCreateRentalStatus("cancelada");

        getOrCreatePaymentStatus("pendente");

        pickupPlanet = createPlanet("Tatooine");
        returnPlanet = createPlanet("Coruscant");

        paymentMethod = paymentMethodRepository.findById(1)
                .orElseGet(() -> {
                    PaymentMethod method = new PaymentMethod();
                    method.setName("Cartão de Crédito");
                    return paymentMethodRepository.save(method);
                });
    }

    @Nested
    @DisplayName("POST /rentals")
    class CreateTests {

        @Test
        @DisplayName("Should create rental successfully")
        void shouldCreateRentalSuccessfully() throws Exception {
            Spaceship spaceship = createAvailableSpaceship("Millennium Falcon");

            RentalRequestDTO requestDTO = new RentalRequestDTO();
            requestDTO.setUserId(1);
            requestDTO.setSpaceshipId(spaceship.getId());
            requestDTO.setPickupPlanetId(pickupPlanet.getId());
            requestDTO.setReturnPlanetId(returnPlanet.getId());
            requestDTO.setStartDate(OffsetDateTime.now().plusDays(1));
            requestDTO.setEndDate(OffsetDateTime.now().plusDays(5));
            requestDTO.setPaymentMethodId(paymentMethod.getId());

            mockMvc.perform(post("/rentals")
                    .header(AUTH_HEADER, AUTH_TOKEN)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(requestDTO)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").exists())
                    .andExpect(jsonPath("$.userId").value(1))
                    .andExpect(jsonPath("$.spaceshipId").value(spaceship.getId()))
                    .andExpect(jsonPath("$.status").value("ativa"))
                    .andExpect(jsonPath("$.totalPrice").exists());
        }

        @Test
        @DisplayName("Should return 400 when spaceship is not available")
        void shouldReturn400WhenSpaceshipNotAvailable() throws Exception {
            Spaceship spaceship = createRentedSpaceship("X-Wing");

            RentalRequestDTO requestDTO = new RentalRequestDTO();
            requestDTO.setUserId(1);
            requestDTO.setSpaceshipId(spaceship.getId());
            requestDTO.setPickupPlanetId(pickupPlanet.getId());
            requestDTO.setReturnPlanetId(returnPlanet.getId());
            requestDTO.setStartDate(OffsetDateTime.now().plusDays(1));
            requestDTO.setEndDate(OffsetDateTime.now().plusDays(5));
            requestDTO.setPaymentMethodId(paymentMethod.getId());

            mockMvc.perform(post("/rentals")
                    .header(AUTH_HEADER, AUTH_TOKEN)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(requestDTO)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value(containsString("Nave não está disponível")));
        }

        @Test
        @DisplayName("Should return 400 when end date is before start date")
        void shouldReturn400WhenEndDateBeforeStartDate() throws Exception {
            Spaceship spaceship = createAvailableSpaceship("Falcon");

            RentalRequestDTO requestDTO = new RentalRequestDTO();
            requestDTO.setUserId(1);
            requestDTO.setSpaceshipId(spaceship.getId());
            requestDTO.setPickupPlanetId(pickupPlanet.getId());
            requestDTO.setReturnPlanetId(returnPlanet.getId());
            requestDTO.setStartDate(OffsetDateTime.now().plusDays(5));
            requestDTO.setEndDate(OffsetDateTime.now().plusDays(1));
            requestDTO.setPaymentMethodId(paymentMethod.getId());

            mockMvc.perform(post("/rentals")
                    .header(AUTH_HEADER, AUTH_TOKEN)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(requestDTO)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value(containsString("Data de fim deve ser posterior")));
        }

        @Test
        @DisplayName("Should return 400 when spaceship not found")
        void shouldReturn400WhenSpaceshipNotFound() throws Exception {
            RentalRequestDTO requestDTO = new RentalRequestDTO();
            requestDTO.setUserId(1);
            requestDTO.setSpaceshipId(99999);
            requestDTO.setPickupPlanetId(pickupPlanet.getId());
            requestDTO.setReturnPlanetId(returnPlanet.getId());
            requestDTO.setStartDate(OffsetDateTime.now().plusDays(1));
            requestDTO.setEndDate(OffsetDateTime.now().plusDays(5));
            requestDTO.setPaymentMethodId(paymentMethod.getId());

            mockMvc.perform(post("/rentals")
                    .header(AUTH_HEADER, AUTH_TOKEN)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(requestDTO)))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.message").value(containsString("Nave não encontrada")));
        }
    }

    @Nested
    @DisplayName("GET /rentals")
    class FindAllTests {

        @Test
        @DisplayName("Should return all rentals")
        void shouldReturnAllRentals() throws Exception {
            Spaceship spaceship = createAvailableSpaceship("Falcon");
            createRental(spaceship, ativaStatus);

            mockMvc.perform(get("/rentals")
                    .header(AUTH_HEADER, AUTH_TOKEN))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
        }
    }

    @Nested
    @DisplayName("GET /rentals/{id}")
    class FindByIdTests {

        @Test
        @DisplayName("Should return rental by id")
        void shouldReturnRentalById() throws Exception {
            Spaceship spaceship = createAvailableSpaceship("Falcon");
            Rental rental = createRental(spaceship, ativaStatus);

            mockMvc.perform(get("/rentals/{id}", rental.getId())
                    .header(AUTH_HEADER, AUTH_TOKEN))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(rental.getId()))
                    .andExpect(jsonPath("$.status").value("ativa"));
        }

        @Test
        @DisplayName("Should return 404 when rental not found")
        void shouldReturn404WhenRentalNotFound() throws Exception {
            mockMvc.perform(get("/rentals/{id}", 99999)
                    .header(AUTH_HEADER, AUTH_TOKEN))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.message").value(containsString("Aluguel não encontrado")));
        }
    }

    @Nested
    @DisplayName("PATCH /rentals/{id}/conclude")
    class ConcludeTests {

        @Test
        @DisplayName("Should conclude active rental successfully")
        void shouldConcludeActiveRentalSuccessfully() throws Exception {
            Spaceship spaceship = createRentedSpaceship("Falcon");
            Rental rental = createRental(spaceship, ativaStatus);

            mockMvc.perform(patch("/rentals/{id}/conclude", rental.getId())
                    .header(AUTH_HEADER, AUTH_TOKEN))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(rental.getId()))
                    .andExpect(jsonPath("$.status").value("concluida"))
                    .andExpect(jsonPath("$.actualReturnDate").exists());
        }

        @Test
        @DisplayName("Should return 400 when concluding non-active rental")
        void shouldReturn400WhenConcludingNonActiveRental() throws Exception {
            Spaceship spaceship = createRentedSpaceship("Falcon");
            Rental rental = createRental(spaceship, concluidaStatus);

            mockMvc.perform(patch("/rentals/{id}/conclude", rental.getId())
                    .header(AUTH_HEADER, AUTH_TOKEN))
                    .andExpect(status().isBadRequest())
                    .andExpect(
                            jsonPath("$.message").value(containsString("Apenas alugueis ativos podem ser concluídos")));
        }
    }

    @Nested
    @DisplayName("PATCH /rentals/{id}/cancel")
    class CancelTests {

        @Test
        @DisplayName("Should cancel active rental successfully")
        void shouldCancelActiveRentalSuccessfully() throws Exception {
            Spaceship spaceship = createRentedSpaceship("Falcon");
            Rental rental = createRental(spaceship, ativaStatus);

            mockMvc.perform(patch("/rentals/{id}/cancel", rental.getId())
                    .header(AUTH_HEADER, AUTH_TOKEN))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(rental.getId()))
                    .andExpect(jsonPath("$.status").value("cancelada"));
        }

        @Test
        @DisplayName("Should return 400 when cancelling non-active rental")
        void shouldReturn400WhenCancellingNonActiveRental() throws Exception {
            Spaceship spaceship = createRentedSpaceship("Falcon");
            Rental rental = createRental(spaceship, canceladaStatus);

            mockMvc.perform(patch("/rentals/{id}/cancel", rental.getId())
                    .header(AUTH_HEADER, AUTH_TOKEN))
                    .andExpect(status().isBadRequest())
                    .andExpect(
                            jsonPath("$.message").value(containsString("Apenas alugueis ativos podem ser cancelados")));
        }
    }

    private SpaceshipStatus getOrCreateSpaceshipStatus(String name) {
        return spaceshipStatusRepository.findByName(name)
                .orElseGet(() -> {
                    SpaceshipStatus status = new SpaceshipStatus();
                    status.setName(name);
                    return spaceshipStatusRepository.save(status);
                });
    }

    private RentalStatus getOrCreateRentalStatus(String name) {
        return rentalStatusRepository.findByName(name)
                .orElseGet(() -> {
                    RentalStatus status = new RentalStatus();
                    status.setName(name);
                    return rentalStatusRepository.save(status);
                });
    }

    private PaymentStatus getOrCreatePaymentStatus(String name) {
        return paymentStatusRepository.findByName(name)
                .orElseGet(() -> {
                    PaymentStatus status = new PaymentStatus();
                    status.setName(name);
                    return paymentStatusRepository.save(status);
                });
    }

    private Planet createPlanet(String name) {
        Planet planet = new Planet();
        planet.setName(name);
        planet.setActive(true);
        return planetRepository.save(planet);
    }

    private Spaceship createAvailableSpaceship(String name) {
        Spaceship spaceship = new Spaceship();
        spaceship.setName(name);
        spaceship.setModel("Model");
        spaceship.setManufacturer("Manufacturer");
        spaceship.setCapacity(4);
        spaceship.setDailyPrice(new BigDecimal("500.00"));
        spaceship.setStatus(disponivelStatus);
        spaceship.setActive(true);
        return spaceshipRepository.save(spaceship);
    }

    private Spaceship createRentedSpaceship(String name) {
        Spaceship spaceship = new Spaceship();
        spaceship.setName(name);
        spaceship.setModel("Model");
        spaceship.setManufacturer("Manufacturer");
        spaceship.setCapacity(4);
        spaceship.setDailyPrice(new BigDecimal("500.00"));
        spaceship.setStatus(alugadaStatus);
        spaceship.setActive(true);
        return spaceshipRepository.save(spaceship);
    }

    private Rental createRental(Spaceship spaceship, RentalStatus status) {
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
}
