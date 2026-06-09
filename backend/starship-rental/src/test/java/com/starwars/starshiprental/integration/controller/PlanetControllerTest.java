package com.starwars.starshiprental.integration.controller;

import tools.jackson.databind.ObjectMapper;

import com.starwars.starshiprental.config.TokenAuthInterceptor;
import com.starwars.starshiprental.dto.PlanetRequestDTO;
import com.starwars.starshiprental.entity.Planet;
import com.starwars.starshiprental.repository.PlanetRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@Transactional
class PlanetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PlanetRepository planetRepository;

    @MockitoBean
    private TokenAuthInterceptor authInterceptor;

    @BeforeEach
    void setUp() throws Exception {
        when(authInterceptor.preHandle(any(), any(), any())).thenReturn(true);
    }

    @Nested
    @DisplayName("POST /planets")
    class CreateTests {

        @Test
        @DisplayName("Should create planet successfully")
        void shouldCreatePlanetSuccessfully() throws Exception {
            PlanetRequestDTO requestDTO = new PlanetRequestDTO();
            requestDTO.setName("Tatooine");
            requestDTO.setDiameter(10465);
            requestDTO.setClimate("arid");
            requestDTO.setTerrain("desert");
            requestDTO.setPopulation(200000L);

            mockMvc.perform(post("/planets")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(requestDTO)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").exists())
                    .andExpect(jsonPath("$.name").value("Tatooine"))
                    .andExpect(jsonPath("$.climate").value("arid"))
                    .andExpect(jsonPath("$.active").value(true));
        }

        @Test
        @DisplayName("Should return bad request when name is blank")
        void shouldReturnBadRequestWhenNameIsBlank() throws Exception {
            PlanetRequestDTO requestDTO = new PlanetRequestDTO();
            requestDTO.setName("");
            requestDTO.setClimate("arid");

            mockMvc.perform(post("/planets")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(requestDTO)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("GET /planets")
    class FindAllTests {

        @Test
        @DisplayName("Should return all planets")
        void shouldReturnAllPlanets() throws Exception {
            createPlanet("Tatooine", true);
            createPlanet("Coruscant", true);

            mockMvc.perform(get("/planets"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))));
        }

        @Test
        @DisplayName("Should return only active planets when filter is true")
        void shouldReturnOnlyActivePlanets() throws Exception {
            createPlanet("Active Planet", true);
            Planet inactive = createPlanet("Inactive Planet", true);
            inactive.setActive(false);
            planetRepository.save(inactive);

            mockMvc.perform(get("/planets").param("active", "true"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$[*].active", everyItem(is(true))));
        }
    }

    @Nested
    @DisplayName("GET /planets/{id}")
    class FindByIdTests {

        @Test
        @DisplayName("Should return planet by id")
        void shouldReturnPlanetById() throws Exception {
            Planet planet = createPlanet("Tatooine", true);

            mockMvc.perform(get("/planets/{id}", planet.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(planet.getId()))
                    .andExpect(jsonPath("$.name").value("Tatooine"));
        }

        @Test
        @DisplayName("Should return 404 when planet not found")
        void shouldReturn404WhenPlanetNotFound() throws Exception {
            mockMvc.perform(get("/planets/{id}", 99999))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.message").value(containsString("Planeta não encontrado")));
        }
    }

    @Nested
    @DisplayName("PUT /planets/{id}")
    class UpdateTests {

        @Test
        @DisplayName("Should update planet successfully")
        void shouldUpdatePlanetSuccessfully() throws Exception {
            Planet planet = createPlanet("Old Tatooine", true);

            PlanetRequestDTO requestDTO = new PlanetRequestDTO();
            requestDTO.setName("Updated Tatooine");
            requestDTO.setDiameter(11000);
            requestDTO.setClimate("hot");

            mockMvc.perform(put("/planets/{id}", planet.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(requestDTO)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name").value("Updated Tatooine"));
        }

        @Test
        @DisplayName("Should return 404 when updating non-existent planet")
        void shouldReturn404WhenUpdatingNonExistent() throws Exception {
            PlanetRequestDTO requestDTO = new PlanetRequestDTO();
            requestDTO.setName("Tatooine");
            requestDTO.setClimate("arid");

            mockMvc.perform(put("/planets/{id}", 99999)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(requestDTO)))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.message").value(containsString("Planeta não encontrado")));
        }
    }

    @Nested
    @DisplayName("PATCH /planets/{id}/active")
    class ToggleActiveTests {

        @Test
        @DisplayName("Should toggle planet active status")
        void shouldTogglePlanetActiveStatus() throws Exception {
            Planet planet = createPlanet("Tatooine", true);

            mockMvc.perform(patch("/planets/{id}/active", planet.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(planet.getId()))
                    .andExpect(jsonPath("$.active").value(false));

            Planet updated = planetRepository.findById(planet.getId()).orElseThrow();
            assertThat(updated.getActive()).isFalse();
        }

        @Test
        @DisplayName("Should return 404 when toggling non-existent planet")
        void shouldReturn404WhenTogglingNonExistent() throws Exception {
            mockMvc.perform(patch("/planets/{id}/active", 99999))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.message").value(containsString("Planeta não encontrado")));
        }
    }

    private Planet createPlanet(String name, boolean active) {
        Planet planet = new Planet();
        planet.setName(name);
        planet.setDiameter(10000);
        planet.setClimate("temperate");
        planet.setTerrain("terrain");
        planet.setPopulation(100000L);
        planet.setActive(active);
        return planetRepository.save(planet);
    }
}
