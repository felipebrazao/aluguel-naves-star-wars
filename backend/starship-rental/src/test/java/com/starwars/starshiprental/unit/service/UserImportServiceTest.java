package com.starwars.starshiprental.unit.service;

import com.starwars.starshiprental.client.SwapiClient;
import com.starwars.starshiprental.dto.SwapiPersonDTO;
import com.starwars.starshiprental.entity.Role;
import com.starwars.starshiprental.entity.User;
import com.starwars.starshiprental.repository.RoleRepository;
import com.starwars.starshiprental.repository.UserRepository;
import com.starwars.starshiprental.service.UserImportService;
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
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserImportServiceTest {

    @Mock
    private SwapiClient swapiClient;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @InjectMocks
    private UserImportService userImportService;

    private Role clienteRole;
    private SwapiPersonDTO lukeDTO;
    private SwapiPersonDTO leiaDTO;

    @BeforeEach
    void setUp() {
        clienteRole = new Role();
        clienteRole.setId(1);
        clienteRole.setName("cliente");

        lukeDTO = new SwapiPersonDTO();
        lukeDTO.setUrl("https://swapi.info/api/people/1/");
        lukeDTO.setName("Luke Skywalker");

        leiaDTO = new SwapiPersonDTO();
        leiaDTO.setUrl("https://swapi.info/api/people/5/");
        leiaDTO.setName("Leia Organa");
    }

    @Nested
    @DisplayName("importUsers")
    class ImportUsersTests {

        @Test
        @DisplayName("Should import all users successfully")
        void shouldImportAllUsersSuccessfully() {
            when(roleRepository.findByName("cliente")).thenReturn(Optional.of(clienteRole));
            when(swapiClient.fetchAllPeople()).thenReturn(List.of(lukeDTO, leiaDTO));

            when(userRepository.findBySwapiId(1)).thenReturn(Optional.empty());
            when(userRepository.findBySwapiId(5)).thenReturn(Optional.empty());

            int result = userImportService.importUsers();

            assertThat(result).isEqualTo(2);
            verify(userRepository, times(2)).save(any(User.class));
        }

        @Test
        @DisplayName("Should update existing user when swapiId already exists")
        void shouldUpdateExistingUser() {
            User existingLuke = new User();
            existingLuke.setId(1);
            existingLuke.setSwapiId(1);
            existingLuke.setName("Old Luke Name");

            when(roleRepository.findByName("cliente")).thenReturn(Optional.of(clienteRole));
            when(swapiClient.fetchAllPeople()).thenReturn(List.of(lukeDTO));
            when(userRepository.findBySwapiId(1)).thenReturn(Optional.of(existingLuke));

            int result = userImportService.importUsers();

            assertThat(result).isEqualTo(1);

            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());

            User savedUser = userCaptor.getValue();
            assertThat(savedUser.getName()).isEqualTo("Luke Skywalker");
            assertThat(savedUser.getSwapiId()).isEqualTo(1);
        }

        @Test
        @DisplayName("Should throw exception when cliente role not found")
        void shouldThrowExceptionWhenRoleNotFound() {
            when(roleRepository.findByName("cliente")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userImportService.importUsers())
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Role 'cliente' não encontrada");

            verify(swapiClient, never()).fetchAllPeople();
        }

        @Test
        @DisplayName("Should handle empty people list from API")
        void shouldHandleEmptyPeopleList() {
            when(roleRepository.findByName("cliente")).thenReturn(Optional.of(clienteRole));
            when(swapiClient.fetchAllPeople()).thenReturn(List.of());

            int result = userImportService.importUsers();

            assertThat(result).isEqualTo(0);
            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should generate correct email format")
        void shouldGenerateCorrectEmailFormat() {
            when(roleRepository.findByName("cliente")).thenReturn(Optional.of(clienteRole));
            when(swapiClient.fetchAllPeople()).thenReturn(List.of(lukeDTO));
            when(userRepository.findBySwapiId(1)).thenReturn(Optional.empty());

            userImportService.importUsers();

            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());

            User savedUser = userCaptor.getValue();
            assertThat(savedUser.getEmail()).isEqualTo("swapi_1@placeholder.com");
            assertThat(savedUser.getCpf()).isEqualTo("00000000000");
            assertThat(savedUser.getPasswordHash()).isEqualTo("placeholder");
        }
    }
}
