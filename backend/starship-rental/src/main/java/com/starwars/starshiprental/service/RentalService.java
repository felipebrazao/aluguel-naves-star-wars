package com.starwars.starshiprental.service;

import com.starwars.starshiprental.dto.RentalRequestDTO;
import com.starwars.starshiprental.dto.RentalResponseDTO;
import com.starwars.starshiprental.entity.*;
import com.starwars.starshiprental.repository.*;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class RentalService {

    private final RentalRepository rentalRepository;
    private final RentalStatusRepository rentalStatusRepository;
    private final SpaceshipRepository spaceshipRepository;
    private final SpaceshipStatusRepository spaceshipStatusRepository;
    private final PlanetRepository planetRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final PaymentService paymentService;

    public RentalService(RentalRepository rentalRepository,
                         RentalStatusRepository rentalStatusRepository,
                         SpaceshipRepository spaceshipRepository,
                         SpaceshipStatusRepository spaceshipStatusRepository,
                         PlanetRepository planetRepository,
                         PaymentMethodRepository paymentMethodRepository,
                         @Lazy PaymentService paymentService) {
        this.rentalRepository = rentalRepository;
        this.rentalStatusRepository = rentalStatusRepository;
        this.spaceshipRepository = spaceshipRepository;
        this.spaceshipStatusRepository = spaceshipStatusRepository;
        this.planetRepository = planetRepository;
        this.paymentMethodRepository = paymentMethodRepository;
        this.paymentService = paymentService;
    }

    public RentalResponseDTO create(RentalRequestDTO dto) {
        Spaceship spaceship = spaceshipRepository.findById(dto.getSpaceshipId())
                .orElseThrow(() -> new IllegalArgumentException("Nave não encontrada com id: " + dto.getSpaceshipId()));

        if (!spaceship.getStatus().getName().equals("disponivel")) {
            throw new IllegalStateException("Nave não está disponível para aluguel");
        }

        Planet pickupPlanet = planetRepository.findById(dto.getPickupPlanetId())
                .orElseThrow(() -> new IllegalArgumentException("Planeta de retirada não encontrado com id: " + dto.getPickupPlanetId()));

        Planet returnPlanet = planetRepository.findById(dto.getReturnPlanetId())
                .orElseThrow(() -> new IllegalArgumentException("Planeta de devolução não encontrado com id: " + dto.getReturnPlanetId()));

        long days = ChronoUnit.DAYS.between(dto.getStartDate(), dto.getEndDate());
        if (days <= 0) throw new IllegalStateException("Data de fim deve ser posterior à data de início");

        RentalStatus status = rentalStatusRepository.findByName("ativa")
                .orElseThrow(() -> new IllegalStateException("Status 'ativa' não encontrado"));

        BigDecimal totalPrice = spaceship.getDailyPrice().multiply(BigDecimal.valueOf(days));

        Rental rental = new Rental();
        rental.setUserId(dto.getUserId());
        rental.setSpaceship(spaceship);
        rental.setStatus(status);
        rental.setPickupPlanet(pickupPlanet);
        rental.setReturnPlanet(returnPlanet);
        rental.setStartDate(dto.getStartDate());
        rental.setEndDate(dto.getEndDate());
        rental.setTotalPrice(totalPrice);

        // Muda status da nave para 'alugada'
        SpaceshipStatus alugada = spaceshipStatusRepository.findByName("alugada")
                .orElseThrow(() -> new IllegalStateException("Status 'alugada' não encontrado"));
        spaceship.setStatus(alugada);
        spaceshipRepository.save(spaceship);

        Rental saved = rentalRepository.save(rental);

        // Cria payment pendente automaticamente
        PaymentMethod paymentMethod = paymentMethodRepository.findById(dto.getPaymentMethodId())
                .orElseThrow(() -> new IllegalArgumentException("Método de pagamento não encontrado com id: " + dto.getPaymentMethodId()));
        paymentService.createPending(saved, paymentMethod);

        return new RentalResponseDTO(saved);
    }

    public List<RentalResponseDTO> findAll() {
        return rentalRepository.findAll().stream()
                .map(RentalResponseDTO::new)
                .toList();
    }

    public RentalResponseDTO findById(Integer id) {
        Rental rental = rentalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Aluguel não encontrado com id: " + id));
        return new RentalResponseDTO(rental);
    }

    public RentalResponseDTO conclude(Integer id) {
        Rental rental = rentalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Aluguel não encontrado com id: " + id));

        if (!rental.getStatus().getName().equals("ativa")) {
            throw new IllegalStateException("Apenas alugueis ativos podem ser concluídos");
        }

        RentalStatus concluded = rentalStatusRepository.findByName("concluida")
                .orElseThrow(() -> new IllegalStateException("Status 'concluida' não encontrado"));
        rental.setStatus(concluded);
        rental.setActualReturnDate(java.time.LocalDateTime.now());

        // Muda status da nave de volta para 'disponivel'
        SpaceshipStatus disponivel = spaceshipStatusRepository.findByName("disponivel")
                .orElseThrow(() -> new IllegalStateException("Status 'disponivel' não encontrado"));
        rental.getSpaceship().setStatus(disponivel);
        spaceshipRepository.save(rental.getSpaceship());

        return new RentalResponseDTO(rentalRepository.save(rental));
    }

    public RentalResponseDTO cancel(Integer id) {
        Rental rental = rentalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Aluguel não encontrado com id: " + id));

        if (!rental.getStatus().getName().equals("ativa")) {
            throw new IllegalStateException("Apenas alugueis ativos podem ser cancelados");
        }

        RentalStatus cancelled = rentalStatusRepository.findByName("cancelada")
                .orElseThrow(() -> new IllegalStateException("Status 'cancelada' não encontrado"));
        rental.setStatus(cancelled);

        // Muda status da nave de volta para 'disponivel'
        SpaceshipStatus disponivel = spaceshipStatusRepository.findByName("disponivel")
                .orElseThrow(() -> new IllegalStateException("Status 'disponivel' não encontrado"));
        rental.getSpaceship().setStatus(disponivel);
        spaceshipRepository.save(rental.getSpaceship());

        return new RentalResponseDTO(rentalRepository.save(rental));
    }
}

