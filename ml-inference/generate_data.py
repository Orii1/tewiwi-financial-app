import pandas as pd
import random
from datetime import datetime, timedelta

random.seed(42)
start_date = datetime(2026, 1, 1)
n_records = 150

descriptions_income = [
    "Penjualan Roti Sobek Keju", "Orderan Kue Tart Coklat", "Penjualan Pastry Croissant",
    "Paket Hampers Lebaran/Natal", "Penjualan Roti Tawar Spesial", "Catering Snack Box Arisan",
    "Penjualan Donat Gula", "Pesanan Brownies Kukus", "Penjualan Roti Manis Aneka Rasa"
]

descriptions_expense = [
    "Beli Tepung Terigu 25kg", "Belanja Gula Pasir & Mentega", "Bayar Listrik Toko Bulanan",
    "Beli Kemasan Box Dus Roti", "Gaji Karyawan Shift Pagi", "Belanja Telur Ayam Fresh",
    "Beli Cokelat Batang & Keju", "Biaya Gas LPG 12kg", "Iklan Sponsored Instagram Ads"
]

data = []

for _ in range(n_records):
    days_offset = random.randint(0, 90)
    trx_date = start_date + timedelta(days=days_offset)
    
    if random.random() < 0.6:
        trx_type = "Pemasukan"
        desc = random.choice(descriptions_income)
        nominal = random.randint(50000, 750000)
        category = "Penjualan"
    else:
        trx_type = "Pengeluaran"
        desc = random.choice(descriptions_expense)
        nominal = random.randint(100000, 2000000)
        

        if "Tepung" in desc or "Gula" in desc or "Telur" in desc or "Cokelat" in desc or "Mentega" in desc:
            category = "Bahan Baku (Ingredients)"
        elif "Listrik" in desc or "Gas" in desc:
            category = "Operasional"
        elif "Box" in desc:
            category = "Packaging"
        elif "Gaji" in desc:
            category = "SDM / Gaji"
        elif "Iklan" in desc:
            category = "Marketing"
        else:
            category = "Lainnya"

    data.append({
        "tanggal": trx_date.strftime("%Y-%m-%d"),
        "deskripsi": desc,
        "nominal": nominal,
        "tipe_transaksi": trx_type,
        "kategori": category
    })

df = pd.DataFrame(data)

import os
os.makedirs("data", exist_ok=True)


file_path = "data/transactions_dummy.csv"
df.to_csv(file_path, index=False)
print(f"Berhasil! Dataset sintetis tersimpan di '{file_path}' dengan total {len(df)} baris data.")