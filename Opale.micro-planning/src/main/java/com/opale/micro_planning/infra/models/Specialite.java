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
@Table(name = "specialite", uniqueConstraints = @UniqueConstraint(columnNames = {"id_groupe", "nom"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Specialite {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_groupe", foreignKey = @ForeignKey(name = "fk_specialite_groupe"))
    private Groupe groupe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_promo", foreignKey = @ForeignKey(name = "fk_specialite_promo"))
    private Promotion promotion;

    @NotNull
    @Size(max = 255)
    @Column(name = "nom", nullable = false)
    private String nom;

    @NotNull
    @Min(0)
    @Column(name = "effectifs", nullable = false)
    private Integer effectifs;
}
