package com.opale.micro_planning.domain.constraints;

import com.google.ortools.sat.BoolVar;
import com.google.ortools.sat.CpModel;
import com.google.ortools.sat.IntVar;
import com.google.ortools.sat.Literal;
import com.opale.micro_planning.domain.Scheduler;
import com.opale.micro_planning.domain.entities.Cours;
import com.opale.micro_planning.domain.entities.CourseVariables;

import java.util.ArrayList;
import java.util.List;

public class LunchConstraintsHandler implements BaseConstraintHandler{
    private final List<IntVar> lunchPenalties = new ArrayList<>();


    @Override
    public List<IntVar> addConstraints(CpModel model, Scheduler scheduler, ConstraintData data) {
        addHardLunchConstraints(model, data);
        return addSoftLunchConstraints(model, data);
    }

    private void addHardLunchConstraints(CpModel model, ConstraintData data) {
        // Contrainte 1: Aucun cours pendant 13h-13h30
        addNoCourseDuringLunchBreak(model, data);

        // Contrainte 2: Au moins 1h de lunch par jour (si nécessaire)
        // addMinimumLunchDurationPerDay(model, data);


    }

    private List<IntVar> addSoftLunchConstraints(CpModel model, ConstraintData data) {
        // Contrainte molle: Préférer 12h30 (fin matin) et 13h30 (début après-midi)
        addLunchTimingPreference(model, data);
        // Soft constraints : nécessité de retourner les pénalités, pour pouvoir ensuite les minimiser dans le scheduler
        return lunchPenalties;
    }

    private void addNoCourseDuringLunchBreak(CpModel model, ConstraintData data) {
        // Un cours doit finir avant 13h ou commencer après 13h
        // Complémentaire de la contrainte de durée minimum
        
        for (Cours cours: data.courses) {
            CourseVariables vars = data.courseVars.get(cours);
            BoolVar endsBeforeLunch = model.newBoolVar("morning_course_ends_before_13_" + cours.hashCode());
            BoolVar startsAfterLunch = model.newBoolVar("afternoon_course_starts_after_13_" + cours.hashCode());

            model.addLessOrEqual(vars.getEndVar(), 300).onlyEnforceIf(endsBeforeLunch);
            model.addGreaterOrEqual(vars.getStartVar(), 300).onlyEnforceIf(startsAfterLunch);

            model.addBoolOr(new Literal[]{endsBeforeLunch, startsAfterLunch});
        }

    }

    private void addLunchTimingPreference(CpModel model, ConstraintData data) {
        // Soft: préférer finir à 12h30 (matin) ou commencer à 13h30 (après-midi)
        for (Cours cours: data.courses) {
            CourseVariables vars = data.courseVars.get(cours);

            BoolVar endsAt12h30 = model.newBoolVar("ends_at_12_30_" + cours.hashCode());
            BoolVar startsAt13h30 = model.newBoolVar("starts_at_13_30_" + cours.hashCode());

            // Constrain the BoolVars to actual time checks
            // 12:30 = 4.5 hours from 8:00 = 270 minutes
            model.addEquality(vars.getEndVar(), 270).onlyEnforceIf(endsAt12h30);
            // 13:30 = 5.5 hours from 8:00 = 330 minutes
            model.addEquality(vars.getStartVar(), 330).onlyEnforceIf(startsAt13h30);

            IntVar penalty = model.newIntVar(0, 10, "for_not_respecting_default_lunch_time");

            // No penalty if course ends at 12:30 or starts at 13:30
            model.addEquality(penalty, 0).onlyEnforceIf(endsAt12h30);
            model.addEquality(penalty, 0).onlyEnforceIf(startsAt13h30);
            // Penalty of 5 if course does neither optimal timing
            model.addEquality(penalty, 5).onlyEnforceIf(
                    new Literal[]{endsAt12h30.not(), startsAt13h30.not()}
            );

            lunchPenalties.add(penalty);
        }
    }
}
