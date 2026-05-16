package com.starwars.starshiprental.service;

import com.starwars.starshiprental.client.SwapiClient;
import com.starwars.starshiprental.dto.SwapiStarshipDTO;
import com.starwars.starshiprental.entity.Spaceship;
import com.starwars.starshiprental.entity.SpaceshipStatus;
import com.starwars.starshiprental.repository.SpaceshipRepository;
import com.starwars.starshiprental.repository.SpaceshipStatusRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SpaceshipImportService {

    private static final String DEFAULT_STATUS = "disponivel";

    private final SwapiClient swapiClient;
    private final SpaceshipRepository spaceshipRepository;
    private final SpaceshipStatusRepository statusRepository;
    private final SpaceshipService spaceshipService;

    public SpaceshipImportService(SwapiClient swapiClient,
                                  SpaceshipRepository spaceshipRepository,
                                  SpaceshipStatusRepository statusRepository,
                                  SpaceshipService spaceshipService) {
        this.swapiClient = swapiClient;
        this.spaceshipRepository = spaceshipRepository;
        this.statusRepository = statusRepository;
        this.spaceshipService = spaceshipService;
    }

    public int importarNaves() {
        SpaceshipStatus status = statusRepository.findByName(DEFAULT_STATUS)
                .orElseThrow(() -> new IllegalStateException(
                        "Status '" + DEFAULT_STATUS + "' não encontrado na tabela spaceship_status"));

        List<SwapiStarshipDTO> naves = swapiClient.fetchAllStarships();

        for (SwapiStarshipDTO dto : naves) {
            salvarOuAtualizar(dto, status);
        }

        return naves.size();
    }

    private void salvarOuAtualizar(SwapiStarshipDTO dto, SpaceshipStatus status) {
        Integer swapiId = extrairSwapiId(dto.getUrl());

        Spaceship spaceship = spaceshipRepository.findBySwapiId(swapiId)
                .orElse(new Spaceship());

        Long costInCredits = parsarCreditos(dto.getCostInCredits());

        spaceship.setSwapiId(swapiId);
        spaceship.setName(dto.getName());
        spaceship.setModel(dto.getModel());
        spaceship.setManufacturer(dto.getManufacturer());
        spaceship.setCapacity(parsarPassageiros(dto.getPassengers()));
        spaceship.setCostInCredits(costInCredits);
        spaceship.setDailyPrice(spaceshipService.calcularDailyPrice(costInCredits));
        spaceship.setStatus(status);

        spaceshipRepository.save(spaceship);
    }

    private Integer extrairSwapiId(String url) {
        String[] parts = url.split("/");
        return Integer.parseInt(parts[parts.length - 1]);
    }

    private Integer parsarPassageiros(String passengers) {
        try {
            return Integer.parseInt(passengers.replace(",", "").trim());
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private Long parsarCreditos(String costInCredits) {
        try {
            return Long.parseLong(costInCredits.replace(",", "").trim());
        } catch (NumberFormatException | NullPointerException e) {
            return null;
        }
    }
}
