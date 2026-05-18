package com.starwars.starshiprental.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SwapiPlanetDTO {

    private String name;
    private String diameter;
    private String climate;
    private String terrain;
    private String population;
    private String url;
}

