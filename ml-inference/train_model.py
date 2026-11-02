import pandas as pd
import os
import pickle
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score

print("1. Memuat dataset sintetis...")
data_path = "data/transactions_dummy.csv"
if not os.path.exists(data_path):
    print(f"Error: File {data_path} tidak ditemukan! Jalankan generate_data.py terlebih dahulu.")
    exit()

df = pd.read_csv(data_path)

df_expense = df[df['tipe_transaksi'] == 'Pengeluaran'].copy()

X = df_expense['deskripsi']
y = df_expense['kategori']

print(f"Jumlah data pelatihan pengeluaran: {len(X)} baris.")

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("2. Melatih model Machine Learning...")
vectorizer = TfidfVectorizer(max_features=1000, ngram_range=(1, 2))
X_train_tfidf = vectorizer.fit_transform(X_train)

model = LogisticRegression()
model.fit(X_train_tfidf, y_train)

X_test_tfidf = vectorizer.transform(X_test)
y_pred = model.predict(X_test_tfidf)

print("\n--- Evaluasi Performa Model ---")
print(f"Akurasi Model: {accuracy_score(y_test, y_pred) * 100:.2f}%")
print("\nClassification Report:")
print(classification_report(y_test, y_pred, zero_division=0))

os.makedirs("models", exist_ok=True)
pickle.dump(model, open("models/classifier_model.pkl", "wb"))
pickle.dump(vectorizer, open("models/tfidf_vectorizer.pkl", "wb"))

print("\nSukses! Artefak model dan vectorizer berhasil disimpan di folder 'models/'.")