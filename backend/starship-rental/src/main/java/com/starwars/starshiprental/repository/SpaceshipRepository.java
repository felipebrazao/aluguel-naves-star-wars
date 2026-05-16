package com.starwars.starshiprental.repository;

import com.starwars.starshiprental.entity.Spaceship;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SpaceshipRepository extends JpaRepository<Spaceship, Integer> {
    Optional<Spaceship> findBySwapiId(Integer swapiId);
    List<Spaceship> findAllByActive(Boolean active);
}

