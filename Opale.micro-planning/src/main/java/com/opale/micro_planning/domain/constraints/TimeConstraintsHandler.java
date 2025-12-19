package com.opale.micro_planning.domain.constraints;

import com.google.ortools.sat.BoolVar;
import com.google.ortools.sat.CpModel;
import com.google.ortools.sat.IntVar;
import com.google.ortools.sat.LinearExpr;
import com.opale.micro_planning.domain.Scheduler;
import com.opale.micro_planning.domain.entities.Cours;
import com.opale.micro_planning.domain.entities.CourseVariables;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static com.opale.micro_planning.domain.constraints.SchedulingConstants.LUNCH_END_FROM_DAY_START;
import static com.opale.micro_planning.domain.constraints.SchedulingConstants.LUNCH_START_FROM_DAY_START;

public class TimeConstraintsHandler implements BaseConstraintHandler{
    private final List<IntVar> penalties = new ArrayList<>();


    @Override
    public List<IntVar> addConstraints(CpModel model, Scheduler scheduler, ConstraintData data) {
        addLunchConstraints(model, data);
        // Add other time constraints here
        return penalties;
    }

    private static void addLunchConstraints(CpModel model, ConstraintData data) {
        // For each course: (end <= LUNCH_START) OR (start >= LUNCH_END)
        // In OR-Tools, we use BoolVar to model the OR
        for (Map.Entry<Cours, CourseVariables> entry : data.courseVars.entrySet()) {
            CourseVariables vars = entry.getValue();

            // Create two boolean variables
            BoolVar isMorning = model.newBoolVar("is_morning_" + entry.getKey().hashCode());
            BoolVar isAfternoon = model.newBoolVar("is_afternoon_" + entry.getKey().hashCode());

            // If isMorning=true, then end <= lunchStart
            model.addLessOrEqual(vars.getEndVar(), LUNCH_START_FROM_DAY_START).onlyEnforceIf(isMorning);
            // If isAfternoon=true, then start >= lunchEnd
            model.addGreaterOrEqual(vars.getStartVar(), LUNCH_END_FROM_DAY_START).onlyEnforceIf(isAfternoon);

            // Exactly one must be true (morning OR afternoon)
            model.addEquality(LinearExpr.sum(new BoolVar[]{isMorning, isAfternoon}), 1);
        }
    }
}
