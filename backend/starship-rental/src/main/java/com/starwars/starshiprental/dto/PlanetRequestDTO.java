package com.starwars.starshiprental.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PlanetRequestDTO {

    @NotBlank(message = "Nome é obrigatório")
    private String name;

    private Integer diameter;

    private String climate;

    private String terrain;

    private Long population;
}

