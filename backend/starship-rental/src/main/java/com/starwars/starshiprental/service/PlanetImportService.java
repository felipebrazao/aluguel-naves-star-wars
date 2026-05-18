package com.starwars.starshiprental.service;

import com.starwars.starshiprental.client.SwapiClient;
import com.starwars.starshiprental.dto.SwapiPlanetDTO;
import com.starwars.starshiprental.entity.Planet;
import com.starwars.starshiprental.repository.PlanetRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlanetImportService {

    private final SwapiClient swapiClient;
    private final PlanetRepository planetRepository;

    public PlanetImportService(SwapiClient swapiClient, PlanetRepository planetRepository) {
        this.swapiClient = swapiClient;
        this.planetRepository = planetRepository;
    }

    public int importPlanets() {
        List<SwapiPlanetDTO> planets = swapiClient.fetchAllPlanets();

        for (SwapiPlanetDTO dto : planets) {
            saveOrUpdate(dto);
        }

        return planets.size();
    }

    private void saveOrUpdate(SwapiPlanetDTO dto) {
        Integer swapiId = extractSwapiId(dto.getUrl());

        Planet planet = planetRepository.findBySwapiId(swapiId)
                .orElse(new Planet());

        planet.setSwapiId(swapiId);
        planet.setName(dto.getName());
        planet.setDiameter(parseDiameter(dto.getDiameter()));
        planet.setClimate(dto.getClimate());
        planet.setTerrain(dto.getTerrain());
        planet.setPopulation(parsePopulation(dto.getPopulation()));

        planetRepository.save(planet);
    }

    private Integer extractSwapiId(String url) {
        String[] parts = url.split("/");
        return Integer.parseInt(parts[parts.length - 1]);
    }

    private Integer parseDiameter(String diameter) {
        try {
            return Integer.parseInt(diameter.replace(",", "").trim());
        } catch (NumberFormatException | NullPointerException e) {
            return null;
        }
    }

    private Long parsePopulation(String population) {
        try {
            return Long.parseLong(population.replace(",", "").trim());
        } catch (NumberFormatException | NullPointerException e) {
            return null;
        }
    }
}

