package com.opale.micro_planning.infra.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "matiere", uniqueConstraints = @UniqueConstraint(columnNames = {"nom", "semestre", "id_promo", "id_specialite"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Matiere {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @Size(max = 255)
    @Column(name = "nom", nullable = false)
    private String nom;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(name = "volume_horaire", nullable = false)
    private Double volumeHoraire;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_promo", foreignKey = @ForeignKey(name = "fk_matiere_promotion"))
    private Promotion promotion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_specialite", foreignKey = @ForeignKey(name = "fk_matiere_specialite"))
    private Specialite specialite;

    @NotNull
    @Min(1)
    @Column(name = "semestre", nullable = false)
    private Integer semestre;

    @NotNull
    @Min(0)
    @Column(name = "nb_partiels", nullable = false)
    private Integer nbPartiels;

    @Min(0)
    @Column(name = "nb_eval_intermediaire")
    private Integer nbEvalIntermediaire;

    @Min(0)
    @Column(name = "heures_td")
    private Integer heuresTd;

    @Min(0)
    @Column(name = "heures_tp")
    private Integer heuresTp;
}
