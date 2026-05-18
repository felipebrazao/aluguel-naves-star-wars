package com.starwars.starshiprental.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "rentals")
public class Rental {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @ManyToOne
    @JoinColumn(name = "spaceship_id", nullable = false)
    private Spaceship spaceship;

    @ManyToOne
    @JoinColumn(name = "status_id", nullable = false)
    private RentalStatus status;

    @ManyToOne
    @JoinColumn(name = "pickup_planet_id", nullable = false)
    private Planet pickupPlanet;

    @ManyToOne
    @JoinColumn(name = "return_planet_id", nullable = false)
    private Planet returnPlanet;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "actual_pickup_date")
    private LocalDateTime actualPickupDate;

    @Column(name = "actual_return_date")
    private LocalDateTime actualReturnDate;

    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}

