package com.starwars.starshiprental.unit.service;

import com.starwars.starshiprental.client.SwapiClient;
import com.starwars.starshiprental.dto.SwapiPlanetDTO;
import com.starwars.starshiprental.entity.Planet;
import com.starwars.starshiprental.repository.PlanetRepository;
import com.starwars.starshiprental.service.PlanetImportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PlanetImportServiceTest {

    @Mock
    private SwapiClient swapiClient;

    @Mock
    private PlanetRepository planetRepository;

    @InjectMocks
    private PlanetImportService planetImportService;

    private SwapiPlanetDTO tatooineDTO;
    private SwapiPlanetDTO coruscantDTO;

    @BeforeEach
    void setUp() {
        tatooineDTO = new SwapiPlanetDTO();
        tatooineDTO.setUrl("https://swapi.info/api/planets/1/");
        tatooineDTO.setName("Tatooine");
        tatooineDTO.setDiameter("10465");
        tatooineDTO.setClimate("arid");
        tatooineDTO.setTerrain("desert");
        tatooineDTO.setPopulation("200000");

        coruscantDTO = new SwapiPlanetDTO();
        coruscantDTO.setUrl("https://swapi.info/api/planets/9/");
        coruscantDTO.setName("Coruscant");
        coruscantDTO.setDiameter("12240");
        coruscantDTO.setClimate("temperate");
        coruscantDTO.setTerrain("cityscape, mountains");
        coruscantDTO.setPopulation("1000000000000");
    }

    @Nested
    @DisplayName("importPlanets")
    class ImportPlanetsTests {

        @Test
        @DisplayName("Should import all planets successfully")
        void shouldImportAllPlanetsSuccessfully() {
            when(swapiClient.fetchAllPlanets()).thenReturn(List.of(tatooineDTO, coruscantDTO));
            when(planetRepository.findBySwapiId(1)).thenReturn(Optional.empty());
            when(planetRepository.findBySwapiId(9)).thenReturn(Optional.empty());

            int result = planetImportService.importPlanets();

            assertThat(result).isEqualTo(2);
            verify(planetRepository, times(2)).save(any(Planet.class));
        }

        @Test
        @DisplayName("Should update existing planet when swapiId already exists")
        void shouldUpdateExistingPlanet() {
            Planet existingTatooine = new Planet();
            existingTatooine.setId(1);
            existingTatooine.setSwapiId(1);
            existingTatooine.setName("Old Tatooine Name");

            when(swapiClient.fetchAllPlanets()).thenReturn(List.of(tatooineDTO));
            when(planetRepository.findBySwapiId(1)).thenReturn(Optional.of(existingTatooine));

            int result = planetImportService.importPlanets();

            assertThat(result).isEqualTo(1);

            ArgumentCaptor<Planet> planetCaptor = ArgumentCaptor.forClass(Planet.class);
            verify(planetRepository).save(planetCaptor.capture());

            Planet saved = planetCaptor.getValue();
            assertThat(saved.getName()).isEqualTo("Tatooine");
            assertThat(saved.getSwapiId()).isEqualTo(1);
            assertThat(saved.getId()).isEqualTo(1);
        }

        @Test
        @DisplayName("Should handle empty planets list from API")
        void shouldHandleEmptyPlanetsList() {
            when(swapiClient.fetchAllPlanets()).thenReturn(List.of());

            int result = planetImportService.importPlanets();

            assertThat(result).isZero();
            verify(planetRepository, never()).save(any(Planet.class));
        }

        @Test
        @DisplayName("Should correctly map all planet fields")
        void shouldCorrectlyMapAllPlanetFields() {
            when(swapiClient.fetchAllPlanets()).thenReturn(List.of(tatooineDTO));
            when(planetRepository.findBySwapiId(1)).thenReturn(Optional.empty());

            planetImportService.importPlanets();

            ArgumentCaptor<Planet> planetCaptor = ArgumentCaptor.forClass(Planet.class);
            verify(planetRepository).save(planetCaptor.capture());

            Planet saved = planetCaptor.getValue();
            assertThat(saved.getSwapiId()).isEqualTo(1);
            assertThat(saved.getName()).isEqualTo("Tatooine");
            assertThat(saved.getDiameter()).isEqualTo(10465);
            assertThat(saved.getClimate()).isEqualTo("arid");
            assertThat(saved.getTerrain()).isEqualTo("desert");
            assertThat(saved.getPopulation()).isEqualTo(200000L);
        }
    }

    @Nested
    @DisplayName("saveOrUpdate - parsing")
    class ParsingTests {

        @Test
        @DisplayName("Should parse diameter with comma correctly")
        void shouldParseDiameterWithComma() {
            tatooineDTO.setDiameter("10,465");

            when(swapiClient.fetchAllPlanets()).thenReturn(List.of(tatooineDTO));
            when(planetRepository.findBySwapiId(1)).thenReturn(Optional.empty());

            planetImportService.importPlanets();

            ArgumentCaptor<Planet> captor = ArgumentCaptor.forClass(Planet.class);
            verify(planetRepository).save(captor.capture());
            assertThat(captor.getValue().getDiameter()).isEqualTo(10465);
        }

        @Test
        @DisplayName("Should set diameter as null when value is unknown")
        void shouldSetDiameterNullWhenUnknown() {
            tatooineDTO.setDiameter("unknown");

            when(swapiClient.fetchAllPlanets()).thenReturn(List.of(tatooineDTO));
            when(planetRepository.findBySwapiId(1)).thenReturn(Optional.empty());

            planetImportService.importPlanets();

            ArgumentCaptor<Planet> captor = ArgumentCaptor.forClass(Planet.class);
            verify(planetRepository).save(captor.capture());
            assertThat(captor.getValue().getDiameter()).isNull();
        }

        @Test
        @DisplayName("Should set population as null when value is unknown")
        void shouldSetPopulationNullWhenUnknown() {
            tatooineDTO.setPopulation("unknown");

            when(swapiClient.fetchAllPlanets()).thenReturn(List.of(tatooineDTO));
            when(planetRepository.findBySwapiId(1)).thenReturn(Optional.empty());

            planetImportService.importPlanets();

            ArgumentCaptor<Planet> captor = ArgumentCaptor.forClass(Planet.class);
            verify(planetRepository).save(captor.capture());
            assertThat(captor.getValue().getPopulation()).isNull();
        }

        @Test
        @DisplayName("Should parse population with comma correctly")
        void shouldParsePopulationWithComma() {
            tatooineDTO.setPopulation("200,000");

            when(swapiClient.fetchAllPlanets()).thenReturn(List.of(tatooineDTO));
            when(planetRepository.findBySwapiId(1)).thenReturn(Optional.empty());

            planetImportService.importPlanets();

            ArgumentCaptor<Planet> captor = ArgumentCaptor.forClass(Planet.class);
            verify(planetRepository).save(captor.capture());
            assertThat(captor.getValue().getPopulation()).isEqualTo(200000L);
        }
    }
}

