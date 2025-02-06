from datetime import datetime, timedelta
import json
import math
from data import RequestData, CalendrierOutput, PromoCalendrierOutput, JourCalendrierOutput, CoursOutput
from typing import List, Dict
from ortools.sat.python import cp_model

# Fonction pour convertir "Lundi", "Mardi", etc. en un vrai datetime
def convertir_jour_en_datetime(jour_str: str, base_date: datetime) -> datetime:
    jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]
    if jour_str not in jours:
        raise ValueError(f"Jour inconnu : {jour_str}")  # Sécurise contre une erreur
    delta = jours.index(jour_str)  # Trouve le décalage par rapport à base_date
    return base_date + timedelta(days=delta)

def extract_calendar_info(data: RequestData) -> Dict[str, List[JourCalendrierOutput]]:
    """
    Extrait les jours travaillés pour chaque promo et les formate en une structure claire.
    """
    promo_plannings = {promo.name: [] for promo in data.Promos}

    print("\n🔍 [DEBUG] Vérification des promotions et des matières")
    
    for promo in data.Promos:
        print(f"📌 Promo : {promo.name}")
        for course in promo.Cours:
            total_hours = sum([heure.total for heure in course.heure if heure.total is not None])
            print(f"   📚 {course.name} - Volume horaire : {total_hours}h")
    
    print("\n📅 [DEBUG] Vérification des jours travaillés par promo")
    
    for cal in data.Calendrier:
        base_date = cal.dateDebut
        for promo_cal in cal.promos:
            jours_travailles = [jour for jour in promo_cal.semaine if jour.enCours]
            
            jours_travailles_output = [
                JourCalendrierOutput(
                    jour=convertir_jour_en_datetime(jour.jour, base_date),
                    enCours=jour.enCours, 
                    message=jour.message, 
                    cours=[]  # On laisse vide pour être rempli après
                ) for jour in jours_travailles
            ]

            promo_plannings[promo_cal.name].extend(jours_travailles_output)

            # Affichage des jours travaillés
            jours_formates = [jour.jour.strftime("%A %d-%m-%Y") for jour in jours_travailles_output]
            print(f"📌 Promo : {promo_cal.name} - Jours travaillés : {jours_formates if jours_formates else '⚠️ Aucun jour travaillé'}")

    return promo_plannings

def extract_courses_info(data: RequestData) -> Dict[str, List[Dict[str, float]]]:
    """
    Extrait les informations sur les cours et leur volume horaire total pour chaque promo.
    """
    promo_courses_info = {}
    for promo in data.Promos:
        courses_info = [
            {
                "cours": course.name,
                "volume_horaire": sum([heure.total for heure in course.heure if heure.total is not None])
            }
            for course in promo.Cours
        ]
        promo_courses_info[promo.name] = courses_info
    return promo_courses_info

def generate_schedule(data: RequestData) -> List[CalendrierOutput]:
    print("✅ Fonction generate_schedule appelée avec les données :")
    
    model = cp_model.CpModel()  # Création du modèle de contraintes
    
    promo_calendar_info = extract_calendar_info(data)  # Jours travaillés
    promo_courses_info = extract_courses_info(data)  # Infos sur les cours
    
    # Créneaux horaires disponibles (1h chacun)
    creneaux_horaires = [f"{h}:00-{h+1}:00" for h in range(8, 18)]
    
    
    
    # Dictionnaires de variables de décision
    heures_par_jour = {}  # Associe un nombre d'heures de cours par jour
    cours_par_creneau = {}  # Associe un créneau horaire à un cours donné
    
    # ✅ Définition des variables de décision pour chaque promo et matière
    for promo, courses in promo_courses_info.items():
        jours_travailles = promo_calendar_info[promo]
        
        for course in courses:
            course_name = course["cours"]
            total_heures = course["volume_horaire"]
            
            for jour_index, jour in enumerate(jours_travailles):
                # Variable pour suivre les heures de cours par jour
                var_heure_name = f"heures_{promo}_{course_name}_jour_{jour_index}"
                heures_par_jour[var_heure_name] = model.NewIntVar(0, math.ceil(total_heures), var_heure_name)
                
                for creneau_index, creneau in enumerate(creneaux_horaires):
                    # Variable binaire : 1 si le cours est placé dans ce créneau, 0 sinon
                    var_creneau_name = f"creneau_{promo}_{course_name}_jour_{jour_index}_creneau_{creneau_index}"
                    cours_par_creneau[var_creneau_name] = model.NewBoolVar(var_creneau_name)
    
    # ✅ Contraintes : Volume horaire respecté
    for promo, courses in promo_courses_info.items():
        jours_travailles = promo_calendar_info[promo]
        
        for course in courses:
            course_name = course["cours"]
            total_heures = math.ceil(course["volume_horaire"])
            
            # Somme des heures allouées sur tous les jours == total demandé
            model.Add(sum(heures_par_jour[f"heures_{promo}_{course_name}_jour_{jour_index}"]
                         for jour_index in range(len(jours_travailles))) == total_heures)
            
            for jour_index in range(len(jours_travailles)):
                # Maximum 8h de cours par jour pour une matière
                model.Add(heures_par_jour[f"heures_{promo}_{course_name}_jour_{jour_index}"] <= 8)
    
    # ✅ Contraintes : Créneaux horaires
    for promo, jours_travailles in promo_calendar_info.items():
        for jour_index in range(len(jours_travailles)):
            # La somme des cours dans une journée ne doit pas dépasser 8h
            model.Add(sum(heures_par_jour[f"heures_{promo}_{course['cours']}_jour_{jour_index}"]
                          for course in promo_courses_info[promo]) <= 8)
    
            for course in promo_courses_info[promo]:
                course_name = course["cours"]
                total_heure_du_jour = sum(
                    cours_par_creneau[f"creneau_{promo}_{course_name}_jour_{jour_index}_creneau_{creneau_index}"]
                    for creneau_index in range(len(creneaux_horaires))
                )
                model.Add(total_heure_du_jour == heures_par_jour[f"heures_{promo}_{course_name}_jour_{jour_index}"])
            
    # ✅ Résolution du modèle
    solver = cp_model.CpSolver()
    status = solver.Solve(model)
    
    
    calendrier_resultat = []
    
    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        print("\n✅ Solution trouvée :")
        for promo, courses in promo_courses_info.items():
            print(f"\n📌 Promo : {promo}")
            for course in courses:
                course_name = course["cours"]
                print(f"  📚 {course_name}:")
                for jour_index, jour in enumerate(promo_calendar_info[promo]):
                    heures_assignees = solver.Value(heures_par_jour[f"heures_{promo}_{course_name}_jour_{jour_index}"])
                    if heures_assignees > 0:
                        print(f"    - {jour.jour.strftime('%A %d-%m-%Y')}: {heures_assignees}h")
                        
                    # 🔹 Affichage des créneaux utilisés
                    creneaux_utilises = [
                        creneaux_horaires[creneau_index]
                        for creneau_index in range(len(creneaux_horaires))
                        if solver.Value(cours_par_creneau[f"creneau_{promo}_{course_name}_jour_{jour_index}_creneau_{creneau_index}"]) == 1
                    ]
                    
                    print(f"      🕒 Créneaux assignés : {', '.join(creneaux_utilises)}")
                    
        for cal in data.Calendrier:
            promo_results = []

            for promo in data.Promos:
                jours_results = []

                for jour_index, jour in enumerate(promo_calendar_info[promo.name]):
                    cours_results = []

                    for course in promo_courses_info[promo.name]:
                        course_name = course["cours"]
                        heures_assignees = solver.Value(heures_par_jour[f"heures_{promo.name}_{course_name}_jour_{jour_index}"])

                        if heures_assignees > 0:
                            # Déterminer les créneaux assignés
                            creneaux_assignes = [
                                creneaux_horaires[creneau_index]
                                for creneau_index in range(len(creneaux_horaires))
                                if solver.Value(cours_par_creneau[f"creneau_{promo.name}_{course_name}_jour_{jour_index}_creneau_{creneau_index}"]) == 1
                            ]

                            # Ajouter le cours avec créneaux assignés
                            cours_results.append(CoursOutput(
                                matiere=course_name,
                                heureDebut=creneaux_assignes[0].split("-")[0] if creneaux_assignes else "",
                                heureFin=creneaux_assignes[-1].split("-")[1] if creneaux_assignes else "",
                                professeur="Prof inconnu",  # À adapter si nécessaire
                                salleDeCours="Salle inconnue"  # À adapter si nécessaire
                            ))

                    # Construire la structure du jour
                    jours_results.append(JourCalendrierOutput(
                        jour=jour.jour,
                        enCours=jour.enCours,
                        message=jour.message,
                        cours=cours_results
                    ))

                # Construire la structure de la promo
                promo_results.append(PromoCalendrierOutput(
                    name=promo.name,
                    semaine=jours_results
                ))

            # Construire la structure de l'ensemble du calendrier
            calendrier_resultat.append(CalendrierOutput(
                dateDebut=cal.dateDebut,
                promos=promo_results
            ))

    else:
        print("\n❌ Aucune solution trouvée.")
    
    return calendrier_resultat  # TODO: Remplir la structure de retour correcte
