from fastapi import FastAPI
from typing import List
from datetime import datetime
from data import RequestData, CalendrierOutput, CoursOutput, JourCalendrierOutput, PromoCalendrierOutput


app = FastAPI(
    title="Planning Microservice",
    description="API for OR-Tools optimization",
    version="1.0",
    docs_url="/swagger", 
    redoc_url="/api-docs" 
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the OR-Tools planning API"}


# -------------------------------------
# API Endpoint
# -------------------------------------
@app.post("/getDataEdtMicro", response_model=List[CalendrierOutput], summary="Generate a weekly schedule")
def get_data_edt_micro(data: RequestData):
    """
    Generates a structured schedule based on the provided data.

    - **Promos**: List of promotions with students and courses
    - **Salles**: Available classrooms with capacity and type
    - **Profs**: Professors with their availability
    - **Calendrier**: The schedule's structure

    **Response Format:**
    - Returns a structured schedule with courses, professors, and rooms for each day.
    """
    result = []

    return result
