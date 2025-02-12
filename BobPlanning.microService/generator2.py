from data import RequestData, CalendrierOutput, PromoCalendrierOutput, JourCalendrierOutput, CoursOutput
from typing import Dict, List
from ortools.sat.python import cp_model

def extract_courses_info(data: RequestData):
    promo_courses_info = {}
    for promo in data.Promos:
        courses_info = [
            {
                "cours": course.name,
                "volume_horaire": course.heure.total if course.heure and course.heure.total is not None else 
                                 course.heure.totalAvecProf if course.heure and course.heure.totalAvecProf is not None else 0,
            }
            for course in promo.cours
        ]
        promo_courses_info[promo.name] = courses_info
    return promo_courses_info

def extract_calendar_info(data: RequestData) -> Dict[str, List[Dict[str, List[str]]]]:
    promo_plannings = {promo.name: [] for promo in data.Promos}

    for calendrier in data.Calendrier:
        for prom in calendrier.promos:
            jours_travailles = []
            jours_vus = set()

            for jour in prom.semaine:
                if jour.enCours and jour.jour not in jours_vus:
                    jours_travailles.append(jour.jour)
                    jours_vus.add(jour.jour)

            if any(s["dateDebut"] == calendrier.dateDebut for s in promo_plannings[prom.name]):
                continue

            semaine_data = {
                "dateDebut": calendrier.dateDebut,
                "jours_travailles": jours_travailles
            }

            promo_plannings[prom.name].append(semaine_data)

    return promo_plannings

def generate_schedule_output(data: RequestData, solver, creneaux_horaires, creneau_occupe, promo_courses_info, calendar_info) -> List[CalendrierOutput]:
    output = []

    for calendrier in data.Calendrier:
        promos_output = []

        for prom in calendrier.promos:
            jours_results = []

            for semaine_index, semaine in enumerate(calendar_info[prom.name]):
                if semaine["dateDebut"] != calendrier.dateDebut:
                    continue  

                for jour_index, jour in enumerate(semaine["jours_travailles"]):
                    cours_results = []

                    for course in promo_courses_info[prom.name]:
                        course_name = course["cours"]

                        creneaux_assignes = [
                            creneaux_horaires[creneau_index]
                            for creneau_index in range(len(creneaux_horaires))
                            if solver.Value(creneau_occupe[(prom.name, course_name, semaine_index, jour_index, creneau_index)]) == 1
                        ]

                        if creneaux_assignes:
                            grouped_creneaux = []
                            temp_group = [creneaux_assignes[0]]

                            for i in range(1, len(creneaux_assignes)):
                                heure_precedente = int(temp_group[-1].split("h")[0])
                                heure_actuelle = int(creneaux_assignes[i].split("h")[0])

                                if heure_actuelle == heure_precedente + 1:
                                    temp_group.append(creneaux_assignes[i])
                                else:
                                    grouped_creneaux.append(temp_group)
                                    temp_group = [creneaux_assignes[i]]

                            grouped_creneaux.append(temp_group)

                            for group in grouped_creneaux:
                                cours_results.append(CoursOutput(
                                    matiere=course_name,
                                    heureDebut=group[0].split("-")[0],
                                    heureFin=group[-1].split("-")[1],
                                    professeur="Prof inconnu",
                                    salleDeCours="Salle inconnue"
                                ))

                    if cours_results:
                        jours_results.append(JourCalendrierOutput(
                            jour=jour,
                            enCours=True,
                            message="",
                            cours=cours_results
                        ))

            promo_output = PromoCalendrierOutput(
                name=prom.name,
                semaine=jours_results
            )

            promos_output.append(promo_output)

        output.append(CalendrierOutput(
            dateDebut=calendrier.dateDebut,
            promos=promos_output
        ))

    return output

def generate_schedule(data: RequestData) -> List[CalendrierOutput]:
    model = cp_model.CpModel()

    promo_courses_info = extract_courses_info(data)
    calendar_info = extract_calendar_info(data)

    creneaux_horaires = [f"{h}h-{h+1}h" for h in range(8, 18) if h != 12]

    creneau_occupe = {}

    for promo, courses in promo_courses_info.items():
        for course in courses:
            course_name = course["cours"]
            total_heures = course["volume_horaire"]

            for semaine_index, semaine in enumerate(calendar_info[promo]):
                for jour_index, jour in enumerate(semaine["jours_travailles"]):
                    for creneau_index in range(len(creneaux_horaires)):
                        creneau_occupe[(promo, course_name, semaine_index, jour_index, creneau_index)] = model.NewBoolVar(
                            f"creneau_occupe_{promo}_{course_name}_semaine_{semaine_index}_jour_{jour_index}_creneau_{creneau_index}"
                        )

    for promo, courses in promo_courses_info.items():
        for course in courses:
            course_name = course["cours"]
            total_heures = course["volume_horaire"]

            model.Add(
                sum(
                    creneau_occupe[(promo, course_name, semaine_index, jour_index, creneau_index)]
                    for semaine_index, semaine in enumerate(calendar_info[promo])
                    for jour_index in range(len(semaine["jours_travailles"]))
                    for creneau_index in range(len(creneaux_horaires))
                ) == int(total_heures)
            )

    for promo in promo_courses_info.keys():
        for semaine_index, semaine in enumerate(calendar_info[promo]):
            for jour_index in range(len(semaine["jours_travailles"])):
                for creneau_index in range(len(creneaux_horaires)):
                    model.Add(
                        sum(
                            creneau_occupe[(promo, course["cours"], semaine_index, jour_index, creneau_index)]
                            for course in promo_courses_info[promo]
                        ) <= 1
                    )

    solver = cp_model.CpSolver()
    status = solver.Solve(model)
    if status != cp_model.OPTIMAL and status != cp_model.FEASIBLE:
        print("\n❌ Aucune solution trouvée.")
        return []

    output = generate_schedule_output(data, solver, creneaux_horaires, creneau_occupe, promo_courses_info, calendar_info)
    
    return output
