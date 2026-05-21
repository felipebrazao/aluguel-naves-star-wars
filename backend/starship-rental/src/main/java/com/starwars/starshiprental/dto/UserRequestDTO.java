package com.starwars.starshiprental.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserRequestDTO {

    @NotBlank(message = "Nome é obrigatório")
    private String name;

    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email inválido")
    private String email;

    @NotBlank(message = "CPF é obrigatório")
    @Size(min = 11, max = 11, message = "CPF deve ter 11 dígitos")
    private String cpf;

    // TODO: aplicar BCryptPasswordEncoder ao receber a senha quando Spring Security
    // for implementado
    @NotBlank(message = "Senha é obrigatória")
    private String password;

    @NotNull(message = "Role é obrigatória")
    private Integer roleId;
}
