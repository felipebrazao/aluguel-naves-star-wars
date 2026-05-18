package com.starwars.starshiprental.repository;

import com.starwars.starshiprental.entity.RentalStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RentalStatusRepository extends JpaRepository<RentalStatus, Integer> {
    Optional<RentalStatus> findByName(String name);
}

