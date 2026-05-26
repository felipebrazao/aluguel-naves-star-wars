package com.starwars.starshiprental.controller;

import com.starwars.starshiprental.dto.RentalRequestDTO;
import com.starwars.starshiprental.dto.RentalResponseDTO;
import com.starwars.starshiprental.service.RentalService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rentals")
public class RentalController {

    private final RentalService rentalService;

    public RentalController(RentalService rentalService) {
        this.rentalService = rentalService;
    }

    @PostMapping
    public ResponseEntity<RentalResponseDTO> create(@Validated @RequestBody RentalRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rentalService.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<RentalResponseDTO>> findAll() {
        return ResponseEntity.ok(rentalService.findAll());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RentalResponseDTO>> findByUserId(@PathVariable Integer userId) {
        return ResponseEntity.ok(rentalService.findByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RentalResponseDTO> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(rentalService.findById(id));
    }

    @PatchMapping("/{id}/conclude")
    public ResponseEntity<RentalResponseDTO> conclude(@PathVariable Integer id) {
        return ResponseEntity.ok(rentalService.conclude(id));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<RentalResponseDTO> cancel(@PathVariable Integer id) {
        return ResponseEntity.ok(rentalService.cancel(id));
    }
}

