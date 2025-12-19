package com.opale.micro_planning.infra.repositories;

import com.opale.micro_planning.infra.models.Event;
import com.opale.micro_planning.infra.models.TypeEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, java.util.UUID> {

    List<Event> findByType(TypeEvent type);

    List<Event> findByNumSemaine(Integer numSemaine);

    List<Event> findByShowMacro(Boolean showMacro);

    List<Event> findByShowMicro(Boolean showMicro);

    List<Event> findByDatetimeStartBetween(LocalDateTime start, LocalDateTime end);

    List<Event> findByIsBlocking(Boolean isBlocking);
}
