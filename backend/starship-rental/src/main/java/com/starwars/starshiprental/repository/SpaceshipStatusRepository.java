package com.starwars.starshiprental.repository;

import com.starwars.starshiprental.entity.SpaceshipStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SpaceshipStatusRepository extends JpaRepository<SpaceshipStatus, Integer> {
    Optional<SpaceshipStatus> findByName(String name);
}

