package com.opale.micro_planning.domain.constraints;

import com.google.ortools.sat.BoolVar;
import com.google.ortools.sat.CpModel;
import com.google.ortools.sat.IntVar;
import com.google.ortools.sat.Literal;
import com.opale.micro_planning.domain.Scheduler;
import com.opale.micro_planning.domain.entities.CourseVariables;

import java.util.List;

public interface BaseConstraintHandler {
    /**
     *
     * @param model
     * @param scheduler
     * @param data
     * @return list of penalties applied after having dealt with all the constraints
     */
    List<IntVar> addConstraints(CpModel model, Scheduler scheduler, ConstraintData data);

    static void addNoOverlapConstraint(CpModel model, CourseVariables vars1, CourseVariables vars2) {
        // Two courses don't overlap if:
        // 1. They're on different days, OR
        // 2. They're on same day but one ends before other starts

        // Create boolean: are they on same day?
        BoolVar sameDay = model.newBoolVar("same_day_" + vars1.hashCode() + "_" + vars2.hashCode());
        model.addEquality(vars1.getDayVar(), vars2.getDayVar()).onlyEnforceIf(sameDay);
        model.addDifferent(vars1.getDayVar(), vars2.getDayVar()).onlyEnforceIf(sameDay.not());

        // If same day, they must not overlap in time
        // Course1 ends before Course2 starts OR Course2 ends before Course1 starts
        BoolVar course1Before = model.newBoolVar("c1_before_c2");
        BoolVar course2Before = model.newBoolVar("c2_before_c1");

        model.addLessOrEqual(vars1.getEndVar(), vars2.getStartVar()).onlyEnforceIf(new BoolVar[]{course1Before, sameDay});
        model.addLessOrEqual(vars2.getEndVar(), vars1.getStartVar()).onlyEnforceIf(new BoolVar[]{course2Before, sameDay});

        // If same day, at least one must be true
        model.addBoolOr(new Literal[]{course1Before, course2Before, sameDay.not()});
    }
}
