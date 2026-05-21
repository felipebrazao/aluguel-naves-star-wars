package com.starwars.starshiprental.dto;

import com.starwars.starshiprental.entity.User;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class UserResponseDTO {

    private final Integer id;
    private final Integer swapiId;
    private final String name;
    private final String email;
    private final String cpf;
    private final String role;
    private final Boolean active;
    private final LocalDateTime createdAt;

    public UserResponseDTO(User user) {
        this.id = user.getId();
        this.swapiId = user.getSwapiId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.cpf = user.getCpf();
        this.role = user.getRole().getName();
        this.active = user.getActive();
        this.createdAt = user.getCreatedAt();
    }
}
