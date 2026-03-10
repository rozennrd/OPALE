package com.opale.micro_planning.domain.constraints;

import com.google.ortools.sat.CpModel;
import com.google.ortools.sat.IntVar;
import com.opale.micro_planning.domain.Scheduler;
import com.opale.micro_planning.domain.entities.Cours;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class HumanConstraintsHandler implements BaseConstraintHandler{
    private final List<IntVar> penalties = new ArrayList<>();
    @Override
    public List<IntVar> addConstraints(CpModel model, Scheduler scheduler, ConstraintData data) {
        addProfessorNoOverlapConstraints(model, data);
        addStudentNoOverlapConstraints(model, data);
        return penalties;
    }

    private static void addProfessorNoOverlapConstraints(CpModel model, ConstraintData data) {

        // Group courses by professor
        Map<String, List<Cours>> coursesByProf = new HashMap<>();

        for (Cours course : data.courses) {
            String profId = course.getProfesseurId();
            coursesByProf.computeIfAbsent(profId, k -> new ArrayList<>()).add(course);
        }

        // For each professor, ensure no overlaps
        for (Map.Entry<String, List<Cours>> entry : coursesByProf.entrySet()) {
            List<Cours> profCourses = entry.getValue();

            // Check each pair of courses for this professor
            for (int i = 0; i < profCourses.size(); i++) {
                for (int j = i + 1; j < profCourses.size(); j++) {
                    Cours course1 = profCourses.get(i);
                    Cours course2 = profCourses.get(j);

                    BaseConstraintHandler.addNoOverlapConstraint(model, data.courseVars.get(course1), data.courseVars.get(course2));
                }
            }
        }
    }

    private static void addStudentNoOverlapConstraints(CpModel model, ConstraintData data) {
        // Group courses by student cohort (promotion/group/specialite)
        Map<String, List<Cours>> coursesByCohort = new HashMap<>();

        for (Cours course : data.courses) {
            String cohortId = course.getMatiere().getPromotion().getId().toString();
            coursesByCohort.computeIfAbsent(cohortId, k -> new ArrayList<>()).add(course);
        }

        // For each cohort, ensure no overlaps
        for (Map.Entry<String, List<Cours>> entry : coursesByCohort.entrySet()) {
            List<Cours> cohortCourses = entry.getValue();

            for (int i = 0; i < cohortCourses.size(); i++) {
                for (int j = i + 1; j < cohortCourses.size(); j++) {
                    Cours course1 = cohortCourses.get(i);
                    Cours course2 = cohortCourses.get(j);

                    BaseConstraintHandler.addNoOverlapConstraint(model, data.courseVars.get(course1), data.courseVars.get(course2));
                }
            }
        }
    }
}
