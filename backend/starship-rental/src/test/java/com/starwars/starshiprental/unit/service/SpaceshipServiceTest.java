package com.starwars.starshiprental.unit.service;

import com.starwars.starshiprental.dto.SpaceshipRequestDTO;
import com.starwars.starshiprental.dto.SpaceshipResponseDTO;
import com.starwars.starshiprental.entity.Spaceship;
import com.starwars.starshiprental.entity.SpaceshipStatus;
import com.starwars.starshiprental.repository.SpaceshipRepository;
import com.starwars.starshiprental.repository.SpaceshipStatusRepository;
import com.starwars.starshiprental.service.SpaceshipService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SpaceshipServiceTest {

    @Mock
    private SpaceshipRepository spaceshipRepository;

    @Mock
    private SpaceshipStatusRepository statusRepository;

    @InjectMocks
    private SpaceshipService spaceshipService;

    private SpaceshipStatus disponivelStatus;
    private SpaceshipRequestDTO validRequestDTO;

    @BeforeEach
    void setUp() {
        disponivelStatus = new SpaceshipStatus();
        disponivelStatus.setId(1);
        disponivelStatus.setName("disponivel");

        validRequestDTO = new SpaceshipRequestDTO();
        validRequestDTO.setName("Millennium Falcon");
        validRequestDTO.setModel("YT-1300");
        validRequestDTO.setManufacturer("Corellian Engineering");
        validRequestDTO.setCapacity(6);
        validRequestDTO.setCostInCredits(100000L);
    }

    @Nested
    @DisplayName("calculateDailyPrice")
    class CalculateDailyPriceTests {

        @ParameterizedTest
        @CsvSource({
                "0, 100.00",
                "-100, 100.00",
                "100000, 100.00",
                "1000000, 1000.00",
                "100000000, 50000.00",
                "500000000, 50000.00"
        })
        @DisplayName("Should calculate daily price correctly for various costs")
        void shouldCalculateDailyPrice(Long costInCredits, String expectedPrice) {
            BigDecimal result = spaceshipService.calculateDailyPrice(costInCredits);
            assertThat(result).isEqualByComparingTo(new BigDecimal(expectedPrice));
        }

        @ParameterizedTest
        @NullSource
        @DisplayName("Should return minimum price when cost is null")
        void shouldReturnMinimumPriceWhenCostIsNull(Long costInCredits) {
            BigDecimal result = spaceshipService.calculateDailyPrice(costInCredits);
            assertThat(result).isEqualByComparingTo(new BigDecimal("100.00"));
        }

        @Test
        @DisplayName("Should apply floor of 100.00")
        void shouldApplyFloor() {
            BigDecimal result = spaceshipService.calculateDailyPrice(1000L);
            assertThat(result).isEqualByComparingTo(new BigDecimal("100.00"));
        }

        @Test
        @DisplayName("Should apply ceiling of 50000.00")
        void shouldApplyCeiling() {
            BigDecimal result = spaceshipService.calculateDailyPrice(100000000L);
            assertThat(result).isEqualByComparingTo(new BigDecimal("50000.00"));
        }
    }

    @Nested
    @DisplayName("create")
    class CreateTests {

        @Test
        @DisplayName("Should create spaceship successfully")
        void shouldCreateSpaceshipSuccessfully() {
            when(statusRepository.findByName("disponivel")).thenReturn(Optional.of(disponivelStatus));

            Spaceship savedSpaceship = new Spaceship();
            savedSpaceship.setId(1);
            savedSpaceship.setName(validRequestDTO.getName());
            savedSpaceship.setModel(validRequestDTO.getModel());
            savedSpaceship.setManufacturer(validRequestDTO.getManufacturer());
            savedSpaceship.setCapacity(validRequestDTO.getCapacity());
            savedSpaceship.setCostInCredits(validRequestDTO.getCostInCredits());
            savedSpaceship.setDailyPrice(new BigDecimal("100.00"));
            savedSpaceship.setStatus(disponivelStatus);
            savedSpaceship.setActive(true);

            when(spaceshipRepository.save(any(Spaceship.class))).thenReturn(savedSpaceship);

            SpaceshipResponseDTO result = spaceshipService.create(validRequestDTO);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(1);
            assertThat(result.getName()).isEqualTo(validRequestDTO.getName());
            assertThat(result.getModel()).isEqualTo(validRequestDTO.getModel());
            assertThat(result.getStatus()).isEqualTo("disponivel");
            verify(spaceshipRepository).save(any(Spaceship.class));
        }

        @Test
        @DisplayName("Should throw exception when disponivel status not found")
        void shouldThrowExceptionWhenStatusNotFound() {
            when(statusRepository.findByName("disponivel")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> spaceshipService.create(validRequestDTO))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Status 'disponivel' não encontrado");

            verify(spaceshipRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("findAll")
    class FindAllTests {

        @Test
        @DisplayName("Should return all spaceships when no active filter")
        void shouldReturnAllSpaceships() {
            Spaceship spaceship1 = createSpaceship(1, "Falcon", true);
            Spaceship spaceship2 = createSpaceship(2, "X-Wing", false);

            when(spaceshipRepository.findAll()).thenReturn(List.of(spaceship1, spaceship2));

            List<SpaceshipResponseDTO> result = spaceshipService.findAll(null);

            assertThat(result).hasSize(2);
            assertThat(result).extracting(SpaceshipResponseDTO::getName)
                    .containsExactlyInAnyOrder("Falcon", "X-Wing");
        }

        @Test
        @DisplayName("Should return only active spaceships when filter is true")
        void shouldReturnOnlyActiveSpaceships() {
            Spaceship activeSpaceship = createSpaceship(1, "Falcon", true);

            when(spaceshipRepository.findAllByActive(true)).thenReturn(List.of(activeSpaceship));

            List<SpaceshipResponseDTO> result = spaceshipService.findAll(true);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getActive()).isTrue();
        }

        @Test
        @DisplayName("Should return only inactive spaceships when filter is false")
        void shouldReturnOnlyInactiveSpaceships() {
            Spaceship inactiveSpaceship = createSpaceship(1, "Falcon", false);

            when(spaceshipRepository.findAllByActive(false)).thenReturn(List.of(inactiveSpaceship));

            List<SpaceshipResponseDTO> result = spaceshipService.findAll(false);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getActive()).isFalse();
        }
    }

    @Nested
    @DisplayName("findById")
    class FindByIdTests {

        @Test
        @DisplayName("Should return spaceship when found")
        void shouldReturnSpaceshipWhenFound() {
            Spaceship spaceship = createSpaceship(1, "Falcon", true);

            when(spaceshipRepository.findById(1)).thenReturn(Optional.of(spaceship));

            SpaceshipResponseDTO result = spaceshipService.findById(1);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(1);
            assertThat(result.getName()).isEqualTo("Falcon");
        }

        @Test
        @DisplayName("Should throw exception when spaceship not found")
        void shouldThrowExceptionWhenNotFound() {
            when(spaceshipRepository.findById(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> spaceshipService.findById(999))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Nave não encontrada com id: 999");
        }
    }

    @Nested
    @DisplayName("update")
    class UpdateTests {

        @Test
        @DisplayName("Should update spaceship successfully")
        void shouldUpdateSpaceshipSuccessfully() {
            Spaceship existingSpaceship = createSpaceship(1, "Old Falcon", true);
            existingSpaceship.setCostInCredits(50000L);

            when(spaceshipRepository.findById(1)).thenReturn(Optional.of(existingSpaceship));

            Spaceship updatedSpaceship = createSpaceship(1, "Millennium Falcon", true);
            updatedSpaceship.setModel("YT-1300");
            updatedSpaceship.setManufacturer("Corellian");
            updatedSpaceship.setCapacity(6);
            updatedSpaceship.setCostInCredits(100000L);
            updatedSpaceship.setDailyPrice(new BigDecimal("100.00"));

            when(spaceshipRepository.save(any(Spaceship.class))).thenReturn(updatedSpaceship);

            SpaceshipResponseDTO result = spaceshipService.update(1, validRequestDTO);

            assertThat(result.getName()).isEqualTo("Millennium Falcon");
            assertThat(result.getModel()).isEqualTo("YT-1300");
        }

        @Test
        @DisplayName("Should throw exception when updating non-existent spaceship")
        void shouldThrowExceptionWhenUpdatingNonExistent() {
            when(spaceshipRepository.findById(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> spaceshipService.update(999, validRequestDTO))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Nave não encontrada com id: 999");
        }
    }

    @Nested
    @DisplayName("toggleActive")
    class ToggleActiveTests {

        @Test
        @DisplayName("Should deactivate active spaceship")
        void shouldDeactivateActiveSpaceship() {
            Spaceship activeSpaceship = createSpaceship(1, "Falcon", true);

            when(spaceshipRepository.findById(1)).thenReturn(Optional.of(activeSpaceship));
            when(spaceshipRepository.save(any(Spaceship.class))).thenAnswer(invocation -> invocation.getArgument(0));

            Spaceship result = spaceshipService.toggleActive(1);

            assertThat(result.getActive()).isFalse();
        }

        @Test
        @DisplayName("Should activate inactive spaceship")
        void shouldActivateInactiveSpaceship() {
            Spaceship inactiveSpaceship = createSpaceship(1, "Falcon", false);

            when(spaceshipRepository.findById(1)).thenReturn(Optional.of(inactiveSpaceship));
            when(spaceshipRepository.save(any(Spaceship.class))).thenAnswer(invocation -> invocation.getArgument(0));

            Spaceship result = spaceshipService.toggleActive(1);

            assertThat(result.getActive()).isTrue();
        }

        @Test
        @DisplayName("Should throw exception when toggling non-existent spaceship")
        void shouldThrowExceptionWhenTogglingNonExistent() {
            when(spaceshipRepository.findById(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> spaceshipService.toggleActive(999))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Nave não encontrada com id: 999");
        }
    }

    private Spaceship createSpaceship(Integer id, String name, Boolean active) {
        Spaceship spaceship = new Spaceship();
        spaceship.setId(id);
        spaceship.setName(name);
        spaceship.setModel("Model");
        spaceship.setManufacturer("Manufacturer");
        spaceship.setCapacity(4);
        spaceship.setDailyPrice(new BigDecimal("100.00"));
        spaceship.setActive(active);
        spaceship.setStatus(disponivelStatus);
        return spaceship;
    }
}
