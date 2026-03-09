package com.opale.micro_planning.infra.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "enseignement", uniqueConstraints = @UniqueConstraint(columnNames = {"id_matiere", "id_prof"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Enseignement {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_matiere", nullable = false, foreignKey = @ForeignKey(name = "fk_enseignement_matiere"))
    private Matiere matiere;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_prof", nullable = false, foreignKey = @ForeignKey(name = "fk_enseignement_prof"))
    private Professeur professeur;

    @Min(0)
    @Column(name = "heures_td")
    private Integer heuresTd;

    @Min(0)
    @Column(name = "heures_tp")
    private Integer heuresTp;

    @Min(0)
    @Column(name = "heures_projet")
    private Integer heuresProjet;

    @Min(0)
    @Column(name = "heures_elearning")
    private Integer heuresElearning;

    @Min(0)
    @Column(name = "heures_autre")
    private Integer heuresAutre;
}
