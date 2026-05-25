package com.starwars.starshiprental.unit.client;

import com.starwars.starshiprental.client.SwapiClient;
import com.starwars.starshiprental.dto.SwapiPersonDTO;
import com.starwars.starshiprental.dto.SwapiPlanetDTO;
import com.starwars.starshiprental.dto.SwapiStarshipDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SwapiClientTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private SwapiClient swapiClient;

    private SwapiStarshipDTO falconDTO;
    private SwapiPlanetDTO tatooineDTO;
    private SwapiPersonDTO lukeDTO;

    @BeforeEach
    void setUp() {
        falconDTO = new SwapiStarshipDTO();
        falconDTO.setUrl("https://swapi.info/api/starships/10/");
        falconDTO.setName("Millennium Falcon");
        falconDTO.setModel("YT-1300 light freighter");
        falconDTO.setManufacturer("Corellian Engineering Corporation");
        falconDTO.setPassengers("6");
        falconDTO.setCostInCredits("100000");

        tatooineDTO = new SwapiPlanetDTO();
        tatooineDTO.setUrl("https://swapi.info/api/planets/1/");
        tatooineDTO.setName("Tatooine");
        tatooineDTO.setDiameter("10465");
        tatooineDTO.setClimate("arid");
        tatooineDTO.setTerrain("desert");
        tatooineDTO.setPopulation("200000");

        lukeDTO = new SwapiPersonDTO();
        lukeDTO.setUrl("https://swapi.info/api/people/1/");
        lukeDTO.setName("Luke Skywalker");
        lukeDTO.setHeight("172");
        lukeDTO.setMass("77");
        lukeDTO.setHomeworld("https://swapi.info/api/planets/1/");
    }

    @Nested
    @DisplayName("fetchAllStarships")
    class FetchAllStarshipsTests {

        @Test
        @DisplayName("Should fetch all starships successfully")
        @SuppressWarnings("unchecked")
        void shouldFetchAllStarshipsSuccessfully() {
            ResponseEntity<List<SwapiStarshipDTO>> responseEntity = new ResponseEntity<>(
                    List.of(falconDTO),
                    HttpStatus.OK
            );

            when(restTemplate.exchange(
                    eq("https://swapi.info/api/starships/"),
                    eq(HttpMethod.GET),
                    isNull(),
                    any(ParameterizedTypeReference.class)
            )).thenReturn(responseEntity);

            List<SwapiStarshipDTO> result = swapiClient.fetchAllStarships();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getName()).isEqualTo("Millennium Falcon");
            assertThat(result.get(0).getModel()).isEqualTo("YT-1300 light freighter");
        }

        @Test
        @DisplayName("Should handle empty response")
        @SuppressWarnings("unchecked")
        void shouldHandleEmptyResponse() {
            ResponseEntity<List<SwapiStarshipDTO>> responseEntity = new ResponseEntity<>(
                    List.of(),
                    HttpStatus.OK
            );

            when(restTemplate.exchange(
                    eq("https://swapi.info/api/starships/"),
                    eq(HttpMethod.GET),
                    isNull(),
                    any(ParameterizedTypeReference.class)
            )).thenReturn(responseEntity);

            List<SwapiStarshipDTO> result = swapiClient.fetchAllStarships();

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("Should handle null body in response")
        @SuppressWarnings("unchecked")
        void shouldHandleNullBodyInResponse() {
            ResponseEntity<List<SwapiStarshipDTO>> responseEntity = new ResponseEntity<>(
                    (List<SwapiStarshipDTO>) null,
                    HttpStatus.OK
            );

            when(restTemplate.exchange(
                    eq("https://swapi.info/api/starships/"),
                    eq(HttpMethod.GET),
                    isNull(),
                    any(ParameterizedTypeReference.class)
            )).thenReturn(responseEntity);

            List<SwapiStarshipDTO> result = swapiClient.fetchAllStarships();

            assertThat(result).isNull();
        }

        @Test
        @DisplayName("Should throw exception when API call fails")
        @SuppressWarnings("unchecked")
        void shouldThrowExceptionWhenAPICallFails() {
            when(restTemplate.exchange(
                    eq("https://swapi.info/api/starships/"),
                    eq(HttpMethod.GET),
                    isNull(),
                    any(ParameterizedTypeReference.class)
            )).thenThrow(new RestClientException("Connection refused"));

            assertThatThrownBy(() -> swapiClient.fetchAllStarships())
                    .isInstanceOf(RestClientException.class)
                    .hasMessageContaining("Connection refused");
        }
    }

    @Nested
    @DisplayName("fetchAllPlanets")
    class FetchAllPlanetsTests {

        @Test
        @DisplayName("Should fetch all planets successfully")
        @SuppressWarnings("unchecked")
        void shouldFetchAllPlanetsSuccessfully() {
            ResponseEntity<List<SwapiPlanetDTO>> responseEntity = new ResponseEntity<>(
                    List.of(tatooineDTO),
                    HttpStatus.OK
            );

            when(restTemplate.exchange(
                    eq("https://swapi.info/api/planets/"),
                    eq(HttpMethod.GET),
                    isNull(),
                    any(ParameterizedTypeReference.class)
            )).thenReturn(responseEntity);

            List<SwapiPlanetDTO> result = swapiClient.fetchAllPlanets();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getName()).isEqualTo("Tatooine");
            assertThat(result.get(0).getClimate()).isEqualTo("arid");
        }

        @Test
        @DisplayName("Should handle multiple planets")
        @SuppressWarnings("unchecked")
        void shouldHandleMultiplePlanets() {
            SwapiPlanetDTO coruscantDTO = new SwapiPlanetDTO();
            coruscantDTO.setUrl("https://swapi.info/api/planets/9/");
            coruscantDTO.setName("Coruscant");
            coruscantDTO.setClimate("temperate");
            coruscantDTO.setTerrain("cityscape");
            coruscantDTO.setPopulation("1000000000");

            ResponseEntity<List<SwapiPlanetDTO>> responseEntity = new ResponseEntity<>(
                    List.of(tatooineDTO, coruscantDTO),
                    HttpStatus.OK
            );

            when(restTemplate.exchange(
                    eq("https://swapi.info/api/planets/"),
                    eq(HttpMethod.GET),
                    isNull(),
                    any(ParameterizedTypeReference.class)
            )).thenReturn(responseEntity);

            List<SwapiPlanetDTO> result = swapiClient.fetchAllPlanets();

            assertThat(result).hasSize(2);
            assertThat(result).extracting(SwapiPlanetDTO::getName)
                    .containsExactlyInAnyOrder("Tatooine", "Coruscant");
        }
    }

    @Nested
    @DisplayName("fetchAllPeople")
    class FetchAllPeopleTests {

        @Test
        @DisplayName("Should fetch all people successfully")
        @SuppressWarnings("unchecked")
        void shouldFetchAllPeopleSuccessfully() {
            ResponseEntity<List<SwapiPersonDTO>> responseEntity = new ResponseEntity<>(
                    List.of(lukeDTO),
                    HttpStatus.OK
            );

            when(restTemplate.exchange(
                    eq("https://swapi.info/api/people/"),
                    eq(HttpMethod.GET),
                    isNull(),
                    any(ParameterizedTypeReference.class)
            )).thenReturn(responseEntity);

            List<SwapiPersonDTO> result = swapiClient.fetchAllPeople();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getName()).isEqualTo("Luke Skywalker");
            assertThat(result.get(0).getHeight()).isEqualTo("172");
        }

        @Test
        @DisplayName("Should handle empty people list")
        @SuppressWarnings("unchecked")
        void shouldHandleEmptyPeopleList() {
            ResponseEntity<List<SwapiPersonDTO>> responseEntity = new ResponseEntity<>(
                    List.of(),
                    HttpStatus.OK
            );

            when(restTemplate.exchange(
                    eq("https://swapi.info/api/people/"),
                    eq(HttpMethod.GET),
                    isNull(),
                    any(ParameterizedTypeReference.class)
            )).thenReturn(responseEntity);

            List<SwapiPersonDTO> result = swapiClient.fetchAllPeople();

            assertThat(result).isEmpty();
        }
    }
}
