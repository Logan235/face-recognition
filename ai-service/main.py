from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import cv2
import face_recognition
import io
import json

app = FastAPI(title="Face Recognition AI Service", version="1.0")

# Cho phép CORS để gọi từ NestJS backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Face Recognition AI Service is running!"}

@app.post("/api/ai/extract-encoding")
async def extract_encoding(file: UploadFile = File(...)):
    """
    Nhận 1 bức ảnh khuôn mặt, trích xuất ra face embedding (vector 128 chiều)
    """
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file")

        # Chuyển đổi BGR sang RGB
        rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Tìm khuôn mặt và encoding
        face_locations = face_recognition.face_locations(rgb_img, model="hog")
        if not face_locations:
            raise HTTPException(status_code=400, detail="No face detected in the image")
            
        encodings = face_recognition.face_encodings(rgb_img, face_locations)
        if not encodings:
            raise HTTPException(status_code=400, detail="Could not extract face encoding")
            
        # Trả về vector 128 chiều dưới dạng list
        return {
            "success": True,
            "encoding": encodings[0].tolist()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/recognize")
async def recognize_face(file: UploadFile = File(...)):
    """
    Nhận frame ảnh từ camera web, phát hiện và trả về bounding box + vector để so sánh ở NestJS
    """
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file")

        rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_img, model="hog")
        face_encodings = face_recognition.face_encodings(rgb_img, face_locations)
        
        results = []
        for (top, right, bottom, left), encoding in zip(face_locations, face_encodings):
            results.append({
                "box": {"top": top, "right": right, "bottom": bottom, "left": left},
                "encoding": encoding.tolist()
            })
            
        return {
            "success": True,
            "faces": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
