package com.starwars.starshiprental.controller;

import com.starwars.starshiprental.dto.PlanetRequestDTO;
import com.starwars.starshiprental.dto.PlanetResponseDTO;
import com.starwars.starshiprental.entity.Planet;
import com.starwars.starshiprental.service.PlanetImportService;
import com.starwars.starshiprental.service.PlanetService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/planets")
public class PlanetController {

    private final PlanetImportService importService;
    private final PlanetService planetService;

    public PlanetController(PlanetImportService importService, PlanetService planetService) {
        this.importService = importService;
        this.planetService = planetService;
    }

    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> importPlanets() {
        int total = importService.importPlanets();
        return ResponseEntity.ok(Map.of(
                "mensagem", "Importação de planetas concluída com sucesso!",
                "totalPlanetas", total
        ));
    }

    @PostMapping
    public ResponseEntity<PlanetResponseDTO> create(@Validated @RequestBody PlanetRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(planetService.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<PlanetResponseDTO>> findAll(
            @RequestParam(required = false) Boolean active) {
        return ResponseEntity.ok(planetService.findAll(active));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlanetResponseDTO> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(planetService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlanetResponseDTO> update(@PathVariable Integer id,
                                                    @Validated @RequestBody PlanetRequestDTO dto) {
        return ResponseEntity.ok(planetService.update(id, dto));
    }

    @PatchMapping("/{id}/active")
    public ResponseEntity<Map<String, Object>> toggleActive(@PathVariable Integer id) {
        Planet planet = planetService.toggleActive(id);
        return ResponseEntity.ok(Map.of(
                "id", planet.getId(),
                "name", planet.getName(),
                "active", planet.getActive()
        ));
    }
}

