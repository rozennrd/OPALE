from datetime import datetime, timedelta
import json
import math
from data import RequestData, CalendrierOutput, PromoCalendrierOutput, JourCalendrierOutput, CoursOutput
from typing import List, Dict
from ortools.sat.python import cp_model


#Fonction pour convertir "Lundi", "Mardi", etc. en un vrai datetime
def convertir_jour_en_datetime(jour_str: str, base_date: datetime) -> datetime:
    jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]
    if jour_str not in jours:
        raise ValueError(f"Jour inconnu : {jour_str}")  # Sécurise contre une erreur
    delta = jours.index(jour_str)  # Trouve le décalage par rapport à base_date
    return base_date + timedelta(days=delta)

def extract_calendar_info(data: RequestData) :
    """
    Extrait les jours travaillés pour chaque promo et les formate en une structure claire.
    """
    # Stocker les promos avec des plannings vides 
    promo_plannings = {promo.name: [] for promo in data.Promos}
    
    # Parcourir le calendrier pour récupérer les jours travaillés
    for cal in data.Calendrier:
        base_date = cal.dateDebut  # Récupère la date de début du calendrier

        for promo_cal in cal.promos:
            jours_travailles = [jour for jour in promo_cal.semaine if jour.enCours]

            #Conversion en `JourCalendrierOutput` avec une vraie date
            jours_travailles_output = [
                JourCalendrierOutput(
                    jour=convertir_jour_en_datetime(jour.jour, base_date),  # Convertit "Lundi" → date
                    enCours=jour.enCours, 
                    message=jour.message, 
                    cours=[CoursOutput(matiere="", heureDebut="", heureFin="", professeur="", salleDeCours="")]  # Placeholder
                ) for jour in jours_travailles
            ]

            if promo_cal.name in promo_plannings:
                promo_plannings[promo_cal.name].extend(jours_travailles_output)
            else:
                print(f"⚠️ Promo {promo_cal.name} introuvable dans la liste des promotions.")
                
    return promo_plannings
    
def extract_courses_info(data: RequestData) -> Dict[str, List[Dict[str, float]]]:
    """
    Extrait les informations sur les cours et leur volume horaire total pour chaque promo.
    """
    promo_courses_info = {}

    for promo in data.Promos:
        courses_info = []

        for course in promo.Cours:
            total_hours = sum([heure.total for heure in course.heure if heure.total is not None]) #TODO : a revoir pour les heures

            courses_info.append({
                "cours": course.name,
                "volume_horaire": total_hours
            })

        promo_courses_info[promo.name] = courses_info

    return promo_courses_info


def generate_schedule(data: RequestData = None) -> List[CalendrierOutput]:
    print("✅ Fonction generate_schedule appelée avec les données :")
    
    # Charger les données mockées si `data` est None
    if data is None:
        with open("MockedData.json", "r") as file:
            mocked_data = json.load(file)
        data = RequestData(**mocked_data)
            
    # Extraction des données
    promos = data.Promos
    salles = data.Salles
    profs = data.Profs
    calendrier = data.Calendrier
    
    # Création du modèle OR-Tools
    model = cp_model.CpModel()
    
    
    # Extraction des jours travaillés pour chaque promo
    promo_calendar_info = extract_calendar_info(data)
    # ✅ Vérification des jours travaillés par promo
    print("\n📌 Vérification des jours travaillés par promo (debug) :")
    for promo, jours in promo_calendar_info.items():
        print(f"Promo : {promo} - Jours : {len(jours)} jours travaillés")

    # Affichage des informations sur les jours travaillés
    # print("\n📅 Jours travaillés par promo :")
    # for promo, jours in promo_calendar_info.items():
    #     jours_formates = [jour.jour.strftime("%A %d-%m-%Y") for jour in jours]  # Convertit en format lisible
    #     print(f"📌 Promo : {promo} - Jours travaillés : {jours_formates if jours_formates else '⚠️ Aucun jour travaillé'}")

    
    
         
    # Extraction des variables nécessaires pour la programmation par contrainte
    promo_courses_info = extract_courses_info(data)
    
    
    # Affichage des informations sur les cours pour toutes les promos
    # print("\n📊 Variables pour la programmation par contrainte :")
    # for promo, courses in promo_courses_info.items():
    #     print(f"📌 Promo : {promo}")
    #     for course in courses:
    #         print(f"   - {course['cours']} : {course['volume_horaire']} heures")
            
            
    # Dictionnaire des variables de placement des cours et des heures
    cours_par_jour = {}
    heures_par_jour = {}

    for promo, courses in promo_courses_info.items():
        jours_travailles = promo_calendar_info[promo]  # Récupérer les jours travaillés

        for course in courses:
            course_name = course["cours"]
            total_heures = course["volume_horaire"]

            for jour_index, jour in enumerate(jours_travailles):
                # Variable binaire : 1 si le cours est placé ce jour, 0 sinon
                var_name = f"{promo}_{course['cours']}_jour_{jour_index}"
                cours_par_jour[var_name] = model.NewBoolVar(var_name)
        
                # Variable d'heures associée (combien d'heures sont allouées ce jour)
                var_heure_name = f"heures_{promo}_{course_name}_jour_{jour_index}"
                heures_par_jour[var_heure_name] = model.NewIntVar(0, math.ceil(total_heures), var_heure_name)
                
    # print("\n📌 Variables d'heures créées :")
    # for var in heures_par_jour:
    #     print(f"  - {var}")
    
    #Contraintes
    # Contraintes : Un cours ne peut pas être enseigné plus d'un certain nombre de jours

    for promo, courses in promo_courses_info.items():
        jours_travailles = promo_calendar_info[promo]  # Liste des jours travaillés

        for course in courses:
            course_name = course["cours"]
            total_heures = math.ceil(course["volume_horaire"])  # On arrondit pour éviter les erreurs


            # Ne pas dépasser le volume total d'heures du cours
            model.Add(sum(heures_par_jour[f"heures_{promo}_{course_name}_jour_{jour_index}"]
                        for jour_index in range(len(jours_travailles))) == total_heures)

            # Ne pas dépasser 8h/jour
            for jour_index in range(len(jours_travailles)):
                model.Add(heures_par_jour[f"heures_{promo}_{course_name}_jour_{jour_index}"] <= 8)
    
    
    
    # Création du solveur
    solver = cp_model.CpSolver()

    # Résolution du modèle
    status = solver.Solve(model)
    
    
    
    # Vérification du résultat
    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        print("\n✅ Solution trouvée :")

        # Affichage des résultats
        for promo, courses in promo_courses_info.items():
            print(f"\n📌 Promo : {promo}")
            

            for course in courses:
                course_name = course["cours"]

                print(f"  📚 {course_name}:")
                for jour_index, jour in enumerate(promo_calendar_info[promo]):
                    heures_var = heures_par_jour[f"heures_{promo}_{course_name}_jour_{jour_index}"]
                    heures_assignees = solver.Value(heures_var)

                    if heures_assignees > 0:
                        print(f"    - {jour.jour.strftime('%A %d-%m-%Y')}: {heures_assignees}h")

    else:
        print("\n❌ Aucune solution trouvée.")
        
        
        
    
    # Construire la structure de sortie
    calendrier_resultat = []
    for cal in calendrier:
        promo_results = [
            PromoCalendrierOutput(name=promo_name, semaine=jours)
            for promo_name, jours in promo_calendar_info.items()
        ]
        
        calendrier_resultat.append(
            CalendrierOutput(dateDebut=cal.dateDebut, promos=promo_results)
        )
        
            
    return calendrier_resultat
