from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# -------------------------------------
# Request Data Model (Input)
# -------------------------------------
class Heure(BaseModel):
    """
    Represents different types of class hours in a course.
    """
    total: Optional[float] = None
    totalAvecProf: Optional[float] = None
    coursMagistral: Optional[float] = None
    coursInteractif: Optional[float] = None
    td: Optional[float] = None
    tp: Optional[float] = None
    projet: Optional[float] = None
    elearning: Optional[float] = None

class CoursInput(BaseModel):
    """
    Defines a course with its properties.
    """
    name: str  # Course name
    UE: str  # Teaching unit
    prof: str
    semestre: List[int]  # Semester numbers
    periode: List[int]  # Period numbers
    # Prof: str  # Assigned professor
    # typeSalle: str  # Type of classroom required
    heure: Heure  # Hour breakdown for the course

class PromoInput(BaseModel):
    """
    Represents a promotion (batch of students).
    """
    name: str  # Promotion name
    nombreEtudiants: int  # Number of students
    cours: List[CoursInput]  # List of courses in this promotion

class SalleInput(BaseModel):
    """
    Represents a classroom.
    """
    ID: str  # Unique room ID
    type: str  # Room type (e.g., Lecture Hall, Lab)
    capacite: float  # Capacity of the room

class ProfInput(BaseModel):
    """
    Defines a professor with their availability.
    """
    ID: str  # Unique professor ID
    name: str  # Professor's name
    type: str  # Type (e.g., Permanent, Visiting)
    dispo: List[str]  # Availability slots

class JourCalendrierInput(BaseModel):
    """
    Represents a day in the schedule.
    """
    jour: str  # Date of the schedule (ISO format)
    enCours: bool  # Whether classes are ongoing
    message: str  # Additional message
    cours: Optional[List] = None  # Placeholder for course details

class PromoCalendrierInput(BaseModel):
    """
    Contains the weekly schedule for a promotion.
    """
    name: str  # Promotion name
    semaine: List[JourCalendrierInput]  # List of scheduled days
    semaine: List[JourCalendrierInput]  # List of scheduled days

class CalendrierInput(BaseModel):
    """
    Represents the overall schedule.
    """
    dateDebut: datetime  # Schedule start date
    promos: List[PromoCalendrierInput]  # List of promotions included
    promos: List[PromoCalendrierInput]  # List of promotions included

class RequestData(BaseModel):
    """
    The full request structure expected by the API.
    """
    Promos: List[PromoInput]  # List of promotions
    Salles: List[SalleInput]  # List of available rooms
    Profs: List[ProfInput]  # List of professors
    Calendrier: List[CalendrierInput]  # The timetable

class CoursOutput(BaseModel):
    """
    Represents a scheduled course.
    """
    matiere: str  # Subject
    heureDebut: str  # Start time
    heureFin: str  # End time
    professeur: str  # Professor's name
    salleDeCours: str  # Classroom name

class JourCalendrierOutput(BaseModel):
    """
    Represents a day's schedule in the response.
    """
    jour: str
    enCours: bool
    message: str
    cours: List[CoursOutput]

class PromoCalendrierOutput(BaseModel):
    """
    Defines the weekly schedule for a promotion.
    """
    name: str
    semaine: List[JourCalendrierOutput]

class CalendrierOutput(BaseModel):
    """
    Represents the final schedule returned by the API.
    """
    dateDebut: datetime
    promos: List[PromoCalendrierOutput]