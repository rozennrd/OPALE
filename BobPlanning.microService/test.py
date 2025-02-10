import json
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime

def load_json(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        return json.load(file)

def extract_schedule(data):
    schedule_by_promo = {}
    for week in data:
        for promo in week["promos"]:
            promo_name = promo["name"]
            if promo_name not in schedule_by_promo:
                schedule_by_promo[promo_name] = []
            
            for day in promo["semaine"]:
                date = datetime.strptime(day["jour"], "%Y-%m-%dT%H:%M:%SZ").date()
                for course in day["cours"]:
                    schedule_by_promo[promo_name].append({
                        "Date": date,
                        "Matiere": course["matiere"],
                        "HeureDebut": course["heureDebut"],
                        "HeureFin": course["heureFin"],
                        "Professeur": course["professeur"],
                        "Salle": course["salleDeCours"]
                    })
    return schedule_by_promo

def plot_schedule(schedule_by_promo):
    for promo, schedule in schedule_by_promo.items():
        df = pd.DataFrame(schedule)
        df.sort_values(by=["Date", "HeureDebut"], inplace=True)
        df["HeureDebut"] = pd.to_datetime(df["HeureDebut"], format="%H:%M").dt.time
        df["HeureFin"] = pd.to_datetime(df["HeureFin"], format="%H:%M").dt.time
        
        fig, ax = plt.subplots(figsize=(10, 6))
        ax.xaxis.set_major_locator(mdates.DayLocator())
        ax.xaxis.set_major_formatter(mdates.DateFormatter('%A'))
        
        for _, row in df.iterrows():
            start = datetime.combine(row["Date"], row["HeureDebut"])
            end = datetime.combine(row["Date"], row["HeureFin"])
            ax.barh(row["Date"], (end - start).seconds / 3600, left=start.hour + start.minute / 60, label=row["Matiere"])
        
        ax.set_xlabel("Heure")
        ax.set_ylabel("Jour")
        ax.set_title(f"Emploi du temps - {promo}")
        plt.legend()
        plt.grid()
        plt.show()

if __name__ == "__main__":
    file_path = "test.json"  # Remplace par le chemin de ton fichier JSON
    data = load_json(file_path)
    schedule_by_promo = extract_schedule(data)
    plot_schedule(schedule_by_promo)
