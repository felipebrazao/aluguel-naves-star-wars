package com.starwars.starshiprental.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentRequestDTO {

    @NotNull(message = "Método de pagamento é obrigatório")
    private Integer paymentMethodId;
}

