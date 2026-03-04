package com.opale.micro_planning.infra.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "cours", uniqueConstraints = @UniqueConstraint(columnNames = {"id_event", "id_prof", "id_matiere", "type"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cours {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_event", nullable = false, foreignKey = @ForeignKey(name = "fk_cours_event"))
    private Event event;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private TypeCours type;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_prof", nullable = false, foreignKey = @ForeignKey(name = "fk_cours_prof"))
    private Professeur professeur;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_matiere", nullable = false, foreignKey = @ForeignKey(name = "fk_cours_matiere"))
    private Matiere matiere;

    @Column(name = "is_distanciel", nullable = false)
    private Boolean distanciel = false;
}
