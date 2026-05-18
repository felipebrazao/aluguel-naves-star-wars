package com.starwars.starshiprental.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "planets")
public class Planet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "swapi_id", unique = true)
    private Integer swapiId;

    @Column(nullable = false, length = 100)
    private String name;

    private Integer diameter;

    @Column(length = 100)
    private String climate;

    @Column(length = 100)
    private String terrain;

    private Long population;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}

