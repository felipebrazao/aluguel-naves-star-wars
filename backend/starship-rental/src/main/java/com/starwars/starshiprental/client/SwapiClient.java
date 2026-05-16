package com.starwars.starshiprental.client;

import com.starwars.starshiprental.dto.SwapiStarshipDTO;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Component
public class SwapiClient {

    private static final String BASE_URL = "https://swapi.info/api/starships/";

    private final RestTemplate restTemplate;

    public SwapiClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public List<SwapiStarshipDTO> fetchAllStarships() {
        return restTemplate.exchange(
                BASE_URL,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<SwapiStarshipDTO>>() {}
        ).getBody();
    }
}
