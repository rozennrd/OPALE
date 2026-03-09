package com.opale.micro_planning.infra.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "promotion", uniqueConstraints = @UniqueConstraint(columnNames = {"nom", "id_cycle"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @Size(max = 255)
    @Column(name = "nom", nullable = false)
    private String nom;

    @NotNull
    @Min(0)
    @Column(name = "effectifs", nullable = false)
    private Integer effectifs;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cycle", nullable = false, foreignKey = @ForeignKey(name = "fk_promotion_cycle"))
    private Cycle cycle;

    @Column(name = "date_start")
    private LocalDate dateStart;

    @Column(name = "date_end")
    private LocalDate dateEnd;
}
