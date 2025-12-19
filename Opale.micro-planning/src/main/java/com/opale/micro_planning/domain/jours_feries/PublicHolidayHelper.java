package com.opale.micro_planning.domain.jours_feries;

import com.opale.micro_planning.domain.services.PublicHolidayService;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.util.ArrayList;

public class PublicHolidayHelper {
    private PublicHolidayService service;

    public PublicHolidayHelper(PublicHolidayService publicHolidayService) {
        service = publicHolidayService;
    }


    public ArrayList<LocalDate> getPonts() {
        ArrayList<JourFerie> joursFeries = service.getPublicHolidays();
        ArrayList<LocalDate> ponts = new ArrayList<>();

        for (JourFerie jour : joursFeries) {
            DayOfWeek jourSemaine = jour.getJour().getDayOfWeek();
            if (jourSemaine == DayOfWeek.TUESDAY) {
                ponts.add(jour.getJour().minus(Duration.ofDays(1)));
            } else if (jourSemaine == DayOfWeek.THURSDAY) {
                ponts.add(jour.getJour().plus(Duration.ofDays(1)));
            }
        }
        return ponts;
    }
}
