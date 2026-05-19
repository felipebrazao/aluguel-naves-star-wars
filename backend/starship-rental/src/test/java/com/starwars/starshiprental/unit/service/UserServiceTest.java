package com.starwars.starshiprental.unit.service;

import com.starwars.starshiprental.dto.UserRequestDTO;
import com.starwars.starshiprental.dto.UserResponseDTO;
import com.starwars.starshiprental.entity.Role;
import com.starwars.starshiprental.entity.User;
import com.starwars.starshiprental.repository.RoleRepository;
import com.starwars.starshiprental.repository.UserRepository;
import com.starwars.starshiprental.service.UserService;
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
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @InjectMocks
    private UserService userService;

    private Role clientRole;
    private Role adminRole;
    private UserRequestDTO validRequestDTO;

    @BeforeEach
    void setUp() {
        clientRole = new Role();
        clientRole.setId(1);
        clientRole.setName("CLIENTE");

        adminRole = new Role();
        adminRole.setId(2);
        adminRole.setName("ADMIN");

        validRequestDTO = new UserRequestDTO();
        validRequestDTO.setName("Luke Skywalker");
        validRequestDTO.setEmail("luke@jedi.com");
        validRequestDTO.setCpf("12345678901");
        validRequestDTO.setPassword("force123");
        validRequestDTO.setRoleId(1);
    }

    @Nested
    @DisplayName("create")
    class CreateTests {

        @Test
        @DisplayName("Should create user successfully")
        void shouldCreateUserSuccessfully() {
            when(roleRepository.findById(1)).thenReturn(Optional.of(clientRole));

            User savedUser = new User();
            savedUser.setId(1);
            savedUser.setName(validRequestDTO.getName());
            savedUser.setEmail(validRequestDTO.getEmail());
            savedUser.setCpf(validRequestDTO.getCpf());
            savedUser.setPasswordHash(validRequestDTO.getPassword());
            savedUser.setRole(clientRole);
            savedUser.setActive(true);

            when(userRepository.save(any(User.class))).thenReturn(savedUser);

            UserResponseDTO result = userService.create(validRequestDTO);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(1);
            assertThat(result.getName()).isEqualTo("Luke Skywalker");
            assertThat(result.getEmail()).isEqualTo("luke@jedi.com");
            assertThat(result.getRole()).isEqualTo("CLIENTE");
        }

        @Test
        @DisplayName("Should create user with admin role")
        void shouldCreateUserWithAdminRole() {
            validRequestDTO.setRoleId(2);

            when(roleRepository.findById(2)).thenReturn(Optional.of(adminRole));

            User savedUser = new User();
            savedUser.setId(1);
            savedUser.setName(validRequestDTO.getName());
            savedUser.setRole(adminRole);
            savedUser.setActive(true);

            when(userRepository.save(any(User.class))).thenReturn(savedUser);

            UserResponseDTO result = userService.create(validRequestDTO);

            assertThat(result.getRole()).isEqualTo("ADMIN");
        }

        @Test
        @DisplayName("Should throw exception when role not found")
        void shouldThrowExceptionWhenRoleNotFound() {
            when(roleRepository.findById(999)).thenReturn(Optional.empty());

            validRequestDTO.setRoleId(999);

            assertThatThrownBy(() -> userService.create(validRequestDTO))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Role não encontrada com id: 999");

            verify(userRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("findAll")
    class FindAllTests {

        @Test
        @DisplayName("Should return all users when no active filter")
        void shouldReturnAllUsers() {
            User user1 = createUser(1, "Luke", true);
            User user2 = createUser(2, "Leia", false);

            when(userRepository.findAll()).thenReturn(List.of(user1, user2));

            List<UserResponseDTO> result = userService.findAll(null);

            assertThat(result).hasSize(2);
            assertThat(result).extracting(UserResponseDTO::getName)
                    .containsExactlyInAnyOrder("Luke", "Leia");
        }

        @Test
        @DisplayName("Should return only active users when filter is true")
        void shouldReturnOnlyActiveUsers() {
            User activeUser = createUser(1, "Luke", true);

            when(userRepository.findAllByActive(true)).thenReturn(List.of(activeUser));

            List<UserResponseDTO> result = userService.findAll(true);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getActive()).isTrue();
        }

        @Test
        @DisplayName("Should return only inactive users when filter is false")
        void shouldReturnOnlyInactiveUsers() {
            User inactiveUser = createUser(1, "Luke", false);

            when(userRepository.findAllByActive(false)).thenReturn(List.of(inactiveUser));

            List<UserResponseDTO> result = userService.findAll(false);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getActive()).isFalse();
        }
    }

    @Nested
    @DisplayName("findById")
    class FindByIdTests {

        @Test
        @DisplayName("Should return user when found")
        void shouldReturnUserWhenFound() {
            User user = createUser(1, "Luke", true);

            when(userRepository.findById(1)).thenReturn(Optional.of(user));

            UserResponseDTO result = userService.findById(1);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(1);
            assertThat(result.getName()).isEqualTo("Luke");
        }

        @Test
        @DisplayName("Should throw exception when user not found")
        void shouldThrowExceptionWhenUserNotFound() {
            when(userRepository.findById(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.findById(999))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Usuário não encontrado com id: 999");
        }
    }

    @Nested
    @DisplayName("update")
    class UpdateTests {

        @Test
        @DisplayName("Should update user successfully")
        void shouldUpdateUserSuccessfully() {
            User existingUser = createUser(1, "Old Luke", true);

            when(userRepository.findById(1)).thenReturn(Optional.of(existingUser));
            when(roleRepository.findById(1)).thenReturn(Optional.of(clientRole));

            User updatedUser = createUser(1, "Luke Skywalker", true);
            updatedUser.setEmail("new@jedi.com");
            updatedUser.setCpf("98765432101");

            when(userRepository.save(any(User.class))).thenReturn(updatedUser);

            UserRequestDTO updateDTO = new UserRequestDTO();
            updateDTO.setName("Luke Skywalker");
            updateDTO.setEmail("new@jedi.com");
            updateDTO.setCpf("98765432101");
            updateDTO.setPassword("newpassword");
            updateDTO.setRoleId(1);

            UserResponseDTO result = userService.update(1, updateDTO);

            assertThat(result.getName()).isEqualTo("Luke Skywalker");
        }

        @Test
        @DisplayName("Should throw exception when updating non-existent user")
        void shouldThrowExceptionWhenUpdatingNonExistent() {
            when(userRepository.findById(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.update(999, validRequestDTO))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Usuário não encontrado com id: 999");
        }

        @Test
        @DisplayName("Should throw exception when role not found during update")
        void shouldThrowExceptionWhenRoleNotFoundDuringUpdate() {
            User existingUser = createUser(1, "Luke", true);

            when(userRepository.findById(1)).thenReturn(Optional.of(existingUser));
            when(roleRepository.findById(999)).thenReturn(Optional.empty());

            validRequestDTO.setRoleId(999);

            assertThatThrownBy(() -> userService.update(1, validRequestDTO))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Role não encontrada com id: 999");
        }
    }

    @Nested
    @DisplayName("toggleActive")
    class ToggleActiveTests {

        @Test
        @DisplayName("Should deactivate active user")
        void shouldDeactivateActiveUser() {
            User activeUser = createUser(1, "Luke", true);

            when(userRepository.findById(1)).thenReturn(Optional.of(activeUser));
            when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

            User result = userService.toggleActive(1);

            assertThat(result.getActive()).isFalse();
        }

        @Test
        @DisplayName("Should activate inactive user")
        void shouldActivateInactiveUser() {
            User inactiveUser = createUser(1, "Luke", false);

            when(userRepository.findById(1)).thenReturn(Optional.of(inactiveUser));
            when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

            User result = userService.toggleActive(1);

            assertThat(result.getActive()).isTrue();
        }

        @Test
        @DisplayName("Should throw exception when toggling non-existent user")
        void shouldThrowExceptionWhenTogglingNonExistent() {
            when(userRepository.findById(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.toggleActive(999))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Usuário não encontrado com id: 999");
        }
    }

    private User createUser(Integer id, String name, Boolean active) {
        User user = new User();
        user.setId(id);
        user.setName(name);
        user.setEmail(name.toLowerCase().replace(" ", "") + "@jedi.com");
        user.setCpf("12345678901");
        user.setPasswordHash("password");
        user.setRole(clientRole);
        user.setActive(active);
        return user;
    }
}
