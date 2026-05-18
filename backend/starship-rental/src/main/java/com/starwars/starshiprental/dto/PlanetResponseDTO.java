package com.starwars.starshiprental.dto;

import com.starwars.starshiprental.entity.Planet;
import lombok.Getter;

@Getter
public class PlanetResponseDTO {

    private final Integer id;
    private final Integer swapiId;
    private final String name;
    private final Integer diameter;
    private final String climate;
    private final String terrain;
    private final Long population;
    private final Boolean active;

    public PlanetResponseDTO(Planet planet) {
        this.id = planet.getId();
        this.swapiId = planet.getSwapiId();
        this.name = planet.getName();
        this.diameter = planet.getDiameter();
        this.climate = planet.getClimate();
        this.terrain = planet.getTerrain();
        this.population = planet.getPopulation();
        this.active = planet.getActive();
    }
}

