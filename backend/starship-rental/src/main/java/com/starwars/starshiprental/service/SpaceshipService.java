package com.starwars.starshiprental.service;

import com.starwars.starshiprental.dto.SpaceshipRequestDTO;
import com.starwars.starshiprental.dto.SpaceshipResponseDTO;
import com.starwars.starshiprental.entity.Spaceship;
import com.starwars.starshiprental.entity.SpaceshipStatus;
import com.starwars.starshiprental.repository.SpaceshipRepository;
import com.starwars.starshiprental.repository.SpaceshipStatusRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class SpaceshipService {

    private static final BigDecimal PISO = new BigDecimal("100.00");
    private static final BigDecimal TETO = new BigDecimal("50000.00");

    private final SpaceshipRepository spaceshipRepository;
    private final SpaceshipStatusRepository statusRepository;

    public SpaceshipService(SpaceshipRepository spaceshipRepository, SpaceshipStatusRepository statusRepository) {
        this.spaceshipRepository = spaceshipRepository;
        this.statusRepository = statusRepository;
    }

    public SpaceshipResponseDTO criar(SpaceshipRequestDTO dto) {
        SpaceshipStatus status = statusRepository.findByName("disponivel")
                .orElseThrow(() -> new IllegalStateException("Status 'disponivel' não encontrado"));

        Spaceship spaceship = new Spaceship();
        spaceship.setName(dto.getName());
        spaceship.setModel(dto.getModel());
        spaceship.setManufacturer(dto.getManufacturer());
        spaceship.setCapacity(dto.getCapacity());
        spaceship.setCostInCredits(dto.getCostInCredits());
        spaceship.setDailyPrice(calcularDailyPrice(dto.getCostInCredits()));
        spaceship.setStatus(status);

        return new SpaceshipResponseDTO(spaceshipRepository.save(spaceship));
    }

    public BigDecimal calcularDailyPrice(Long costInCredits) {
        if (costInCredits == null || costInCredits <= 0) {
            return PISO;
        }
        BigDecimal base = BigDecimal.valueOf(costInCredits).multiply(new BigDecimal("0.001"));
        return base.min(TETO).max(PISO);
    }

    public List<SpaceshipResponseDTO> listar(Boolean active) {
        List<Spaceship> naves = (active != null)
                ? spaceshipRepository.findAllByActive(active)
                : spaceshipRepository.findAll();

        return naves.stream()
                .map(SpaceshipResponseDTO::new)
                .toList();
    }

    public SpaceshipResponseDTO buscarPorId(Integer id) {
        Spaceship spaceship = spaceshipRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Nave não encontrada com id: " + id));
        return new SpaceshipResponseDTO(spaceship);
    }

    public Spaceship toggleActive(Integer id) {
        Spaceship spaceship = spaceshipRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Nave não encontrada com id: " + id));

        spaceship.setActive(!spaceship.getActive());
        return spaceshipRepository.save(spaceship);
    }
}
