from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Annotated
from dotenv import load_dotenv
import google.generativeai as genai
import shutil
import os
import time


load_dotenv() 

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("GEMINI_API_KEY is empty or missing.")
else:
  
    print(f"API Key found: {api_key[:5]}*******")
    
   
    genai.configure(api_key=api_key)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


last_request_time = 0
COOLDOWN_SECONDS = 5


def ask_gemini(image_path: str):
    
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    print("Uploading file to Gemini...")
    sample_file = genai.upload_file(path=image_path, display_name="User Drawing")
    
    print("Generating response...")
   
    response = model.generate_content([sample_file, "You are a smart teaching assistant. Analyze this image. If it's a math problem, solve it. If it's a diagram, explain it clearly."])
    
    return response.text


@app.post("/process-drawing")
async def process_drawing(file: Annotated[UploadFile, File()]):
    global last_request_time
    
    # Check cooldown
    current_time = time.time()
    if (current_time - last_request_time) < COOLDOWN_SECONDS:
        raise HTTPException(status_code=429, detail="Please wait a few seconds.")
    last_request_time = current_time

    # Create uploads folder if missing
    os.makedirs("uploads", exist_ok=True)
    
    # Save the file
    file_location = f"uploads/{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Run the AI
    if not api_key:
        return {"status": "error", "ai_reply": "Server configuration error: API Key missing."}

    try:
        reply = ask_gemini(file_location)
        print(f"AI Success: {reply[:50]}...")
        return {"status": "success", "ai_reply": reply}
        
    except Exception as e:
        print(f"AI Failed: {e}")
        return {"status": "error", "ai_reply": f"AI Error: {str(e)}"}