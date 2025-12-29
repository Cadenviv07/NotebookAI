from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Annotated 
import shutil
import os
import random  
import time
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Backend is running!"}

def mock_ai_analyze(filename: str):
    time.sleep(1.5) 
    
    responses = [
        "I see you drew a circle! That represents unity.",
        "This looks like a math problem. The answer is 42.",
    ]
    return random.choice(responses)

last_requested_time = 0
Cooldown_seconds = 10

@app.post("/process-drawing")
async def process_drawing(file: Annotated[UploadFile, File()]):
    global last_requested_time

    current_time = time.time()
    time_passed = current_time - last_requested_time

    if time_passed < Cooldown_seconds:
        wait_time = int(Cooldown_seconds - time_passed)
        raise HTTPException(
            status_code=429, 
            detail=f"Please wait {wait_time} more seconds."
        )
    
    last_requested_time = current_time

    os.makedirs("uploads", exist_ok=True)
    
    file_location = f"uploads/{file.filename}"

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    print(f"Success! Saved image to {file_location}")

    ai_text = mock_ai_analyze(file.filename)
    
    return {
        "status": "success", 
        "message": "Image received", 
        "ai_reply": ai_text 
    }