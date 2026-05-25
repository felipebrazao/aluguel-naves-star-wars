package com.starwars.starshiprental.integration.controller;

import tools.jackson.databind.ObjectMapper;
import com.starwars.starshiprental.dto.SpaceshipRequestDTO;
import com.starwars.starshiprental.entity.Spaceship;
import com.starwars.starshiprental.entity.SpaceshipStatus;
import com.starwars.starshiprental.repository.SpaceshipRepository;
import com.starwars.starshiprental.repository.SpaceshipStatusRepository;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SpaceshipControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SpaceshipRepository spaceshipRepository;

    @Autowired
    private SpaceshipStatusRepository spaceshipStatusRepository;

    private SpaceshipStatus disponivelStatus;

    @BeforeEach
    void setUp() {
        disponivelStatus = spaceshipStatusRepository.findByName("disponivel")
                .orElseGet(() -> {
                    SpaceshipStatus status = new SpaceshipStatus();
                    status.setName("disponivel");
                    return spaceshipStatusRepository.save(status);
                });
    }

    @Nested
    @DisplayName("POST /spaceships")
    class CreateTests {

        @Test
        @DisplayName("Should create spaceship successfully")
        void shouldCreateSpaceshipSuccessfully() throws Exception {
            SpaceshipRequestDTO requestDTO = new SpaceshipRequestDTO();
            requestDTO.setName("Millennium Falcon");
            requestDTO.setModel("YT-1300");
            requestDTO.setManufacturer("Corellian Engineering");
            requestDTO.setCapacity(6);
            requestDTO.setCostInCredits(100000L);

            mockMvc.perform(post("/spaceships")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(requestDTO)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").exists())
                    .andExpect(jsonPath("$.name").value("Millennium Falcon"))
                    .andExpect(jsonPath("$.model").value("YT-1300"))
                    .andExpect(jsonPath("$.status").value("disponivel"))
                    .andExpect(jsonPath("$.active").value(true));
        }

        @Test
        @DisplayName("Should return bad request when name is blank")
        void shouldReturnBadRequestWhenNameIsBlank() throws Exception {
            SpaceshipRequestDTO requestDTO = new SpaceshipRequestDTO();
            requestDTO.setName("");
            requestDTO.setModel("YT-1300");
            requestDTO.setCapacity(6);
            requestDTO.setCostInCredits(100000L);

            mockMvc.perform(post("/spaceships")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(requestDTO)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return bad request when capacity is negative")
        void shouldReturnBadRequestWhenCapacityIsNegative() throws Exception {
            SpaceshipRequestDTO requestDTO = new SpaceshipRequestDTO();
            requestDTO.setName("Falcon");
            requestDTO.setModel("YT-1300");
            requestDTO.setCapacity(-1);
            requestDTO.setCostInCredits(100000L);

            mockMvc.perform(post("/spaceships")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(requestDTO)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("GET /spaceships")
    class FindAllTests {

        @Test
        @DisplayName("Should return all spaceships")
        void shouldReturnAllSpaceships() throws Exception {
            createSpaceship("Falcon", true);
            createSpaceship("X-Wing", true);

            mockMvc.perform(get("/spaceships"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))));
        }

        @Test
        @DisplayName("Should return only active spaceships when filter is true")
        void shouldReturnOnlyActiveSpaceships() throws Exception {
            createSpaceship("Active Ship", true);
            Spaceship inactive = createSpaceship("Inactive Ship", true);
            inactive.setActive(false);
            spaceshipRepository.save(inactive);

            mockMvc.perform(get("/spaceships").param("active", "true"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$[*].active", everyItem(is(true))));
        }
    }

    @Nested
    @DisplayName("GET /spaceships/{id}")
    class FindByIdTests {

        @Test
        @DisplayName("Should return spaceship by id")
        void shouldReturnSpaceshipById() throws Exception {
            Spaceship spaceship = createSpaceship("Falcon", true);

            mockMvc.perform(get("/spaceships/{id}", spaceship.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(spaceship.getId()))
                    .andExpect(jsonPath("$.name").value("Falcon"));
        }

        @Test
        @DisplayName("Should return 404 when spaceship not found")
        void shouldReturn404WhenSpaceshipNotFound() throws Exception {
            mockMvc.perform(get("/spaceships/{id}", 99999))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.message").value(containsString("Nave não encontrada")));
        }
    }

    @Nested
    @DisplayName("PUT /spaceships/{id}")
    class UpdateTests {

        @Test
        @DisplayName("Should update spaceship successfully")
        void shouldUpdateSpaceshipSuccessfully() throws Exception {
            Spaceship spaceship = createSpaceship("Old Falcon", true);

            SpaceshipRequestDTO requestDTO = new SpaceshipRequestDTO();
            requestDTO.setName("Updated Falcon");
            requestDTO.setModel("YT-1300 Updated");
            requestDTO.setCapacity(8);
            requestDTO.setCostInCredits(150000L);

            mockMvc.perform(put("/spaceships/{id}", spaceship.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(requestDTO)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name").value("Updated Falcon"))
                    .andExpect(jsonPath("$.model").value("YT-1300 Updated"))
                    .andExpect(jsonPath("$.capacity").value(8));
        }

        @Test
        @DisplayName("Should return 404 when updating non-existent spaceship")
        void shouldReturn404WhenUpdatingNonExistent() throws Exception {
            SpaceshipRequestDTO requestDTO = new SpaceshipRequestDTO();
            requestDTO.setName("Falcon");
            requestDTO.setModel("YT-1300");
            requestDTO.setCapacity(6);
            requestDTO.setCostInCredits(100000L);

            mockMvc.perform(put("/spaceships/{id}", 99999)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(requestDTO)))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.message").value(containsString("Nave não encontrada")));
        }
    }

    @Nested
    @DisplayName("PATCH /spaceships/{id}/active")
    class ToggleActiveTests {

        @Test
        @DisplayName("Should toggle spaceship active status")
        void shouldToggleSpaceshipActiveStatus() throws Exception {
            Spaceship spaceship = createSpaceship("Falcon", true);

            mockMvc.perform(patch("/spaceships/{id}/active", spaceship.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(spaceship.getId()))
                    .andExpect(jsonPath("$.active").value(false));

            Spaceship updated = spaceshipRepository.findById(spaceship.getId()).orElseThrow();
            assertThat(updated.getActive()).isFalse();
        }

        @Test
        @DisplayName("Should return 404 when toggling non-existent spaceship")
        void shouldReturn404WhenTogglingNonExistent() throws Exception {
            mockMvc.perform(patch("/spaceships/{id}/active", 99999))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.message").value(containsString("Nave não encontrada")));
        }
    }

    private Spaceship createSpaceship(String name, boolean active) {
        Spaceship spaceship = new Spaceship();
        spaceship.setName(name);
        spaceship.setModel("Model");
        spaceship.setManufacturer("Manufacturer");
        spaceship.setCapacity(4);
        spaceship.setDailyPrice(new BigDecimal("100.00"));
        spaceship.setStatus(disponivelStatus);
        spaceship.setActive(active);
        return spaceshipRepository.save(spaceship);
    }
}
