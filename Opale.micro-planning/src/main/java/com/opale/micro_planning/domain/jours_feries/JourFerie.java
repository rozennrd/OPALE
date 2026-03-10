package com.opale.micro_planning.domain.jours_feries;

import lombok.Data;

import java.time.LocalDate;

@Data
public class JourFerie {
    private LocalDate jour;
    private String nom;
}
