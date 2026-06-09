package com.starwars.starshiprental.integration.controller;

import tools.jackson.databind.ObjectMapper;
import com.starwars.starshiprental.config.TokenAuthInterceptor;
import com.starwars.starshiprental.dto.UserRequestDTO;
import com.starwars.starshiprental.entity.Role;
import com.starwars.starshiprental.entity.User;
import com.starwars.starshiprental.repository.RoleRepository;
import com.starwars.starshiprental.repository.UserRepository;
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

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@Transactional
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    private Role clientRole;
    private Role adminRole;

    @MockitoBean
    private TokenAuthInterceptor authInterceptor;

    @BeforeEach
    void setUp() throws Exception {
        when(authInterceptor.preHandle(any(), any(), any())).thenReturn(true);
        clientRole = getOrCreateRole("CLIENTE");
        adminRole = getOrCreateRole("ADMIN");
    }

    @Nested
    @DisplayName("POST /users")
    class CreateTests {

        @Test
        @DisplayName("Should create user successfully")
        void shouldCreateUserSuccessfully() throws Exception {
            UserRequestDTO requestDTO = new UserRequestDTO();
            requestDTO.setName("Luke Skywalker");
            requestDTO.setEmail("luke@jedi.com");
            requestDTO.setCpf("12345678901");
            requestDTO.setPassword("force123");
            requestDTO.setRoleId(clientRole.getId());

            mockMvc.perform(post("/users")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(requestDTO)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").exists())
                    .andExpect(jsonPath("$.name").value("Luke Skywalker"))
                    .andExpect(jsonPath("$.email").value("luke@jedi.com"))
                    .andExpect(jsonPath("$.role").value("CLIENTE"))
                    .andExpect(jsonPath("$.active").value(true));
        }

        @Test
        @DisplayName("Should return bad request when name is blank")
        void shouldReturnBadRequestWhenNameIsBlank() throws Exception {
            UserRequestDTO requestDTO = new UserRequestDTO();
            requestDTO.setName("");
            requestDTO.setEmail("test@jedi.com");
            requestDTO.setCpf("12345678901");
            requestDTO.setPassword("password");
            requestDTO.setRoleId(clientRole.getId());

            mockMvc.perform(post("/users")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(requestDTO)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return bad request when email is invalid")
        void shouldReturnBadRequestWhenEmailIsInvalid() throws Exception {
            UserRequestDTO requestDTO = new UserRequestDTO();
            requestDTO.setName("Test User");
            requestDTO.setEmail("invalid-email");
            requestDTO.setCpf("12345678901");
            requestDTO.setPassword("password");
            requestDTO.setRoleId(clientRole.getId());

            mockMvc.perform(post("/users")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(requestDTO)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("GET /users")
    class FindAllTests {

        @Test
        @DisplayName("Should return all users")
        void shouldReturnAllUsers() throws Exception {
            createUser("Luke", true);
            createUser("Leia", true);

            mockMvc.perform(get("/users"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))));
        }

        @Test
        @DisplayName("Should return only active users when filter is true")
        void shouldReturnOnlyActiveUsers() throws Exception {
            createUser("Active User", true);
            User inactiveUser = createUser("Inactive User", true);
            inactiveUser.setActive(false);
            userRepository.save(inactiveUser);

            mockMvc.perform(get("/users").param("active", "true"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$[*].active", everyItem(is(true))));
        }
    }

    @Nested
    @DisplayName("GET /users/{id}")
    class FindByIdTests {

        @Test
        @DisplayName("Should return user by id")
        void shouldReturnUserById() throws Exception {
            User user = createUser("Luke", true);

            mockMvc.perform(get("/users/{id}", user.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(user.getId()))
                    .andExpect(jsonPath("$.name").value("Luke"));
        }

        @Test
        @DisplayName("Should return 404 when user not found")
        void shouldReturn404WhenUserNotFound() throws Exception {
            mockMvc.perform(get("/users/{id}", 99999))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.message").value(containsString("Usuário não encontrado")));
        }
    }

    @Nested
    @DisplayName("PUT /users/{id}")
    class UpdateTests {

        @Test
        @DisplayName("Should update user successfully")
        void shouldUpdateUserSuccessfully() throws Exception {
            User user = createUser("Old Luke", true);

            UserRequestDTO requestDTO = new UserRequestDTO();
            requestDTO.setName("Luke Skywalker");
            requestDTO.setEmail("new@jedi.com");
            requestDTO.setCpf("98765432101");
            requestDTO.setPassword("newpassword");
            requestDTO.setRoleId(clientRole.getId());

            mockMvc.perform(put("/users/{id}", user.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(requestDTO)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name").value("Luke Skywalker"));
        }

        @Test
        @DisplayName("Should return 404 when updating non-existent user")
        void shouldReturn404WhenUpdatingNonExistent() throws Exception {
            UserRequestDTO requestDTO = new UserRequestDTO();
            requestDTO.setName("Test");
            requestDTO.setEmail("test@jedi.com");
            requestDTO.setCpf("12345678901");
            requestDTO.setPassword("password");
            requestDTO.setRoleId(clientRole.getId());

            mockMvc.perform(put("/users/{id}", 99999)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(requestDTO)))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.message").value(containsString("Usuário não encontrado")));
        }
    }

    @Nested
    @DisplayName("PATCH /users/{id}/active")
    class ToggleActiveTests {

        @Test
        @DisplayName("Should toggle user active status")
        void shouldToggleUserActiveStatus() throws Exception {
            User user = createUser("Luke", true);

            mockMvc.perform(patch("/users/{id}/active", user.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(user.getId()))
                    .andExpect(jsonPath("$.active").value(false));
        }

        @Test
        @DisplayName("Should return 404 when toggling non-existent user")
        void shouldReturn404WhenTogglingNonExistent() throws Exception {
            mockMvc.perform(patch("/users/{id}/active", 99999))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.message").value(containsString("Usuário não encontrado")));
        }
    }

    private Role getOrCreateRole(String name) {
        return roleRepository.findByName(name)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName(name);
                    return roleRepository.save(role);
                });
    }

    private User createUser(String name, boolean active) {
        User user = new User();
        user.setName(name);
        user.setEmail(name.toLowerCase().replace(" ", "") + "@jedi.com");
        user.setCpf("12345678901");
        user.setPasswordHash("password");
        user.setRole(clientRole);
        user.setActive(active);
        return userRepository.save(user);
    }
}
