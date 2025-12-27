from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

#CORS Security for port 3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],#Get, Post etc
    allow_headers=["*"], # Date can be JSON etc
)

@app.get("/")
def read_root():
    return {"message": "Backend is running!"}


@app.post("/process-drawing")
def process_drawing(data: dict):
    print("Received data from frontend:", data)
    return {"status": "success", "reply": "Sent!"}
