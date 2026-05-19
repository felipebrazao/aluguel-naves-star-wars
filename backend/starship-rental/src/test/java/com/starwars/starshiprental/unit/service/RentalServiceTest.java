package com.starwars.starshiprental.unit.service;

import com.starwars.starshiprental.dto.RentalRequestDTO;
import com.starwars.starshiprental.dto.RentalResponseDTO;
import com.starwars.starshiprental.entity.*;
import com.starwars.starshiprental.repository.*;
import com.starwars.starshiprental.service.PaymentService;
import com.starwars.starshiprental.service.RentalService;
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
class RentalServiceTest {

    @Mock
    private RentalRepository rentalRepository;

    @Mock
    private RentalStatusRepository rentalStatusRepository;

    @Mock
    private SpaceshipRepository spaceshipRepository;

    @Mock
    private SpaceshipStatusRepository spaceshipStatusRepository;

    @Mock
    private PlanetRepository planetRepository;

    @Mock
    private PaymentMethodRepository paymentMethodRepository;

    @Mock
    private PaymentService paymentService;

    @InjectMocks
    private RentalService rentalService;

    private RentalRequestDTO validRequestDTO;
    private Spaceship availableSpaceship;
    private Spaceship rentedSpaceship;
    private Planet pickupPlanet;
    private Planet returnPlanet;
    private RentalStatus ativaStatus;
    private RentalStatus concluidaStatus;
    private RentalStatus canceladaStatus;
    private SpaceshipStatus disponivelStatus;
    private SpaceshipStatus alugadaStatus;
    private PaymentMethod paymentMethod;

    @BeforeEach
    void setUp() {
        validRequestDTO = new RentalRequestDTO();
        validRequestDTO.setUserId(1);
        validRequestDTO.setSpaceshipId(1);
        validRequestDTO.setPickupPlanetId(1);
        validRequestDTO.setReturnPlanetId(2);
        validRequestDTO.setStartDate(LocalDateTime.now().plusDays(1));
        validRequestDTO.setEndDate(LocalDateTime.now().plusDays(5));
        validRequestDTO.setPaymentMethodId(1);

        disponivelStatus = new SpaceshipStatus();
        disponivelStatus.setId(1);
        disponivelStatus.setName("disponivel");

        alugadaStatus = new SpaceshipStatus();
        alugadaStatus.setId(2);
        alugadaStatus.setName("alugada");

        ativaStatus = new RentalStatus();
        ativaStatus.setId(1);
        ativaStatus.setName("ativa");

        concluidaStatus = new RentalStatus();
        concluidaStatus.setId(2);
        concluidaStatus.setName("concluida");

        canceladaStatus = new RentalStatus();
        canceladaStatus.setId(3);
        canceladaStatus.setName("cancelada");

        pickupPlanet = new Planet();
        pickupPlanet.setId(1);
        pickupPlanet.setName("Tatooine");

        returnPlanet = new Planet();
        returnPlanet.setId(2);
        returnPlanet.setName("Coruscant");

        availableSpaceship = new Spaceship();
        availableSpaceship.setId(1);
        availableSpaceship.setName("Millennium Falcon");
        availableSpaceship.setDailyPrice(new BigDecimal("500.00"));
        availableSpaceship.setStatus(disponivelStatus);

        rentedSpaceship = new Spaceship();
        rentedSpaceship.setId(1);
        rentedSpaceship.setName("Millennium Falcon");
        rentedSpaceship.setDailyPrice(new BigDecimal("500.00"));
        rentedSpaceship.setStatus(alugadaStatus);

        paymentMethod = new PaymentMethod();
        paymentMethod.setId(1);
        paymentMethod.setName("Cartão de Crédito");
    }

    @Nested
    @DisplayName("create")
    class CreateTests {

        @Test
        @DisplayName("Should create rental successfully with correct price calculation")
        void shouldCreateRentalSuccessfully() {
            when(spaceshipRepository.findById(1)).thenReturn(Optional.of(availableSpaceship));
            when(planetRepository.findById(1)).thenReturn(Optional.of(pickupPlanet));
            when(planetRepository.findById(2)).thenReturn(Optional.of(returnPlanet));
            when(rentalStatusRepository.findByName("ativa")).thenReturn(Optional.of(ativaStatus));
            when(spaceshipStatusRepository.findByName("alugada")).thenReturn(Optional.of(alugadaStatus));
            when(paymentMethodRepository.findById(1)).thenReturn(Optional.of(paymentMethod));

            Rental savedRental = new Rental();
            savedRental.setId(1);
            savedRental.setUserId(1);
            savedRental.setSpaceship(availableSpaceship);
            savedRental.setStatus(ativaStatus);
            savedRental.setPickupPlanet(pickupPlanet);
            savedRental.setReturnPlanet(returnPlanet);
            savedRental.setStartDate(validRequestDTO.getStartDate());
            savedRental.setEndDate(validRequestDTO.getEndDate());
            savedRental.setTotalPrice(new BigDecimal("2000.00"));

            when(rentalRepository.save(any(Rental.class))).thenReturn(savedRental);
            when(spaceshipRepository.save(any(Spaceship.class))).thenReturn(availableSpaceship);

            RentalResponseDTO result = rentalService.create(validRequestDTO);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(1);
            assertThat(result.getUserId()).isEqualTo(1);
            assertThat(result.getTotalPrice()).isEqualByComparingTo(new BigDecimal("2000.00"));
            assertThat(result.getStatus()).isEqualTo("ativa");

            verify(paymentService).createPending(any(Rental.class), eq(paymentMethod));
            verify(spaceshipRepository).save(any(Spaceship.class));
        }

        @Test
        @DisplayName("Should throw exception when spaceship not found")
        void shouldThrowExceptionWhenSpaceshipNotFound() {
            when(spaceshipRepository.findById(999)).thenReturn(Optional.empty());

            validRequestDTO.setSpaceshipId(999);

            assertThatThrownBy(() -> rentalService.create(validRequestDTO))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Nave não encontrada com id: 999");
        }

        @Test
        @DisplayName("Should throw exception when spaceship is not available")
        void shouldThrowExceptionWhenSpaceshipNotAvailable() {
            when(spaceshipRepository.findById(1)).thenReturn(Optional.of(rentedSpaceship));

            assertThatThrownBy(() -> rentalService.create(validRequestDTO))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Nave não está disponível para aluguel");
        }

        @Test
        @DisplayName("Should throw exception when pickup planet not found")
        void shouldThrowExceptionWhenPickupPlanetNotFound() {
            when(spaceshipRepository.findById(1)).thenReturn(Optional.of(availableSpaceship));
            when(planetRepository.findById(999)).thenReturn(Optional.empty());

            validRequestDTO.setPickupPlanetId(999);

            assertThatThrownBy(() -> rentalService.create(validRequestDTO))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Planeta de retirada não encontrado com id: 999");
        }

        @Test
        @DisplayName("Should throw exception when return planet not found")
        void shouldThrowExceptionWhenReturnPlanetNotFound() {
            when(spaceshipRepository.findById(1)).thenReturn(Optional.of(availableSpaceship));
            when(planetRepository.findById(1)).thenReturn(Optional.of(pickupPlanet));
            when(planetRepository.findById(999)).thenReturn(Optional.empty());

            validRequestDTO.setReturnPlanetId(999);

            assertThatThrownBy(() -> rentalService.create(validRequestDTO))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Planeta de devolução não encontrado com id: 999");
        }

        @Test
        @DisplayName("Should throw exception when end date is before start date")
        void shouldThrowExceptionWhenEndDateBeforeStartDate() {
            when(spaceshipRepository.findById(1)).thenReturn(Optional.of(availableSpaceship));
            when(planetRepository.findById(1)).thenReturn(Optional.of(pickupPlanet));
            when(planetRepository.findById(2)).thenReturn(Optional.of(returnPlanet));

            validRequestDTO.setStartDate(LocalDateTime.now().plusDays(5));
            validRequestDTO.setEndDate(LocalDateTime.now().plusDays(1));

            assertThatThrownBy(() -> rentalService.create(validRequestDTO))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Data de fim deve ser posterior à data de início");
        }

        @Test
        @DisplayName("Should throw exception when ativa status not found")
        void shouldThrowExceptionWhenAtivaStatusNotFound() {
            when(spaceshipRepository.findById(1)).thenReturn(Optional.of(availableSpaceship));
            when(planetRepository.findById(1)).thenReturn(Optional.of(pickupPlanet));
            when(planetRepository.findById(2)).thenReturn(Optional.of(returnPlanet));
            when(rentalStatusRepository.findByName("ativa")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> rentalService.create(validRequestDTO))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Status 'ativa' não encontrado");
        }
    }

    @Nested
    @DisplayName("findAll")
    class FindAllTests {

        @Test
        @DisplayName("Should return all rentals")
        void shouldReturnAllRentals() {
            Rental rental1 = createRental(1, ativaStatus);
            Rental rental2 = createRental(2, concluidaStatus);

            when(rentalRepository.findAll()).thenReturn(List.of(rental1, rental2));

            List<RentalResponseDTO> result = rentalService.findAll();

            assertThat(result).hasSize(2);
        }
    }

    @Nested
    @DisplayName("findById")
    class FindByIdTests {

        @Test
        @DisplayName("Should return rental when found")
        void shouldReturnRentalWhenFound() {
            Rental rental = createRental(1, ativaStatus);

            when(rentalRepository.findById(1)).thenReturn(Optional.of(rental));

            RentalResponseDTO result = rentalService.findById(1);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(1);
        }

        @Test
        @DisplayName("Should throw exception when rental not found")
        void shouldThrowExceptionWhenRentalNotFound() {
            when(rentalRepository.findById(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> rentalService.findById(999))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Aluguel não encontrado com id: 999");
        }
    }

    @Nested
    @DisplayName("conclude")
    class ConcludeTests {

        @Test
        @DisplayName("Should conclude active rental successfully")
        void shouldConcludeActiveRentalSuccessfully() {
            Rental rental = createRental(1, ativaStatus);

            when(rentalRepository.findById(1)).thenReturn(Optional.of(rental));
            when(rentalStatusRepository.findByName("concluida")).thenReturn(Optional.of(concluidaStatus));
            when(spaceshipStatusRepository.findByName("disponivel")).thenReturn(Optional.of(disponivelStatus));
            when(rentalRepository.save(any(Rental.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(spaceshipRepository.save(any(Spaceship.class))).thenAnswer(invocation -> invocation.getArgument(0));

            RentalResponseDTO result = rentalService.conclude(1);

            assertThat(result.getStatus()).isEqualTo("concluida");
            assertThat(result.getActualReturnDate()).isNotNull();
        }

        @Test
        @DisplayName("Should throw exception when concluding non-active rental")
        void shouldThrowExceptionWhenConcludingNonActiveRental() {
            Rental rental = createRental(1, concluidaStatus);

            when(rentalRepository.findById(1)).thenReturn(Optional.of(rental));

            assertThatThrownBy(() -> rentalService.conclude(1))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Apenas alugueis ativos podem ser concluídos");
        }

        @Test
        @DisplayName("Should throw exception when rental not found")
        void shouldThrowExceptionWhenRentalNotFoundForConclude() {
            when(rentalRepository.findById(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> rentalService.conclude(999))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Aluguel não encontrado com id: 999");
        }
    }

    @Nested
    @DisplayName("cancel")
    class CancelTests {

        @Test
        @DisplayName("Should cancel active rental successfully")
        void shouldCancelActiveRentalSuccessfully() {
            Rental rental = createRental(1, ativaStatus);

            when(rentalRepository.findById(1)).thenReturn(Optional.of(rental));
            when(rentalStatusRepository.findByName("cancelada")).thenReturn(Optional.of(canceladaStatus));
            when(spaceshipStatusRepository.findByName("disponivel")).thenReturn(Optional.of(disponivelStatus));
            when(rentalRepository.save(any(Rental.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(spaceshipRepository.save(any(Spaceship.class))).thenAnswer(invocation -> invocation.getArgument(0));

            RentalResponseDTO result = rentalService.cancel(1);

            assertThat(result.getStatus()).isEqualTo("cancelada");
        }

        @Test
        @DisplayName("Should throw exception when cancelling non-active rental")
        void shouldThrowExceptionWhenCancellingNonActiveRental() {
            Rental rental = createRental(1, concluidaStatus);

            when(rentalRepository.findById(1)).thenReturn(Optional.of(rental));

            assertThatThrownBy(() -> rentalService.cancel(1))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Apenas alugueis ativos podem ser cancelados");
        }

        @Test
        @DisplayName("Should throw exception when rental not found")
        void shouldThrowExceptionWhenRentalNotFoundForCancel() {
            when(rentalRepository.findById(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> rentalService.cancel(999))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Aluguel não encontrado com id: 999");
        }
    }

    private Rental createRental(Integer id, RentalStatus status) {
        Rental rental = new Rental();
        rental.setId(id);
        rental.setUserId(1);
        rental.setSpaceship(availableSpaceship);
        rental.setStatus(status);
        rental.setPickupPlanet(pickupPlanet);
        rental.setReturnPlanet(returnPlanet);
        rental.setStartDate(LocalDateTime.now());
        rental.setEndDate(LocalDateTime.now().plusDays(3));
        rental.setTotalPrice(new BigDecimal("1500.00"));
        return rental;
    }
}
