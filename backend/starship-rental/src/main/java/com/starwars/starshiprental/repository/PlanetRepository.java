package com.starwars.starshiprental.repository;

import com.starwars.starshiprental.entity.Planet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PlanetRepository extends JpaRepository<Planet, Integer> {
    Optional<Planet> findBySwapiId(Integer swapiId);
    List<Planet> findAllByActive(Boolean active);
}

