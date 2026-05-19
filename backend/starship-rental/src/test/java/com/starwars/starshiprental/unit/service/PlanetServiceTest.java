package com.starwars.starshiprental.unit.service;

import com.starwars.starshiprental.dto.PlanetRequestDTO;
import com.starwars.starshiprental.dto.PlanetResponseDTO;
import com.starwars.starshiprental.entity.Planet;
import com.starwars.starshiprental.repository.PlanetRepository;
import com.starwars.starshiprental.service.PlanetService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PlanetServiceTest {

    @Mock
    private PlanetRepository planetRepository;

    @InjectMocks
    private PlanetService planetService;

    private PlanetRequestDTO validRequestDTO;

    @BeforeEach
    void setUp() {
        validRequestDTO = new PlanetRequestDTO();
        validRequestDTO.setName("Tatooine");
        validRequestDTO.setDiameter(10465);
        validRequestDTO.setClimate("arid");
        validRequestDTO.setTerrain("desert");
        validRequestDTO.setPopulation(200000L);
    }

    @Nested
    @DisplayName("create")
    class CreateTests {

        @Test
        @DisplayName("Should create planet successfully")
        void shouldCreatePlanetSuccessfully() {
            Planet savedPlanet = new Planet();
            savedPlanet.setId(1);
            savedPlanet.setName(validRequestDTO.getName());
            savedPlanet.setDiameter(validRequestDTO.getDiameter());
            savedPlanet.setClimate(validRequestDTO.getClimate());
            savedPlanet.setTerrain(validRequestDTO.getTerrain());
            savedPlanet.setPopulation(validRequestDTO.getPopulation());
            savedPlanet.setActive(true);

            when(planetRepository.save(any(Planet.class))).thenReturn(savedPlanet);

            PlanetResponseDTO result = planetService.create(validRequestDTO);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(1);
            assertThat(result.getName()).isEqualTo("Tatooine");
            assertThat(result.getClimate()).isEqualTo("arid");
            verify(planetRepository).save(any(Planet.class));
        }
    }

    @Nested
    @DisplayName("findAll")
    class FindAllTests {

        @Test
        @DisplayName("Should return all planets when no active filter")
        void shouldReturnAllPlanets() {
            Planet planet1 = createPlanet(1, "Tatooine", true);
            Planet planet2 = createPlanet(2, "Coruscant", true);

            when(planetRepository.findAll()).thenReturn(List.of(planet1, planet2));

            List<PlanetResponseDTO> result = planetService.findAll(null);

            assertThat(result).hasSize(2);
            assertThat(result).extracting(PlanetResponseDTO::getName)
                    .containsExactlyInAnyOrder("Tatooine", "Coruscant");
        }

        @Test
        @DisplayName("Should return only active planets when filter is true")
        void shouldReturnOnlyActivePlanets() {
            Planet activePlanet = createPlanet(1, "Tatooine", true);

            when(planetRepository.findAllByActive(true)).thenReturn(List.of(activePlanet));

            List<PlanetResponseDTO> result = planetService.findAll(true);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getActive()).isTrue();
        }
    }

    @Nested
    @DisplayName("findById")
    class FindByIdTests {

        @Test
        @DisplayName("Should return planet when found")
        void shouldReturnPlanetWhenFound() {
            Planet planet = createPlanet(1, "Tatooine", true);

            when(planetRepository.findById(1)).thenReturn(Optional.of(planet));

            PlanetResponseDTO result = planetService.findById(1);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(1);
            assertThat(result.getName()).isEqualTo("Tatooine");
        }

        @Test
        @DisplayName("Should throw exception when planet not found")
        void shouldThrowExceptionWhenPlanetNotFound() {
            when(planetRepository.findById(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> planetService.findById(999))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Planeta não encontrado com id: 999");
        }
    }

    @Nested
    @DisplayName("update")
    class UpdateTests {

        @Test
        @DisplayName("Should update planet successfully")
        void shouldUpdatePlanetSuccessfully() {
            Planet existingPlanet = createPlanet(1, "Old Tatooine", true);

            when(planetRepository.findById(1)).thenReturn(Optional.of(existingPlanet));

            Planet updatedPlanet = createPlanet(1, "Tatooine", true);
            updatedPlanet.setDiameter(10465);
            updatedPlanet.setClimate("arid");

            when(planetRepository.save(any(Planet.class))).thenReturn(updatedPlanet);

            PlanetResponseDTO result = planetService.update(1, validRequestDTO);

            assertThat(result.getName()).isEqualTo("Tatooine");
        }

        @Test
        @DisplayName("Should throw exception when updating non-existent planet")
        void shouldThrowExceptionWhenUpdatingNonExistent() {
            when(planetRepository.findById(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> planetService.update(999, validRequestDTO))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Planeta não encontrado com id: 999");
        }
    }

    @Nested
    @DisplayName("toggleActive")
    class ToggleActiveTests {

        @Test
        @DisplayName("Should deactivate active planet")
        void shouldDeactivateActivePlanet() {
            Planet activePlanet = createPlanet(1, "Tatooine", true);

            when(planetRepository.findById(1)).thenReturn(Optional.of(activePlanet));
            when(planetRepository.save(any(Planet.class))).thenAnswer(invocation -> invocation.getArgument(0));

            Planet result = planetService.toggleActive(1);

            assertThat(result.getActive()).isFalse();
        }

        @Test
        @DisplayName("Should activate inactive planet")
        void shouldActivateInactivePlanet() {
            Planet inactivePlanet = createPlanet(1, "Tatooine", false);

            when(planetRepository.findById(1)).thenReturn(Optional.of(inactivePlanet));
            when(planetRepository.save(any(Planet.class))).thenAnswer(invocation -> invocation.getArgument(0));

            Planet result = planetService.toggleActive(1);

            assertThat(result.getActive()).isTrue();
        }
    }

    private Planet createPlanet(Integer id, String name, Boolean active) {
        Planet planet = new Planet();
        planet.setId(id);
        planet.setName(name);
        planet.setDiameter(10000);
        planet.setClimate("temperate");
        planet.setTerrain("terrain");
        planet.setPopulation(100000L);
        planet.setActive(active);
        return planet;
    }
}
