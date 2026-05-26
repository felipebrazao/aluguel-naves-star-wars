package com.starwars.starshiprental.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SpaceshipStatusRequestDTO {

    @NotBlank(message = "Status é obrigatório")
    private String status;
}