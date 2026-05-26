package com.starwars.starshiprental.config;

import com.starwars.starshiprental.entity.SpaceshipStatus;
import com.starwars.starshiprental.repository.SpaceshipStatusRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements ApplicationRunner {

    private static final List<String> SPACESHIP_STATUS_NAMES = List.of(
            "disponivel",
            "alugada",
            "manutencao",
            "desativada");

    private final SpaceshipStatusRepository spaceshipStatusRepository;

    public DataInitializer(SpaceshipStatusRepository spaceshipStatusRepository) {
        this.spaceshipStatusRepository = spaceshipStatusRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        for (String statusName : SPACESHIP_STATUS_NAMES) {
            if (spaceshipStatusRepository.findByName(statusName).isEmpty()) {
                SpaceshipStatus status = new SpaceshipStatus();
                status.setName(statusName);
                spaceshipStatusRepository.save(status);
            }
        }
    }
}
