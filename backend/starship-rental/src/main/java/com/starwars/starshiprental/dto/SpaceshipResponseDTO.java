package com.starwars.starshiprental.dto;

import com.starwars.starshiprental.entity.Spaceship;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
public class SpaceshipResponseDTO {

    private final Integer id;
    private final String name;
    private final String model;
    private final String manufacturer;
    private final Long costInCredits;
    private final Integer capacity;
    private final BigDecimal dailyPrice;
    private final String status;
    private final Boolean active;

    public SpaceshipResponseDTO(Spaceship spaceship) {
        this.id = spaceship.getId();
        this.name = spaceship.getName();
        this.model = spaceship.getModel();
        this.manufacturer = spaceship.getManufacturer();
        this.costInCredits = spaceship.getCostInCredits();
        this.capacity = spaceship.getCapacity();
        this.dailyPrice = spaceship.getDailyPrice();
        this.status = spaceship.getStatus().getName();
        this.active = spaceship.getActive();
    }
}



