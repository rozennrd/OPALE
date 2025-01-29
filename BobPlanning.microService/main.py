from fastapi import FastAPI

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