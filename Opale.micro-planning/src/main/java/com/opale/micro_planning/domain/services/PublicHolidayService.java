package com.opale.micro_planning.domain.services;

import com.opale.micro_planning.domain.jours_feries.JourFerie;

import java.util.ArrayList;

public interface PublicHolidayService {
    public ArrayList<JourFerie> getPublicHolidays();

}
