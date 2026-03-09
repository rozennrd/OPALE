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
@Table(name = "groupe", uniqueConstraints = @UniqueConstraint(columnNames = {"id_promo", "nom"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Groupe {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_promo", nullable = false, foreignKey = @ForeignKey(name = "fk_groupe_promotion"))
    private Promotion promotion;

    @NotNull
    @Size(max = 100)
    @Column(name = "nom", nullable = false)
    private String nom;

    @NotNull
    @Min(0)
    @Column(name = "effectifs", nullable = false)
    private Integer effectifs;
}
