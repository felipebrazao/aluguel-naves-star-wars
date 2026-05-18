package com.starwars.starshiprental.client;

import com.starwars.starshiprental.dto.SwapiPersonDTO;
import com.starwars.starshiprental.dto.SwapiPlanetDTO;
import com.starwars.starshiprental.dto.SwapiStarshipDTO;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Component
public class SwapiClient {

    private static final String STARSHIPS_URL = "https://swapi.info/api/starships/";
    private static final String PLANETS_URL = "https://swapi.info/api/planets/";
    private static final String PEOPLE_URL = "https://swapi.info/api/people/";

    private final RestTemplate restTemplate;

    public SwapiClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public List<SwapiStarshipDTO> fetchAllStarships() {
        return restTemplate.exchange(
                STARSHIPS_URL,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<SwapiStarshipDTO>>() {}
        ).getBody();
    }

    public List<SwapiPlanetDTO> fetchAllPlanets() {
        return restTemplate.exchange(
                PLANETS_URL,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<SwapiPlanetDTO>>() {}
        ).getBody();
    }

    public List<SwapiPersonDTO> fetchAllPeople() {
        return restTemplate.exchange(
                PEOPLE_URL,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<SwapiPersonDTO>>() {}
        ).getBody();
    }
}
