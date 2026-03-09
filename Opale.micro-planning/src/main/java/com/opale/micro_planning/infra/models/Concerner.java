package com.opale.micro_planning.infra.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "concerner", uniqueConstraints = @UniqueConstraint(columnNames = {"id_event", "id_promo", "id_groupe", "id_specialite"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Concerner {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_event", nullable = false, foreignKey = @ForeignKey(name = "fk_concerner_event"))
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_promo", foreignKey = @ForeignKey(name = "fk_concerner_promo"))
    private Promotion promotion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_groupe", foreignKey = @ForeignKey(name = "fk_concerner_groupe"))
    private Groupe groupe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_specialite", foreignKey = @ForeignKey(name = "fk_concerner_specialite"))
    private Specialite specialite;
}
