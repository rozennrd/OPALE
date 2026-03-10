package com.opale.micro_planning.infra.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "disponibilite", uniqueConstraints = @UniqueConstraint(columnNames = {"id_prof", "num_semaine"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Disponibilite {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_prof", nullable = false, foreignKey = @ForeignKey(name = "fk_dispo_prof"))
    private Professeur professeur;

    @NotNull
    @Min(1)
    @Column(name = "num_semaine", nullable = false)
    private Integer numSemaine;

    @Size(max = 10)
    @Column(name = "dispo_micro")
    private String dispoMicro;
}
