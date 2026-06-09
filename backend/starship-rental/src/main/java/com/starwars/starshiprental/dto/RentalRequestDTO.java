package com.starwars.starshiprental.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
public class RentalRequestDTO {

    @NotNull(message = "Usuário é obrigatório")
    private Integer userId;

    @NotNull(message = "Nave é obrigatória")
    private Integer spaceshipId;

    @NotNull(message = "Planeta de retirada é obrigatório")
    private Integer pickupPlanetId;

    @NotNull(message = "Planeta de devolução é obrigatório")
    private Integer returnPlanetId;

    @NotNull(message = "Data de início é obrigatória")
    private OffsetDateTime startDate;

    @NotNull(message = "Data de fim é obrigatória")
    private OffsetDateTime endDate;

    @NotNull(message = "Método de pagamento é obrigatório")
    private Integer paymentMethodId;
}
