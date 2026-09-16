"""
Seed the `orders` collection with synthetic data based on existing users, products, and locations.

Requirements:
- Buyers, products, and locations MUST exist in MongoDB beforehand.
- Uses their existing ObjectIds; does NOT create any new users/products/locations.
- Generates ~100,000 orders with:
    - userId: random buyer _id
    - productId: random product _id
    - locationId: random location _id
    - quantity: integer in [1, 10]
    - status: 'purchased' (95%) or 'cancelled' (5%)
    - timestamp: random datetime within the last 365 days

Run:
    python seed_orders.py
"""

import os
import random
from datetime import datetime, timedelta

from pymongo import MongoClient


# ---------------------- CONFIG ----------------------

# Mongo URI: read from env if available, else default to localhost.
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

# Database name – change if your backend uses a different one.
DB_NAME = os.getenv("MONGO_DB_NAME", "supply-demand")

# Number of orders to generate
NUM_ORDERS = 100_000

# Batch size for insert_many
BATCH_SIZE = 1_000


# ---------------------- UTILS ----------------------


def random_timestamp_last_year() -> datetime:
    """
    Return a random datetime within the last 365 days.
    """
    now = datetime.utcnow()
    days_back = random.randint(0, 364)
    seconds_in_day = random.randint(0, 24 * 3600 - 1)
    return now - timedelta(days=days_back, seconds=seconds_in_day)


def main():
    # Connect to Mongo
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]

    users_col = db["users"]
    products_col = db["products"]
    locations_col = db["locations"]
    orders_col = db["orders"]

    print(f"Connected to MongoDB: {MONGO_URI}, DB: {DB_NAME}")

    # Load existing buyers, products, locations
    buyers = list(users_col.find({"role": "buyer"}, {"_id": 1}))
    if not buyers:
        raise RuntimeError("No buyers found (role='buyer'). Create some users before seeding orders.")

    products = list(products_col.find({}, {"_id": 1}))
    if not products:
        raise RuntimeError("No products found. Seed products before seeding orders.")

    locations = list(locations_col.find({}, {"_id": 1}))
    if not locations:
        raise RuntimeError("No locations found. Seed locations before seeding orders.")

    buyer_ids = [u["_id"] for u in buyers]
    product_ids = [p["_id"] for p in products]
    location_ids = [l["_id"] for l in locations]

    print(f"Buyers:   {len(buyer_ids)}")
    print(f"Products: {len(product_ids)}")
    print(f"Locations:{len(location_ids)}")

    # Prepare seeding
    orders_to_insert = []
    total_inserted = 0

    # Optional: clear existing orders; comment out if you want to append
    # orders_col.delete_many({})
    # print("Cleared existing orders collection.")

    for i in range(NUM_ORDERS):
        user_id = random.choice(buyer_ids)
        product_id = random.choice(product_ids)
        location_id = random.choice(location_ids)

        quantity = random.randint(1, 10)

        # 95% purchased, 5% cancelled
        status = "purchased" if random.random() < 0.95 else "cancelled"

        ts = random_timestamp_last_year()

        doc = {
            "userId": user_id,
            "productId": product_id,
            "locationId": location_id,
            "quantity": quantity,
            "status": status,
            "timestamp": ts,
        }

        orders_to_insert.append(doc)

        # Batch insert
        if len(orders_to_insert) >= BATCH_SIZE:
            result = orders_col.insert_many(orders_to_insert)
            batch_count = len(result.inserted_ids)
            total_inserted += batch_count
            orders_to_insert.clear()

            if total_inserted % 10_000 == 0:
                print(f"Inserted {total_inserted} orders so far...")

    # Insert any remaining docs
    if orders_to_insert:
        result = orders_col.insert_many(orders_to_insert)
        total_inserted += len(result.inserted_ids)

    print(f"✅ Finished seeding orders. Total inserted: {total_inserted}")

    client.close()


if __name__ == "__main__":
    main()
