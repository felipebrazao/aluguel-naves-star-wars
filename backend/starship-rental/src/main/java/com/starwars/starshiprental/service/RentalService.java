package com.starwars.starshiprental.service;

import com.starwars.starshiprental.dto.RentalRequestDTO;
import com.starwars.starshiprental.dto.RentalResponseDTO;
import com.starwars.starshiprental.entity.*;
import com.starwars.starshiprental.repository.*;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class RentalService {

        private static final String STATUS_DISPONIVEL = "disponivel";
        private static final String STATUS_ATIVA = "ativa";
        private static final String RENTAL_NOT_FOUND_PREFIX = "Aluguel não encontrado com id: ";

        private final RentalRepository rentalRepository;
        private final RentalStatusRepository rentalStatusRepository;
        private final SpaceshipRepository spaceshipRepository;
        private final SpaceshipStatusRepository spaceshipStatusRepository;
        private final PlanetRepository planetRepository;
        private final PaymentMethodRepository paymentMethodRepository;
        private final UserRepository userRepository;
        private final PaymentService paymentService;

        public RentalService(RentalRepository rentalRepository,
                        RentalStatusRepository rentalStatusRepository,
                        SpaceshipRepository spaceshipRepository,
                        SpaceshipStatusRepository spaceshipStatusRepository,
                        PlanetRepository planetRepository,
                        PaymentMethodRepository paymentMethodRepository,
                        UserRepository userRepository,
                        @Lazy PaymentService paymentService) {
                this.rentalRepository = rentalRepository;
                this.rentalStatusRepository = rentalStatusRepository;
                this.spaceshipRepository = spaceshipRepository;
                this.spaceshipStatusRepository = spaceshipStatusRepository;
                this.planetRepository = planetRepository;
                this.paymentMethodRepository = paymentMethodRepository;
                this.userRepository = userRepository;
                this.paymentService = paymentService;
        }

        public RentalResponseDTO create(RentalRequestDTO dto) {
                LocalDateTime startDate = dto.getStartDate().toLocalDateTime();
                LocalDateTime endDate = dto.getEndDate().toLocalDateTime();

                Spaceship spaceship = spaceshipRepository.findById(dto.getSpaceshipId())
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Nave não encontrada com id: " + dto.getSpaceshipId()));

                if (!spaceship.getStatus().getName().equals(STATUS_DISPONIVEL)) {
                        throw new IllegalStateException("Nave não está disponível para aluguel");
                }

                Planet pickupPlanet = planetRepository.findById(dto.getPickupPlanetId())
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Planeta de retirada não encontrado com id: "
                                                                + dto.getPickupPlanetId()));

                Planet returnPlanet = planetRepository.findById(dto.getReturnPlanetId())
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Planeta de devolução não encontrado com id: "
                                                                + dto.getReturnPlanetId()));

                long days = ChronoUnit.DAYS.between(startDate, endDate);
                if (days <= 0)
                        throw new IllegalStateException("Data de fim deve ser posterior à data de início");

                RentalStatus status = rentalStatusRepository.findByName(STATUS_ATIVA)
                                .orElseThrow(() -> statusNotFound(STATUS_ATIVA));

                BigDecimal totalPrice = spaceship.getDailyPrice().multiply(BigDecimal.valueOf(days));

                Rental rental = new Rental();
                rental.setUserId(dto.getUserId());
                rental.setSpaceship(spaceship);
                rental.setStatus(status);
                rental.setPickupPlanet(pickupPlanet);
                rental.setReturnPlanet(returnPlanet);
                rental.setStartDate(startDate);
                rental.setEndDate(endDate);
                rental.setTotalPrice(totalPrice);

                // Muda status da nave para 'alugada'
                SpaceshipStatus alugada = spaceshipStatusRepository.findByName("alugada")
                                .orElseThrow(() -> statusNotFound("alugada"));
                spaceship.setStatus(alugada);
                spaceshipRepository.save(spaceship);

                Rental saved = rentalRepository.save(rental);

                // Cria payment pendente automaticamente
                PaymentMethod paymentMethod = paymentMethodRepository.findById(dto.getPaymentMethodId())
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Método de pagamento não encontrado com id: "
                                                                + dto.getPaymentMethodId()));
                paymentService.createPending(saved, paymentMethod);

                return mapToResponse(saved);
        }

        public List<RentalResponseDTO> findAll() {
                Map<Integer, String> userNames = new HashMap<>();
                return rentalRepository.findAll().stream()
                                .map(rental -> mapToResponse(rental, userNames))
                                .toList();
        }

        public List<RentalResponseDTO> findByUserId(Integer userId) {
                String resolvedUserName = resolveUserName(userId);
                return rentalRepository.findAllByUserId(userId).stream()
                                .map(rental -> new RentalResponseDTO(rental, resolvedUserName))
                                .toList();
        }

        public RentalResponseDTO findById(Integer id) {
                Rental rental = rentalRepository.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                RENTAL_NOT_FOUND_PREFIX + id));
                return mapToResponse(rental);
        }

        public RentalResponseDTO conclude(Integer id) {
                Rental rental = rentalRepository.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                RENTAL_NOT_FOUND_PREFIX + id));

                if (!rental.getStatus().getName().equals(STATUS_ATIVA)) {
                        throw new IllegalStateException("Apenas alugueis ativos podem ser concluídos");
                }

                RentalStatus concluded = rentalStatusRepository.findByName("concluida")
                                .orElseThrow(() -> statusNotFound("concluida"));
                rental.setStatus(concluded);
                rental.setActualReturnDate(java.time.LocalDateTime.now());

                // Muda status da nave de volta para 'disponivel'
                SpaceshipStatus disponivel = spaceshipStatusRepository.findByName(STATUS_DISPONIVEL)
                                .orElseThrow(() -> statusNotFound(STATUS_DISPONIVEL));
                rental.getSpaceship().setStatus(disponivel);
                spaceshipRepository.save(rental.getSpaceship());

                return mapToResponse(rentalRepository.save(rental));
        }

        public RentalResponseDTO cancel(Integer id) {
                Rental rental = rentalRepository.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                RENTAL_NOT_FOUND_PREFIX + id));

                if (!rental.getStatus().getName().equals(STATUS_ATIVA)) {
                        throw new IllegalStateException("Apenas alugueis ativos podem ser cancelados");
                }

                RentalStatus cancelled = rentalStatusRepository.findByName("cancelada")
                                .orElseThrow(() -> statusNotFound("cancelada"));
                rental.setStatus(cancelled);

                // Muda status da nave de volta para 'disponivel'
                SpaceshipStatus disponivel = spaceshipStatusRepository.findByName(STATUS_DISPONIVEL)
                                .orElseThrow(() -> statusNotFound(STATUS_DISPONIVEL));
                rental.getSpaceship().setStatus(disponivel);
                spaceshipRepository.save(rental.getSpaceship());

                return mapToResponse(rentalRepository.save(rental));
        }

        private RentalResponseDTO mapToResponse(Rental rental) {
                return new RentalResponseDTO(rental, resolveUserName(rental.getUserId()));
        }

        private RentalResponseDTO mapToResponse(Rental rental, Map<Integer, String> userNamesCache) {
                String resolvedUserName = userNamesCache.computeIfAbsent(rental.getUserId(), this::resolveUserName);
                return new RentalResponseDTO(rental, resolvedUserName);
        }

        private String resolveUserName(Integer userId) {
                return userRepository.findById(userId)
                                .map(User::getName)
                                .orElse("Usuário #" + userId);
        }

        private IllegalStateException statusNotFound(String statusName) {
                return new IllegalStateException("Status '" + statusName + "' não encontrado");
        }
}
