package com.opale.micro_planning.domain.constraints;

import com.google.ortools.sat.BoolVar;
import com.google.ortools.sat.CpModel;
import com.google.ortools.sat.IntVar;
import com.google.ortools.sat.Literal;
import com.opale.micro_planning.domain.Scheduler;
import com.opale.micro_planning.domain.entities.Cours;
import com.opale.micro_planning.domain.entities.CourseVariables;
import com.opale.micro_planning.domain.entities.Salle;

import java.util.*;

public class RoomConstraintsHandler implements BaseConstraintHandler {
    private final List<IntVar> penalties = new ArrayList<>();

    @Override
    public List<IntVar> addConstraints(CpModel model, Scheduler scheduler, ConstraintData data) {
        if (!data.availableRooms.isEmpty()) {
            addRoomCapacityConstraints(model, data);
            addNoRoomConflictConstraints(model, data);
        }
        return penalties;
    }


    private void addRoomCapacityConstraints(CpModel model, ConstraintData data) {
        // Ensure each course is assigned to a room with sufficient capacity
        for (Map.Entry<Cours, CourseVariables> entry : data.courseVars.entrySet()) {
            Cours course = entry.getKey();
            IntVar roomVar = entry.getValue().getRoomVar();

            // Si distanciel, pas de contrainte de capacité, on skip.
            if (course.getDistanciel() != null && course.getDistanciel()) {
                continue; // Distance courses don't need room capacity constraints
            }

            // Get the number of students in this course
            int courseSize = course.getMatiere().getPromotion().getEffectifs();

            // For each room, add a constraint if the course tries to use that room
            for (int roomIndex = 0; roomIndex < data.availableRooms.size(); roomIndex++) {
                Salle room = data.availableRooms.get(roomIndex);
                if (courseSize > room.getCapacite()) {
                    // Cette salle est trop petite, ce cours ne peut pas s'y mettre
                    model.addDifferent(roomVar, roomIndex);
                }
            }
        }
    }

    private void addNoRoomConflictConstraints(CpModel model, ConstraintData data) {
        // Ensure no two courses are in the same room at the same time
        List<Cours> courses = data.courses;

        // Check all pairs of courses
        for (int i = 0; i < courses.size(); i++) {
            for (int j = i + 1; j < courses.size(); j++) {
                Cours course1 = courses.get(i);
                Cours course2 = courses.get(j);

                CourseVariables vars1 = data.courseVars.get(course1);
                CourseVariables vars2 = data.courseVars.get(course2);

                checkRoomConflict(model, vars1, vars2);
            }
        }
    }

    private void checkRoomConflict(CpModel model, CourseVariables vars1, CourseVariables vars2) {
        // Two courses can coexist if:
        // 1. They're in different rooms, OR
        // 2. They're on different days, OR
        // 3. They're in the same room and same day but don't overlap in time

        // Create boolean: are they on same day?
        BoolVar sameDay = model.newBoolVar("same_day_" + vars1.hashCode() + "_" + vars2.hashCode());
        model.addEquality(vars1.getDayVar(), vars2.getDayVar()).onlyEnforceIf(sameDay);
        model.addDifferent(vars1.getDayVar(), vars2.getDayVar()).onlyEnforceIf(sameDay.not());

        // Create boolean: are they in same room?
        BoolVar sameRoom = model.newBoolVar("same_room_" + vars1.hashCode() + "_" + vars2.hashCode());
        model.addEquality(vars1.getRoomVar(), vars2.getRoomVar()).onlyEnforceIf(sameRoom);
        model.addDifferent(vars1.getRoomVar(), vars2.getRoomVar()).onlyEnforceIf(sameRoom.not());

        // If same day and same room, they must not overlap in time
        BoolVar course1Before = model.newBoolVar("c1_before_c2");
        BoolVar course2Before = model.newBoolVar("c2_before_c1");

        model.addLessOrEqual(vars1.getEndVar(), vars2.getStartVar()).onlyEnforceIf(new BoolVar[]{course1Before, sameDay, sameRoom});
        model.addLessOrEqual(vars2.getEndVar(), vars1.getStartVar()).onlyEnforceIf(new BoolVar[]{course2Before, sameDay, sameRoom});

        // If same day and same room, at least one ordering must be true (they don't overlap)
        model.addBoolOr(new Literal[]{course1Before, course2Before, sameDay.not(), sameRoom.not()});
    }
}
