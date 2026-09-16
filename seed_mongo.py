from datetime import datetime
import random
import numpy as np
from pymongo import MongoClient

# ==========================
# CONFIG – change DB_NAME / URI if needed
# ==========================
MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "supply-demand"  # <-- set this to match config.MONGO_URI

NUM_PRODUCTS = 1000
NUM_LOCATIONS = 100

random.seed(42)
np.random.seed(42)

# ==========================
# CONNECT TO MONGO
# ==========================
client = MongoClient(MONGO_URI)
db = client[DB_NAME]

products_col = db["products"]
locations_col = db["locations"]
stock_col = db["stocks"]  # or "stock" depending on your model/collection name

# If your model name is "Stock", Mongo will default to "stocks".
# If in doubt, check once in Mongo shell / Compass.

print(f"Connected to MongoDB: {MONGO_URI}, DB: {DB_NAME}")

# ==========================
# CLEAR OLD DATA (CAREFUL)
# ==========================
products_col.drop()
locations_col.drop()
stock_col.drop()
print("Dropped old products, locations, stock collections (if existed).")

# ==========================
# 1. SEED PRODUCTS
# ==========================
categories = {
    "Shirts": [
        "Men's Slim Fit Shirt", "Women's Casual Top", "Formal Cotton Shirt",
        "Checked Casual Shirt", "Linen Summer Shirt"
    ],
    "Pants": [
        "Men's Chinos", "Women's Skinny Jeans", "Formal Trousers",
        "Jogger Pants", "Cargo Pants"
    ],
    "Shoes": [
        "Running Shoes", "Casual Sneakers", "Formal Leather Shoes",
        "Sandals", "Sports Training Shoes"
    ],
    "Accessories": [
        "Leather Wallet", "Analog Wrist Watch", "Backpack",
        "Cap", "Sunglasses"
    ],
    "Electronics": [
        "Bluetooth Headphones", "Wireless Mouse", "Smartwatch",
        "Power Bank 10000mAh", "Bluetooth Speaker"
    ],
    "Grocery": [
        "Basmati Rice 5kg", "Sunflower Oil 1L", "Wheat Flour 5kg",
        "Instant Noodles Pack", "Coffee Powder 200g"
    ]
}
category_list = list(categories.keys())

product_docs = []
now = datetime.utcnow()

for i in range(1, NUM_PRODUCTS + 1):
    product_id = f"P{str(i).zfill(4)}"  # business ID

    cat = random.choice(category_list)
    base_name = random.choice(categories[cat])
    variant = random.choice(["", "", "", " - Premium", " - Value Pack", " - Combo"])
    name = f"{base_name}{variant}"

    # category-based price range
    if cat in ["Shirts", "Pants"]:
        price = round(np.random.uniform(400, 2500), 2)
    elif cat == "Shoes":
        price = round(np.random.uniform(800, 4000), 2)
    elif cat == "Accessories":
        price = round(np.random.uniform(200, 3000), 2)
    elif cat == "Electronics":
        price = round(np.random.uniform(500, 8000), 2)
    else:  # Grocery
        price = round(np.random.uniform(50, 1500), 2)

    product_docs.append({
        "productId": product_id,                   # <--- matches your schema
        "name": name,
        "category": cat,
        "price": float(price),
        "description": f"Synthetic description for {name} in category {cat}",
        "createdAt": now,
        "updatedAt": now
    })

result = products_col.insert_many(product_docs)
product_ids = result.inserted_ids   # list of ObjectIds
print(f"Inserted {len(product_ids)} products.")

# Map business productId -> ObjectId
productId_to_objId = {
    doc["productId"]: _id
    for doc, _id in zip(product_docs, product_ids)
}

# ==========================
# 2. SEED LOCATIONS
# ==========================
tier1_cities = ["Chennai", "Bengaluru", "Hyderabad", "Mumbai", "Delhi", "Kolkata"]
tier2_cities = ["Pune", "Ahmedabad", "Jaipur", "Coimbatore", "Madurai", "Vizag"]
all_cities = tier1_cities + tier2_cities

location_docs = []

for i in range(1, NUM_LOCATIONS + 1):
    location_id = f"L{str(i).zfill(3)}"  # business ID

    city = random.choice(all_cities)
    name = f"Store {location_id} - {city}"
    address = f"{random.randint(1, 200)}, Main Road, {city}"

    # Rough India bounding box
    latitude = round(np.random.uniform(8.0, 28.0), 6)
    longitude = round(np.random.uniform(68.0, 88.0), 6)

    tier = "tier1" if city in tier1_cities else "tier2"

    location_docs.append({
        "locationId": location_id,                # <--- matches new schema
        "name": name,
        "city": city,
        "address": address,
        "latitude": float(latitude),
        "longitude": float(longitude),
        "tier": tier,
        "createdAt": now
    })

result = locations_col.insert_many(location_docs)
location_ids = result.inserted_ids
print(f"Inserted {len(location_ids)} locations.")

# Map business locationId -> ObjectId
locationId_to_objId = {
    doc["locationId"]: _id
    for doc, _id in zip(location_docs, location_ids)
}

# ==========================
# 3. SEED STOCK (current on-hand)
# ==========================
stock_docs = []

productId_list = list(productId_to_objId.keys())
locationId_list = list(locationId_to_objId.keys())

for p_id in productId_list:
    for l_id in locationId_list:
        # Only some combinations have stock
        if random.random() < 0.4:   # ~40% of pairs
            prod_obj_id = productId_to_objId[p_id]
            loc_obj_id = locationId_to_objId[l_id]

            # Base mean stock varies a bit by tier and random
            tier = next(doc["tier"] for doc in location_docs if doc["locationId"] == l_id)
            base_mean = 28 if tier == "tier1" else 20
            quantity = max(0, int(np.random.normal(base_mean, 8)))

            # occasional stockout or surge
            r = random.random()
            if r < 0.02:
                quantity = 0
            elif r < 0.05:
                quantity += random.randint(30, 200)

            stock_docs.append({
                "productId": prod_obj_id,      # ObjectId reference
                "locationId": loc_obj_id,      # ObjectId reference
                "quantity": int(quantity),
                "updatedAt": now
                # timestamps option in Mongoose will add createdAt/updatedAt
                # when documents go through Mongoose; here we at least set updatedAt
            })

if stock_docs:
    stock_col.insert_many(stock_docs)
print(f"Inserted {len(stock_docs)} stock records.")

print("✅ Seeding complete.")
