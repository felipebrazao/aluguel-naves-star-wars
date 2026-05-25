package com.starwars.starshiprental.service;

import com.starwars.starshiprental.dto.UserRequestDTO;
import com.starwars.starshiprental.dto.UserResponseDTO;
import com.starwars.starshiprental.entity.Role;
import com.starwars.starshiprental.entity.User;
import com.starwars.starshiprental.repository.RoleRepository;
import com.starwars.starshiprental.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.CONFLICT;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public UserService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    public UserResponseDTO create(UserRequestDTO dto) {
        Role role = roleRepository.findById(dto.getRoleId())
                .orElseThrow(() -> new IllegalArgumentException("Role não encontrada com id: " + dto.getRoleId()));

        userRepository.findByEmail(dto.getEmail())
                .ifPresent(existingUser -> {
                    throw new ResponseStatusException(CONFLICT, "Já existe usuário cadastrado com esse email");
                });

        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setCpf(dto.getCpf());
        // TODO: substituir por BCryptPasswordEncoder.encode(dto.getPassword()) quando
        // Spring Security for implementado
        user.setPasswordHash(dto.getPassword());
        user.setRole(role);

        return new UserResponseDTO(userRepository.save(user));
    }

    public List<UserResponseDTO> findAll(Boolean active) {
        List<User> users = (active != null)
                ? userRepository.findAllByActive(active)
                : userRepository.findAll();
        return users.stream().map(UserResponseDTO::new).toList();
    }

    public UserResponseDTO findById(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado com id: " + id));
        return new UserResponseDTO(user);
    }

    public UserResponseDTO update(Integer id, UserRequestDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado com id: " + id));

        Role role = roleRepository.findById(dto.getRoleId())
                .orElseThrow(() -> new IllegalArgumentException("Role não encontrada com id: " + dto.getRoleId()));

        userRepository.findByEmail(dto.getEmail())
            .filter(existingUser -> !existingUser.getId().equals(id))
            .ifPresent(existingUser -> {
                throw new ResponseStatusException(CONFLICT, "Já existe usuário cadastrado com esse email");
            });

        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setCpf(dto.getCpf());
        // TODO: substituir por BCryptPasswordEncoder.encode(dto.getPassword()) quando
        // Spring Security for implementado
        user.setPasswordHash(dto.getPassword());
        user.setRole(role);

        return new UserResponseDTO(userRepository.save(user));
    }

    public User toggleActive(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado com id: " + id));
        user.setActive(!user.getActive());
        return userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
