package com.starwars.starshiprental.controller;

import com.starwars.starshiprental.dto.SpaceshipRequestDTO;
import com.starwars.starshiprental.dto.SpaceshipResponseDTO;
import com.starwars.starshiprental.entity.Spaceship;
import com.starwars.starshiprental.service.SpaceshipImportService;
import com.starwars.starshiprental.service.SpaceshipService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/spaceships")
public class SpaceshipController {

    private final SpaceshipImportService importService;
    private final SpaceshipService spaceshipService;

    public SpaceshipController(SpaceshipImportService importService, SpaceshipService spaceshipService) {
        this.importService = importService;
        this.spaceshipService = spaceshipService;
    }

    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> importarNaves() {
        int total = importService.importarNaves();
        return ResponseEntity.ok(Map.of(
                "mensagem", "Importação concluída com sucesso!",
                "totalNaves", total
        ));
    }

    @PostMapping
    public ResponseEntity<SpaceshipResponseDTO> criar(@Validated @RequestBody SpaceshipRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(spaceshipService.criar(dto));
    }

    @GetMapping
    public ResponseEntity<List<SpaceshipResponseDTO>> listar(
            @RequestParam(required = false) Boolean active) {
        return ResponseEntity.ok(spaceshipService.listar(active));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SpaceshipResponseDTO> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(spaceshipService.buscarPorId(id));
    }

    @PatchMapping("/{id}/active")
    public ResponseEntity<Map<String, Object>> toggleActive(@PathVariable Integer id) {
        Spaceship spaceship = spaceshipService.toggleActive(id);
        return ResponseEntity.ok(Map.of(
                "id", spaceship.getId(),
                "name", spaceship.getName(),
                "active", spaceship.getActive()
        ));
    }
}
