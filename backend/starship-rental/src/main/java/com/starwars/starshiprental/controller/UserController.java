package com.starwars.starshiprental.controller;

import com.starwars.starshiprental.dto.UserRequestDTO;
import com.starwars.starshiprental.dto.UserResponseDTO;
import com.starwars.starshiprental.entity.User;
import com.starwars.starshiprental.service.UserImportService;
import com.starwars.starshiprental.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;
    private final UserImportService userImportService;

    public UserController(UserService userService, UserImportService userImportService) {
        this.userService = userService;
        this.userImportService = userImportService;
    }

    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> importUsers() {
        int total = userImportService.importUsers();
        return ResponseEntity.ok(Map.of(
                "mensagem", "Importação de usuários concluída com sucesso!",
                "totalUsuarios", total
        ));
    }

    @PostMapping
    public ResponseEntity<UserResponseDTO> create(@Validated @RequestBody UserRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> findAll(
            @RequestParam(required = false) Boolean active) {
        return ResponseEntity.ok(userService.findAll(active));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> update(@PathVariable Integer id,
                                                  @Validated @RequestBody UserRequestDTO dto) {
        return ResponseEntity.ok(userService.update(id, dto));
    }

    @PatchMapping("/{id}/active")
    public ResponseEntity<Map<String, Object>> toggleActive(@PathVariable Integer id) {
        User user = userService.toggleActive(id);
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "active", user.getActive()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "email and password are required"));
        }

        Optional<User> opt = userService.findByEmail(email);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Credenciais inválidas"));
        }

        User user = opt.get();
        if (user.getPasswordHash() == null || !user.getPasswordHash().equals(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Credenciais inválidas"));
        }

        String token = UUID.randomUUID().toString();
        return ResponseEntity.ok(Map.of(
                "token", token,
                "user", new UserResponseDTO(user)
        ));
    }
}

