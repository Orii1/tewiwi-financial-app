from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pickle
import os

app = FastAPI(
    title="Tewiwi Financial ML Inference API",
    description="API untuk klasifikasi kategori transaksi F&B menggunakan Machine Learning",
    version="1.0"
)

# Load model dan vectorizer yang sudah di-training sebelumnya
MODEL_PATH = "models/classifier_model.pkl"
VECTORIZER_PATH = "models/tfidf_vectorizer.pkl"

if not os.path.exists(MODEL_PATH) or not os.path.exists(VECTORIZER_PATH):
    raise RuntimeError("File model atau vectorizer belum ditemukan! Jalankan train_model.py terlebih dahulu.")

model = pickle.load(open(MODEL_PATH, "rb"))
vectorizer = pickle.load(open(VECTORIZER_PATH, "rb"))

# Pydantic schema untuk request body
class TransactionRequest(BaseModel):
    deskripsi: str

@app.get("/")
def home():
    return {"message": "Selamat datang di Tewiwi Financial ML Inference Service!"}

@app.post("/predict-category")
def predict_category(data: TransactionRequest):
    try:
        # Ubah teks deskripsi menggunakan TF-IDF vectorizer
        X_input = vectorizer.transform([data.deskripsi])
        
        # Prediksi kategori menggunakan model logistic regression
        prediction = model.predict(X_input)[0]
        
        # Hitung confidence score (probabilitas tertinggi)
        probabilities = model.predict_proba(X_input)
        confidence = float(max(probabilities[0]))

        return {
            "deskripsi": data.deskripsi,
            "kategori_prediksi": prediction,
            "confidence_score": round(confidence * 100, 2)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))