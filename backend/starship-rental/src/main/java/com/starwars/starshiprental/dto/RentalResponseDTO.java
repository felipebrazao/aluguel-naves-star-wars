package com.starwars.starshiprental.dto;

import com.starwars.starshiprental.entity.Rental;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
public class RentalResponseDTO {

    private final Integer id;
    private final Integer userId;
    private final String userName;
    private final Integer spaceshipId;
    private final String spaceshipName;
    private final String status;
    private final Integer pickupPlanetId;
    private final String pickupPlanetName;
    private final Integer returnPlanetId;
    private final String returnPlanetName;
    private final LocalDateTime startDate;
    private final LocalDateTime endDate;
    private final LocalDateTime actualPickupDate;
    private final LocalDateTime actualReturnDate;
    private final BigDecimal totalPrice;
    private final LocalDateTime createdAt;

    public RentalResponseDTO(Rental rental) {
        this(rental, null);
    }

    public RentalResponseDTO(Rental rental, String resolvedUserName) {
        this.id = rental.getId();
        this.userId = rental.getUserId();
        this.userName = (resolvedUserName != null && !resolvedUserName.isBlank())
                ? resolvedUserName
                : "Usuário #" + rental.getUserId();
        this.spaceshipId = rental.getSpaceship().getId();
        this.spaceshipName = rental.getSpaceship().getName();
        this.status = rental.getStatus().getName().toLowerCase();
        this.pickupPlanetId = rental.getPickupPlanet().getId();
        this.pickupPlanetName = rental.getPickupPlanet().getName();
        this.returnPlanetId = rental.getReturnPlanet().getId();
        this.returnPlanetName = rental.getReturnPlanet().getName();
        this.startDate = rental.getStartDate();
        this.endDate = rental.getEndDate();
        this.actualPickupDate = rental.getActualPickupDate();
        this.actualReturnDate = rental.getActualReturnDate();
        this.totalPrice = rental.getTotalPrice();
        this.createdAt = rental.getCreatedAt();
    }
}
