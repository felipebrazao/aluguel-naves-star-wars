package com.starwars.starshiprental.unit.service;

import com.starwars.starshiprental.client.SwapiClient;
import com.starwars.starshiprental.dto.SwapiStarshipDTO;
import com.starwars.starshiprental.entity.Spaceship;
import com.starwars.starshiprental.entity.SpaceshipStatus;
import com.starwars.starshiprental.repository.SpaceshipRepository;
import com.starwars.starshiprental.repository.SpaceshipStatusRepository;
import com.starwars.starshiprental.service.SpaceshipImportService;
import com.starwars.starshiprental.service.SpaceshipService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
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
class SpaceshipImportServiceTest {

    @Mock
    private SwapiClient swapiClient;

    @Mock
    private SpaceshipRepository spaceshipRepository;

    @Mock
    private SpaceshipStatusRepository statusRepository;

    @Mock
    private SpaceshipService spaceshipService;

    @InjectMocks
    private SpaceshipImportService spaceshipImportService;

    private SpaceshipStatus disponivelStatus;
    private SwapiStarshipDTO falconDTO;
    private SwapiStarshipDTO xWingDTO;

    @BeforeEach
    void setUp() {
        disponivelStatus = new SpaceshipStatus();
        disponivelStatus.setId(1);
        disponivelStatus.setName("disponivel");

        falconDTO = new SwapiStarshipDTO();
        falconDTO.setUrl("https://swapi.info/api/starships/10/");
        falconDTO.setName("Millennium Falcon");
        falconDTO.setModel("YT-1300 light freighter");
        falconDTO.setManufacturer("Corellian Engineering Corporation");
        falconDTO.setPassengers("6");
        falconDTO.setCostInCredits("100000");

        xWingDTO = new SwapiStarshipDTO();
        xWingDTO.setUrl("https://swapi.info/api/starships/12/");
        xWingDTO.setName("X-wing");
        xWingDTO.setModel("T-65 X-wing");
        xWingDTO.setManufacturer("Incom Corporation");
        xWingDTO.setPassengers("0");
        xWingDTO.setCostInCredits("149999");
    }

    @Nested
    @DisplayName("importSpaceships")
    class ImportSpaceshipsTests {

        @Test
        @DisplayName("Should import all starships successfully")
        void shouldImportAllStarshipsSuccessfully() {
            when(statusRepository.findByName("disponivel")).thenReturn(Optional.of(disponivelStatus));
            when(swapiClient.fetchAllStarships()).thenReturn(List.of(falconDTO, xWingDTO));

            when(spaceshipRepository.findBySwapiId(10)).thenReturn(Optional.empty());
            when(spaceshipRepository.findBySwapiId(12)).thenReturn(Optional.empty());

            when(spaceshipService.calculateDailyPrice(100000L)).thenReturn(new BigDecimal("100.00"));
            when(spaceshipService.calculateDailyPrice(149999L)).thenReturn(new BigDecimal("149.99"));

            int result = spaceshipImportService.importSpaceships();

            assertThat(result).isEqualTo(2);
            verify(spaceshipRepository, times(2)).save(any(Spaceship.class));
        }

        @Test
        @DisplayName("Should update existing spaceship when swapiId already exists")
        void shouldUpdateExistingSpaceship() {
            Spaceship existingFalcon = new Spaceship();
            existingFalcon.setId(1);
            existingFalcon.setSwapiId(10);
            existingFalcon.setName("Old Falcon Name");

            when(statusRepository.findByName("disponivel")).thenReturn(Optional.of(disponivelStatus));
            when(swapiClient.fetchAllStarships()).thenReturn(List.of(falconDTO));
            when(spaceshipRepository.findBySwapiId(10)).thenReturn(Optional.of(existingFalcon));
            when(spaceshipService.calculateDailyPrice(100000L)).thenReturn(new BigDecimal("100.00"));

            int result = spaceshipImportService.importSpaceships();

            assertThat(result).isEqualTo(1);

            ArgumentCaptor<Spaceship> spaceshipCaptor = ArgumentCaptor.forClass(Spaceship.class);
            verify(spaceshipRepository).save(spaceshipCaptor.capture());

            Spaceship savedSpaceship = spaceshipCaptor.getValue();
            assertThat(savedSpaceship.getName()).isEqualTo("Millennium Falcon");
            assertThat(savedSpaceship.getSwapiId()).isEqualTo(10);
        }

        @Test
        @DisplayName("Should throw exception when disponivel status not found")
        void shouldThrowExceptionWhenStatusNotFound() {
            when(statusRepository.findByName("disponivel")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> spaceshipImportService.importSpaceships())
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Status 'disponivel' não encontrado");

            verify(swapiClient, never()).fetchAllStarships();
        }

        @Test
        @DisplayName("Should handle starship with unknown cost")
        void shouldHandleUnknownCost() {
            SwapiStarshipDTO unknownCostDTO = new SwapiStarshipDTO();
            unknownCostDTO.setUrl("https://swapi.info/api/starships/15/");
            unknownCostDTO.setName("Unknown Ship");
            unknownCostDTO.setModel("Unknown");
            unknownCostDTO.setManufacturer("Unknown");
            unknownCostDTO.setPassengers("10");
            unknownCostDTO.setCostInCredits("unknown");

            when(statusRepository.findByName("disponivel")).thenReturn(Optional.of(disponivelStatus));
            when(swapiClient.fetchAllStarships()).thenReturn(List.of(unknownCostDTO));
            when(spaceshipRepository.findBySwapiId(15)).thenReturn(Optional.empty());
            when(spaceshipService.calculateDailyPrice(null)).thenReturn(new BigDecimal("100.00"));

            int result = spaceshipImportService.importSpaceships();

            assertThat(result).isEqualTo(1);
        }

        @Test
        @DisplayName("Should handle starship with formatted cost containing commas")
        void shouldHandleFormattedCost() {
            SwapiStarshipDTO formattedCostDTO = new SwapiStarshipDTO();
            formattedCostDTO.setUrl("https://swapi.info/api/starships/20/");
            formattedCostDTO.setName("Expensive Ship");
            formattedCostDTO.setModel("Luxury");
            formattedCostDTO.setManufacturer("Luxury Corp");
            formattedCostDTO.setPassengers("1,000");
            formattedCostDTO.setCostInCredits("1,000,000");

            when(statusRepository.findByName("disponivel")).thenReturn(Optional.of(disponivelStatus));
            when(swapiClient.fetchAllStarships()).thenReturn(List.of(formattedCostDTO));
            when(spaceshipRepository.findBySwapiId(20)).thenReturn(Optional.empty());
            when(spaceshipService.calculateDailyPrice(1000000L)).thenReturn(new BigDecimal("1000.00"));

            int result = spaceshipImportService.importSpaceships();

            assertThat(result).isEqualTo(1);

            ArgumentCaptor<Spaceship> spaceshipCaptor = ArgumentCaptor.forClass(Spaceship.class);
            verify(spaceshipRepository).save(spaceshipCaptor.capture());

            Spaceship savedSpaceship = spaceshipCaptor.getValue();
            assertThat(savedSpaceship.getCostInCredits()).isEqualTo(1000000L);
            assertThat(savedSpaceship.getCapacity()).isEqualTo(1000);
        }

        @Test
        @DisplayName("Should handle empty starship list from API")
        void shouldHandleEmptyStarshipList() {
            when(statusRepository.findByName("disponivel")).thenReturn(Optional.of(disponivelStatus));
            when(swapiClient.fetchAllStarships()).thenReturn(List.of());

            int result = spaceshipImportService.importSpaceships();

            assertThat(result).isEqualTo(0);
            verify(spaceshipRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should handle passengers with 'n/a' value")
        void shouldHandleNA passengers() {
            SwapiStarshipDTO naPassengersDTO = new SwapiStarshipDTO();
            naPassengersDTO.setUrl("https://swapi.info/api/starships/25/");
            naPassengersDTO.setName("N/A Ship");
            naPassengersDTO.setModel("Test");
            naPassengersDTO.setManufacturer("Test Corp");
            naPassengersDTO.setPassengers("n/a");
            naPassengersDTO.setCostInCredits("50000");

            when(statusRepository.findByName("disponivel")).thenReturn(Optional.of(disponivelStatus));
            when(swapiClient.fetchAllStarships()).thenReturn(List.of(naPassengersDTO));
            when(spaceshipRepository.findBySwapiId(25)).thenReturn(Optional.empty());
            when(spaceshipService.calculateDailyPrice(50000L)).thenReturn(new BigDecimal("100.00"));

            int result = spaceshipImportService.importSpaceships();

            assertThat(result).isEqualTo(1);

            ArgumentCaptor<Spaceship> spaceshipCaptor = ArgumentCaptor.forClass(Spaceship.class);
            verify(spaceshipRepository).save(spaceshipCaptor.capture());

            Spaceship savedSpaceship = spaceshipCaptor.getValue();
            assertThat(savedSpaceship.getCapacity()).isEqualTo(0);
        }
    }
}
