package com.starwars.starshiprental.repository;

import com.starwars.starshiprental.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    List<Payment> findAllByStatusName(String statusName);
    Optional<Payment> findByRentalId(Integer rentalId);
}

