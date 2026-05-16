package com.starwars.starshiprental.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SwapiStarshipDTO {

    private String url;
    private String name;
    private String model;
    private String manufacturer;
    private String passengers;

    @JsonProperty("cost_in_credits")
    private String costInCredits;
}

