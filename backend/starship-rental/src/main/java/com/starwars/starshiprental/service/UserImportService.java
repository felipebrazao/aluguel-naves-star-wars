package com.starwars.starshiprental.service;

import com.starwars.starshiprental.client.SwapiClient;
import com.starwars.starshiprental.dto.SwapiPersonDTO;
import com.starwars.starshiprental.entity.Role;
import com.starwars.starshiprental.entity.User;
import com.starwars.starshiprental.repository.RoleRepository;
import com.starwars.starshiprental.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserImportService {

    private final SwapiClient swapiClient;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public UserImportService(SwapiClient swapiClient,
                             UserRepository userRepository,
                             RoleRepository roleRepository) {
        this.swapiClient = swapiClient;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    public int importUsers() {
        Role clienteRole = roleRepository.findByName("cliente")
                .orElseThrow(() -> new IllegalStateException("Role 'cliente' não encontrada"));

        List<SwapiPersonDTO> people = swapiClient.fetchAllPeople();

        for (SwapiPersonDTO dto : people) {
            saveOrUpdate(dto, clienteRole);
        }

        return people.size();
    }

    private void saveOrUpdate(SwapiPersonDTO dto, Role role) {
        Integer swapiId = extractSwapiId(dto.getUrl());

        User user = userRepository.findBySwapiId(swapiId).orElse(new User());

        user.setSwapiId(swapiId);
        user.setName(dto.getName());
        user.setEmail("swapi_" + swapiId + "@placeholder.com");
        user.setCpf("00000000000");
        // TODO: substituir por BCryptPasswordEncoder.encode("placeholder") quando Spring Security for implementado
        user.setPasswordHash("placeholder");
        user.setRole(role);

        userRepository.save(user);
    }

    private Integer extractSwapiId(String url) {
        String[] parts = url.split("/");
        return Integer.parseInt(parts[parts.length - 1]);
    }
}

