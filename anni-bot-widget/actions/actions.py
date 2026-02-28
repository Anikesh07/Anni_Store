from typing import Any, Dict, List, Optional
import re
import requests

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.types import DomainDict

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
        # women
        "dress": "women's clothing",
        "gown": "women's clothing",
        "kurti": "women's clothing",

        # men
        "shirt": "men's clothing",
        "tshirt": "men's clothing",
        "jacket": "men's clothing",
        "shoes": "men's clothing",

        # electronics
        "phone": "electronics",
        "mobile": "electronics",
        "iphone": "electronics",
        "laptop": "electronics",
        "tv": "electronics",
        "monitor": "electronics",

        # jewellery
        "ring": "jewelery",
        "bracelet": "jewelery",
        "necklace": "jewelery",

        # others
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
# PRODUCT RANKING (CORE FIX)
# ==============================

def rank_products(products: List[Dict[str, Any]], keywords: List[str]) -> List[Dict]:
    ranked = []

    for p in products:
        title = p.get("title", "").lower()
        score = 0

        for k in keywords:
            if k in title:
                score += 2

        # exact phrase boost
        if " ".join(keywords) in title:
            score += 5

        if score > 0:
            p["_score"] = score
            ranked.append(p)

    return sorted(ranked, key=lambda x: x["_score"], reverse=True)

# ==============================
# ACTION: PRODUCT PRICE
# ==============================

class ActionProductPrice(Action):

    def name(self) -> str:
        return "action_product_price"

    async def run(self, dispatcher, tracker, domain) -> List[Dict[str, Any]]:
        text = extract_text(tracker)
        keywords = extract_keywords(text)

        products = api_get(f"{ANNI_DB_API}/search", {"q": " ".join(keywords)})
        ranked = rank_products(products, keywords)

        if not ranked:
            dispatcher.utter_message("😕 I couldn’t find the exact product you’re looking for.")
            return []

        p = ranked[0]
        dispatcher.utter_message(
            f"💰 **{p['title']}**\n"
            f"Price: ₹{p['price']}\n"
            f"⭐ Rating: {p.get('rating', 0)} / 5\n"
            f"📦 Stock: {p.get('stock', 'Available')}"
        )
        return []

# ==============================
# ACTION: PRODUCT STOCK
# ==============================

class ActionProductStock(Action):

    def name(self) -> str:
        return "action_product_stock"

    async def run(self, dispatcher, tracker, domain) -> List[Dict[str, Any]]:
        text = extract_text(tracker)
        keywords = extract_keywords(text)

        products = api_get(f"{ANNI_DB_API}/search", {"q": " ".join(keywords)})
        ranked = rank_products(products, keywords)

        if not ranked:
            dispatcher.utter_message("😕 I couldn’t find that product.")
            return []

        p = ranked[0]
        dispatcher.utter_message(
            f"📦 **{p['title']}** has **{p.get('stock', 'Available')} units** in stock."
        )
        return []

# ==============================
# ACTION: TOP PRODUCTS
# ==============================

class ActionTopProducts(Action):

    def name(self) -> str:
        return "action_top_products"

    async def run(self, dispatcher, tracker, domain) -> List[Dict[str, Any]]:
        text = extract_text(tracker)
        category = extract_category(text)
        limit = extract_number(text) or 5

        products = api_get(
            f"{ANNI_DB_API}/top",
            {"category": category, "limit": limit}
        )

        if not products:
            dispatcher.utter_message("😕 No products found.")
            return []

        msg = "🔥 **Top Products**\n\n"
        for i, p in enumerate(products, start=1):
            msg += (
                f"{i}. **{p['title']}**\n"
                f"💰 ₹{p['price']} | ⭐ {p.get('rating', 0)}\n\n"
            )

        dispatcher.utter_message(msg)
        return []

# ==============================
# ACTION: BEST PRODUCT
# ==============================

class ActionBestProduct(Action):

    def name(self) -> str:
        return "action_best_product"

    async def run(self, dispatcher, tracker, domain) -> List[Dict[str, Any]]:
        text = extract_text(tracker)
        category = extract_category(text)
        budget = extract_number(text)

        products = api_get(
            f"{ANNI_DB_API}/top",
            {"category": category, "limit": 5, "maxPrice": budget}
        )

        if not products:
            dispatcher.utter_message("😕 I couldn't find a best product.")
            return []

        p = products[0]
        dispatcher.utter_message(
            f"🏆 **Best Pick for You**\n\n"
            f"**{p['title']}**\n"
            f"💰 ₹{p['price']}\n"
            f"⭐ {p.get('rating', 0)} / 5\n"
            f"📦 Stock: {p.get('stock', 'Available')}"
        )
        return []

# ==============================
# ACTION: COMPARE PRODUCTS
# ==============================

class ActionCompareProducts(Action):

    def name(self) -> str:
        return "action_compare_products"

    async def run(self, dispatcher, tracker, domain) -> List[Dict[str, Any]]:
        text = extract_text(tracker)
        parts = [p.strip() for p in text.split(" and ")]

        if len(parts) < 2:
            dispatcher.utter_message("Please mention two products to compare.")
            return []

        products = api_get(
            f"{ANNI_DB_API}/search",
            {"q": " ".join(parts)}
        )

        ranked = rank_products(products, extract_keywords(text))

        if len(ranked) < 2:
            dispatcher.utter_message("😕 I couldn’t find both products.")
            return []

        a, b = ranked[0], ranked[1]
        better = a if a.get("rating", 0) >= b.get("rating", 0) else b

        dispatcher.utter_message(
            f"🔍 **Comparison**\n\n"
            f"{a['title']} → ₹{a['price']} | ⭐ {a.get('rating', 0)}\n"
            f"{b['title']} → ₹{b['price']} | ⭐ {b.get('rating', 0)}\n\n"
            f"✅ **Best Choice:** {better['title']}"
        )
        return []
