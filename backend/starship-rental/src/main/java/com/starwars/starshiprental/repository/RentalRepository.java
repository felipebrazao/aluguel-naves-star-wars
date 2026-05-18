package com.starwars.starshiprental.repository;

import com.starwars.starshiprental.entity.Rental;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RentalRepository extends JpaRepository<Rental, Integer> {
    List<Rental> findAllByUserId(Integer userId);
    List<Rental> findAllBySpaceshipId(Integer spaceshipId);
    List<Rental> findAllByStatusName(String statusName);
}

