package com.starwars.starshiprental.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SpaceshipRequestDTO {

    @NotBlank(message = "Nome é obrigatório")
    private String name;

    @NotBlank(message = "Modelo é obrigatório")
    private String model;

    private String manufacturer;

    @NotNull(message = "Capacidade é obrigatória")
    @Min(value = 0, message = "Capacidade não pode ser negativa")
    private Integer capacity;

    @NotNull(message = "Custo em créditos é obrigatório")
    @Min(value = 0, message = "Custo em créditos não pode ser negativo")
    private Long costInCredits;
}
