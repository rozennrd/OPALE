from fastapi import FastAPI
from typing import List
from data import RequestData, CalendrierOutput
from generatorEDT import generate_schedule 


app = FastAPI(
    title="Planning Microservice",
    description="API for OR-Tools optimization",
    version="1.0",
    docs_url="/swagger", 
    redoc_url="/api-docs" 
)

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
    result = generate_schedule(data)

    return result
