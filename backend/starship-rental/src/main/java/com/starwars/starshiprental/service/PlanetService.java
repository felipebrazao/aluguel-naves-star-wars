package com.starwars.starshiprental.service;

import com.starwars.starshiprental.dto.PlanetRequestDTO;
import com.starwars.starshiprental.dto.PlanetResponseDTO;
import com.starwars.starshiprental.entity.Planet;
import com.starwars.starshiprental.repository.PlanetRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlanetService {

    private final PlanetRepository planetRepository;

    public PlanetService(PlanetRepository planetRepository) {
        this.planetRepository = planetRepository;
    }

    public PlanetResponseDTO create(PlanetRequestDTO dto) {
        Planet planet = new Planet();
        planet.setName(dto.getName());
        planet.setDiameter(dto.getDiameter());
        planet.setClimate(dto.getClimate());
        planet.setTerrain(dto.getTerrain());
        planet.setPopulation(dto.getPopulation());
        return new PlanetResponseDTO(planetRepository.save(planet));
    }

    public List<PlanetResponseDTO> findAll(Boolean active) {
        List<Planet> planets = (active != null)
                ? planetRepository.findAllByActive(active)
                : planetRepository.findAll();
        return planets.stream()
                .map(PlanetResponseDTO::new)
                .toList();
    }

    public PlanetResponseDTO findById(Integer id) {
        Planet planet = planetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Planeta não encontrado com id: " + id));
        return new PlanetResponseDTO(planet);
    }

    public PlanetResponseDTO update(Integer id, PlanetRequestDTO dto) {
        Planet planet = planetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Planeta não encontrado com id: " + id));
        planet.setName(dto.getName());
        planet.setDiameter(dto.getDiameter());
        planet.setClimate(dto.getClimate());
        planet.setTerrain(dto.getTerrain());
        planet.setPopulation(dto.getPopulation());
        return new PlanetResponseDTO(planetRepository.save(planet));
    }

    public Planet toggleActive(Integer id) {
        Planet planet = planetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Planeta não encontrado com id: " + id));
        planet.setActive(!planet.getActive());
        return planetRepository.save(planet);
    }
}

