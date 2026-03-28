from typing import Any, Dict, List, Optional
import re
import requests

from rasa_sdk import Action, Tracker
from rasa_sdk.events import SlotSet

# ==============================
# CONFIG
# ==============================

ANNI_DB_API = "http://localhost:4000/products"

# ==============================
# HTTP HELPER
# ==============================

def api_get(url: str, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    try:
        res = requests.get(url, params=params, timeout=5)
        if res.status_code == 200:
            data = res.json()
            if isinstance(data, list):
                return data
            if isinstance(data, dict):
                return [data]
        return []
    except Exception as e:
        print("❌ API error:", e)
        return []

# ==============================
# NLP HELPERS
# ==============================

def extract_text(tracker: Tracker) -> str:
    return tracker.latest_message.get("text", "").lower()

def extract_keywords(text: str) -> List[str]:
    text = re.sub(r"[^\w\s]", "", text.lower())
    stopwords = {
        "price", "cost", "rate", "best", "top", "compare",
        "show", "tell", "give", "me", "is", "are", "of",
        "under", "below", "above", "available", "stock"
    }
    return [w for w in text.split() if w not in stopwords and len(w) > 2]

def extract_category(text: str) -> Optional[str]:
    keyword_map = {
        "dress": "women's clothing",
        "gown": "women's clothing",
        "kurti": "women's clothing",
        "shirt": "men's clothing",
        "tshirt": "men's clothing",
        "jacket": "men's clothing",
        "shoes": "men's clothing",
        "phone": "electronics",
        "mobile": "electronics",
        "iphone": "electronics",
        "laptop": "electronics",
        "tv": "electronics",
        "monitor": "electronics",
        "ring": "jewelery",
        "bracelet": "jewelery",
        "necklace": "jewelery",
        "perfume": "fragrances",
        "sofa": "furniture",
        "chair": "furniture",
        "grocery": "groceries",
    }

    for k, v in keyword_map.items():
        if k in text:
            return v
    return None

def extract_number(text: str) -> Optional[int]:
    match = re.search(r"\b(\d{2,6})\b", text)
    return int(match.group(1)) if match else None

# ==============================
# RANKING
# ==============================

def rank_products(products: List[Dict[str, Any]], keywords: List[str]) -> List[Dict]:
    ranked = []

    for p in products:
        title = p.get("title", "").lower()
        score = 0

        for k in keywords:
            if k in title:
                score += 2

        if " ".join(keywords) in title:
            score += 5

        if score > 0:
            p["_score"] = score
            ranked.append(p)

    return sorted(ranked, key=lambda x: x["_score"], reverse=True)

# ==============================
# ACTIONS
# ==============================

class ActionProductPrice(Action):
    def name(self) -> str:
        return "action_product_price"

    async def run(self, dispatcher, tracker, domain):
        text = extract_text(tracker)
        keywords = extract_keywords(text)

        products = api_get(f"{ANNI_DB_API}/search", {"q": " ".join(keywords)})
        ranked = rank_products(products, keywords)

        if not ranked:
            dispatcher.utter_message(text="😕 Product not found.")
            return []

        p = ranked[0]
        dispatcher.utter_message(
            text=f"{p['title']} → ₹{p['price']} | ⭐ {p.get('rating', 0)}"
        )
        return []


class ActionProductStock(Action):
    def name(self) -> str:
        return "action_product_stock"

    async def run(self, dispatcher, tracker, domain):
        text = extract_text(tracker)
        keywords = extract_keywords(text)

        products = api_get(f"{ANNI_DB_API}/search", {"q": " ".join(keywords)})
        ranked = rank_products(products, keywords)

        if not ranked:
            dispatcher.utter_message(text="😕 Product not found.")
            return []

        p = ranked[0]
        dispatcher.utter_message(
            text=f"{p['title']} has {p.get('stock', 'Available')} units in stock."
        )
        return []


class ActionProductSearch(Action):
    def name(self) -> str:
        return "action_product_search"

    async def run(self, dispatcher, tracker, domain):
        text = extract_text(tracker)

        category = extract_category(text)
        budget = extract_number(text)
        keywords = extract_keywords(text)

        params = {}

        if category:
            params["category"] = category
        if budget:
            params["maxPrice"] = budget
        if keywords:
            params["q"] = " ".join(keywords)

        products = api_get(f"{ANNI_DB_API}/search", params)

        if not products:
            dispatcher.utter_message(text="😕 No products found.")
            return []

        msg = "🛍️ Products:\n\n"
        for i, p in enumerate(products[:5], start=1):
            msg += f"{i}. {p['title']} → ₹{p['price']}\n"

        dispatcher.utter_message(text=msg)

        return [SlotSet("last_products", products[:5])]


class ActionCompareFromMemory(Action):
    def name(self) -> str:
        return "action_compare_from_memory"

    async def run(self, dispatcher, tracker, domain):
        products = tracker.get_slot("last_products")

        if not products or len(products) < 2:
            dispatcher.utter_message(text="Not enough products to compare.")
            return []

        a, b = products[0], products[1]
        better = a if a.get("rating", 0) >= b.get("rating", 0) else b

        dispatcher.utter_message(
            text=f"{a['title']} vs {b['title']} → Best: {better['title']}"
        )

        return []