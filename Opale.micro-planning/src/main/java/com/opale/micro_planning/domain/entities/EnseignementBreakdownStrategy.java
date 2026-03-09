package com.opale.micro_planning.domain.entities;

/**
 * Enum describing the strategies to decide how an Enseignement will be broken down into courses
 * when enseignement.nbHours % defaultDurationOfCours != 0
 * The examples will be given for 10h of Enseignement, with default duration of 4h.
 * - EGALIZE_COURSE_DURATION: will egalize everything, as much as possible, while keeping it round
 *   or down to the half hour. Here, we can't do 3.5h, as that would be 2.8 courses. We can't do 3,
 *   that's 3.3 courses. We can do 2.5h, so we'll keep 4 sessions of 2.5h.
 * - PRESERVE_DEFAULT_LENGTH: will preserve default length as much as possible. Here we have 2
 *   times 4h, and a shorter 2h session.
 */
public enum EnseignementBreakdownStrategy {
    EGALIZE_COURSE_DURATION,
    PRESERVE_DEFAULT_LENGTH
}
