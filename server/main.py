#!/usr/bin/env python3
# Flask
from flask import Flask
from flask import jsonify
from flask import json
from flask import abort
from flask import request, Response
from flask import redirect, render_template
from flask_bcrypt import Bcrypt, generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager
from flask_jwt_extended import create_access_token
from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt_identity

# Other imports
from datetime import datetime as dt
import datetime
import bson
import time
import ssl
import base64

# Database
from pymongo import MongoClient
import pymongo
import gridfs
import requests
import random
from PIL import Image
from io import BytesIO
import binascii
from bson import ObjectId

# stripe
import os
import stripe

DOMAIN = "http://127.0.0.1:5001"
stripe.api_key = "YOUR_STRIPE_API_KEY"
ORDER_SESSIONS = {}

# -----Note about the database------
# If You have the problems with Accessing the database: SSL Certificate Timeout error
# The problem is with the SSL handshake and you neewith the serverd to run the command:  pip install --upgrade certifi
# This needs to be run in the global terminal/console not in venv

# If you do not have python installed globally or multiple versions downloaded you might have to fix it by
# finding your root python folder where you can run the Install Certificates.command "document"

# On mac you can find this folder by searching python in Spotlight (cmd + space), then you will see the root python folder.


# ---constants----
DALLE_URL = "https://api.openai.com/v1/images/generations"
DALLE_HEADERS = {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_OPENAI_KEY_HERE",
}

DALLE_DATA = {
    "model": "image-alpha-001",
    "prompt": "",
    "size": "512x512",
    "n": 4,
    "response_format": "b64_json",
}

STRIPE_PRICING = {
    "size": {
        "20x20": "price_1MwjMkBkCBYdVgLOVhZHsvgY",
        "40x40": "price_1MwjMLBkCBYdVgLOlXMilJl8",
        "50x50": "price_1MwjM1BkCBYdVgLOfvpxnfWN",
        "60x60": "price_1MwjLRBkCBYdVgLOq2nOKJk5",
    },
    "frame": {
        "20x20": "price_1MwjOsBkCBYdVgLOjbMossu2",
        "40x40": "price_1MwjOTBkCBYdVgLO1H4uh5U0",
        "50x50": "price_1MwjNyBkCBYdVgLOIkNWyalC",
        "60x60": "price_1MwjNeBkCBYdVgLOFTTXVqbU",
    },
    "glossy": {
        "20x20": "price_1MwjQYBkCBYdVgLONhbDZoqy",
        "40x40": "price_1MwjQBBkCBYdVgLOMT3eW945",
        "50x50": "price_1MwjPrBkCBYdVgLO2zyKGC4b",
        "60x60": "price_1MwjPWBkCBYdVgLOhKUohWN6",
    },
}

# ------encryption---------
app = Flask(
    __name__,
    static_folder="../client",
    static_url_path="/",
    template_folder="../client/views",
)
app.config["JWT_SECRET_KEY"] = "posterAIzed_key"
bcrypt = Bcrypt(app)
jwt = JWTManager(app)


# --------MongoDB---------
cluster = MongoClient(
    "YOUR_MONGO_DB_CLIENT_HERE"
)
db = cluster["PosterAIzed"]
CustomerCollection = db["Customers"]
OrderCollection = db["Orders"]
fs = gridfs.GridFS(db)

# --------routes----------
@app.route("/")
def client():
    return render_template("app.html", startPage="homepage")


# -------sign-up------------
@app.route("/sign-up", methods=["POST"])
def signup():
    resp = request.get_json()
    email = resp["email"]
    if CustomerCollection.find_one({"email": email}):
        abort(401)
    name = resp["name"]
    password_hash = bcrypt.generate_password_hash(resp["password"]).decode("utf8")
    CustomerRow = {"email": email, "name": name, "password": password_hash}
    CustomerCollection.insert_one(CustomerRow)
    return Response(status=200)


# ------login-----------
@app.route("/login", methods=["POST"])
def login():
    resp = request.get_json()
    email = resp["email"]
    password = resp["password"]
    customer = CustomerCollection.find_one({"email": email})

    if customer is None or not bcrypt.check_password_hash(
        customer["password"], password
    ):
        return abort(401)
    else:
        customer["_id"] = str(customer["_id"])
        access_token = create_access_token(
            identity=customer["_id"], expires_delta=False
        )
        return (
            jsonify(
                token=access_token,
                customerid=customer["_id"],
                email=customer["email"],
                name=customer["name"],
            ),
            200,
        )


# ----OrderHistory--------
@app.route("/getOrderHistory", methods=["POST"])
def getOrderHistory():
    resp = request.get_json()
    customerid = resp["customerid"]
    orderhistory = OrderCollection.find({"customer_id": customerid})
    orderhistoryitems = []
    for order in orderhistory:
        items = order.get("items")
        payment_amount = order.get("amount_paid")
        for item in items:
            quantity = item["quantity"]
            try:
                object_id = ObjectId(item["image"])
                # Get the upload date from the ObjectId
                upload_date = None
                if object_id is not None:
                    upload_date = dt.fromtimestamp(
                        object_id.generation_time.timestamp()
                    ).strftime("%Y-%m-%d")

                orderhistoryitem = {
                    "base64_image": None,
                    "quantity": quantity,
                    "payment_amount": payment_amount,
                    "upload_date": upload_date,
                    "image_object_id": object_id,
                }

                orderhistoryitems.append(orderhistoryitem)
            except Exception as e:
                object_id = None

    for orderhistoryitem in orderhistoryitems:
        object_id = orderhistoryitem["image_object_id"]
        orderhistoryitem.pop("image_object_id", None)
        if object_id is not None:
            imageobj = fs.find({"_id": object_id})
            # Extract file data from GridOut object
            for image in imageobj:
                image_data = image.read()
                # Convert the image data to base64
                base64_image = base64.b64encode(image_data).decode("utf-8")
                orderhistoryitem["base64_image"] = base64_image
    print("orderhistory recieved")
    return jsonify(orderhistoryitems)


# ----Upload images to DB-----------
@app.route("/upload_image", methods=["POST"])
def upload_image():
    # -----Comment out below if uploading to DB should be deactivate-----
    # resp = request.get_json()
    # img_file = resp["img_file"]
    # prompt = resp["prompt"]
    # customerid = resp["customerid"]

    # img_attributes = {}
    # metadata = {
    #     "customerid": customerid,
    #     "prompt": prompt,
    #     "creationtime": datetime.datetime.utcnow(),
    #     "attributes": img_attributes,
    # }
    # # base64
    # img_data = bytes(img_file, "utf-8")
    # fs.put(img_data, metadata=metadata)

    # # Get the imageid of the uploaded image
    # lastuploadedimage = (
    #     fs.find(
    #         {
    #             "metadata.customerid": customerid,
    #             "metadata.creationtime": metadata["creationtime"],
    #         }
    #     )
    #     .sort("uploadDate", -1)
    #     .limit(1)
    # )

    # for image in lastuploadedimage:
    #     imageid = str(image._id)
    # return jsonify(imageid)
    return jsonify("hello")


# -------Generate Images----------------
@app.route("/generateImages", methods=["POST"])
@jwt_required()
def generateImages():
    resp = request.get_json()
    prompt = resp["prompt"]
    # customerid = resp["customerid"]

    DALLE_DATA["prompt"] = prompt
    result = get_images_dalle2(DALLE_URL, DALLE_HEADERS, DALLE_DATA)
    for img_dict in result:
        img_data = img_dict["b64_json"]
        # upload_image(img_data, prompt, customerid)
    return result


# --------------Previously generate images----------------
@app.route("/get_my_images", methods=["POST"])
def get_my_images():
    resp = request.get_json()
    userid = resp["userid"]
    numberOfPictures = int(resp["number"])
    print(numberOfPictures)
    images = fs.find({"metadata.customerid": userid}).limit(numberOfPictures)
    image_list = []
    for image in images:
        # Extract file data from GridOut object
        image_data = image.read()
        # Convert the image data to base64
        base64_image = base64.b64encode(image_data).decode("utf-8")
        image_dict = {
            "_id": str(image._id),
            "filename": image.filename,
            "data": base64_image,
            "content_type": image.content_type,
            "customerid": image.metadata["customerid"],
            "prompt": image.metadata["prompt"],
            "creationtime": image.metadata["creationtime"],
            "attributes": image.metadata["attributes"],
        }
        image_list.append(image_dict)
    print("previous images recieved")
    return jsonify(images=image_list)


# Generate example prompts
@app.route("/surprise_me", methods=["GET"])
def surprise_me():
    example_prompts = [
        "A panoramic view of the Grand Canyon at sunrise",
        "A colorful hot air balloon festival over the mountains",
        "A picturesque Italian village on a hillside",
        "A quaint Parisian café with outdoor seating and colorful flowers",
        "A peaceful Japanese garden with a koi pond and cherry blossom trees",
        "A vintage-style travel poster of the Swiss Alps",
        "A dramatic view of the Northern Lights over a snowy landscape",
        "A tropical island paradise with white sand beaches and turquoise water",
        "A majestic castle on a hilltop surrounded by a moat",
        "A rustic cabin in the woods with a cozy fireplace and snow falling outside",
        "A vineyard in Tuscany with rolling hills and cypress trees",
        "A bustling street market in Marrakech with colorful textiles and spices",
        "A modern and sleek city skyline with towering skyscrapers and colorful lights",
        "A tranquil beach scene with palm trees and crystal clear water",
        "A charming English countryside with thatched roof cottages and green fields",
        "A serene mountain lake with a reflection of the surrounding peaks",
        "A colorful and vibrant Indian marketplace with spices and textiles",
        "A futuristic cityscape with flying cars and neon lights",
        "A mystical and enchanting forest with glowing mushrooms and fireflies",
        "A cozy and inviting library with shelves of books and comfortable seating",
        "A wild and untamed African savanna with elephants and lions",
        "A bustling Chinatown with colorful lanterns and street vendors",
        "A whimsical and dreamy underwater scene with mermaids and colorful fish",
        "A quaint and charming seaside village with colorful houses and fishing boats",
        "A mystical and enchanting forest with a hidden waterfall and glowing flowers",
        "A peaceful and calming Zen garden with raked sand and stone sculptures",
        "A grand and luxurious palace with ornate decorations and chandeliers",
        "A fun and playful carnival with rides and colorful lights",
        "A dramatic and moody seascape with storm clouds and crashing waves",
        "A futuristic and high-tech laboratory with advanced technology and robots",
        "A charming and whimsical farm with animals and colorful flowers",
        "A breathtaking view of the Eiffel Tower at night",
        "A serene and peaceful desert landscape with sand dunes and cactus",
        "A colorful and vibrant Mexican marketplace with traditional crafts and music",
        "A grand and ornate concert hall with elegant decorations and a grand piano",
        "A dramatic and moody cityscape with fog and rain",
        "A whimsical and playful treehouse with a swing and a slide",
        "A peaceful and calming snowy forest with snow-covered trees and a frozen lake",
        "A bustling and vibrant Moroccan souk with colorful textiles and ceramics",
        "A grand and luxurious hotel lobby with marble floors and a grand staircase",
        "A fun and playful amusement park with roller coasters and carnival games",
        "A breathtaking view of the Golden Gate Bridge at sunset",
        "A peaceful and calming garden with a pond and colorful flowers",
        "A dramatic and moody mountain range with snow-capped peaks and misty clouds",
        "A colorful and vibrant Indian wedding with traditional decorations and clothing",
        "A grand and ornate theater with red velvet seats and a stage curtain",
        "A playful and whimsical playground with swings and a slide",
        "A peaceful and calming forest with a babbling brook and mossy rocks",
        "A bustling and vibrant Japanese street with street food and lanterns",
    ]
    surprise_text = random.choice(example_prompts)

    return jsonify(surprise_text)


# ------user------
@app.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    # Access the identity of the current user with get_jwt_identity
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200


# ----------Makes the request to OpenAI API-----------
def get_images_dalle2(url, headers, data):
    response = requests.post(url, headers=headers, data=json.dumps(data))
    if response.status_code == 200:
        # Successful API call
        result = response.json()
        imageList = result["data"]
        return imageList
    else:
        # API call failed
        print(f"Error: {response.status_code} - {response.text}")


# -----------stripe-----------------------
@app.route("/create-checkout-session", methods=["POST"])
@jwt_required()
def create_checkout_session():
    order = request.get_json()
    customer_id = get_jwt_identity()

    checkout_items = []
    try:
        for item in order["cart"]:
            checkout_items.append(
                {
                    "price": STRIPE_PRICING["size"][item["size"]],
                    "quantity": item["quantity"],
                }
            )
            if item["frame"]:
                checkout_items.append(
                    {
                        "price": STRIPE_PRICING["frame"][item["size"]],
                        "quantity": item["quantity"],
                    }
                )
            if item["glossy"]:
                checkout_items.append(
                    {
                        "price": STRIPE_PRICING["glossy"][item["size"]],
                        "quantity": item["quantity"],
                    }
                )
    except Exception as e:
        abort(404)

    try:
        checkout_session = stripe.checkout.Session.create(
            line_items=checkout_items,
            mode="payment",
            success_url=DOMAIN + "/success",
            cancel_url=DOMAIN + "/cancel",
        )
        ORDER_SESSIONS[customer_id] = {
            "order": order,
            "checkout_session": checkout_session.id,
        }
    except Exception as e:
        return str(e)
    return jsonify(checkout_session.url)


# ---------Success-------------------
@app.route("/success", methods=["GET"])
def stripe_success():
    return render_template("app.html", startPage="stripe/rerouteSuccess")


# ---------Cancel-------------
@app.route("/cancel", methods=["GET"])
def stripe_cancel():
    return render_template("app.html", startPage="stripe/rerouteCancel")


# ---------Successful payment-----------
@app.route("/payment-success", methods=["GET"])
@jwt_required()
def stripe_payment_success():
    customer_id = get_jwt_identity()
    order = ORDER_SESSIONS[customer_id]["order"]
    checkout_session = stripe.checkout.Session.retrieve(
        ORDER_SESSIONS[customer_id]["checkout_session"]
    )
    payment_amount = float(checkout_session["amount_total"]) / 100
    payment_intent = checkout_session["payment_intent"]
    if checkout_session["payment_status"] == "paid":
        if OrderCollection.find_one({"payment_intent": payment_intent}):
            abort(401)
        OrderRow = {
            "items": order["cart"],
            "address": order["address"],
            "payment_intent": payment_intent,
            "customer_id": customer_id,
            "amount_paid": payment_amount,
        }
        OrderCollection.insert_one(OrderRow)
        del ORDER_SESSIONS[customer_id]["checkout_session"]
        return Response(status=200)
    else:
        abort(401)


# -------------Cancel Payment-----------------
@app.route("/payment-cancel", methods=["GET"])
@jwt_required()
def stripe_payment_cancel():
    customer_id = get_jwt_identity()
    del ORDER_SESSIONS[customer_id]["checkout_session"]
    return Response(status=200)


# -----------Pricing-----------------------
@app.route("/pricing", methods=["GET"])
def pricing():
    priceList = {
        "size": {"20x20": "", "40x40": "", "50x50": "", "60x60": ""},
        "frame": {"20x20": "", "40x40": "", "50x50": "", "60x60": ""},
        "glossy": {"20x20": "", "40x40": "", "50x50": "", "60x60": ""},
    }
    for category in priceList:
        for key in priceList[category]:
            priceList[category][key] = int(
                stripe.Price.retrieve(STRIPE_PRICING[category][key])["unit_amount"]
                / 100
            )
    return jsonify(priceList)


# ----------------------------serverstub to be used when disconnected from OpenAI API----------------------------------------------
# Comment out this block when finished


@app.route("/fake_geneate_images", methods=["GET"])
def fake_geneate_images():
    urls = fakeDalle()

    url_list = []
    for url in urls["data"]:
        image = url["url"]
        url_list.append(image)

    time.sleep(3)
    return jsonify(url_list)


def fakeDalle():
    image_file = open("exampelURL.txt", "r")
    file_lines = image_file.readlines()

    images_url = {"created": 111, "data": []}

    for url in file_lines:
        images_url["data"].append({"url": url})

    return images_url


@app.route("/latest_images", methods=["GET"])
def latest_images():
    surprise_text = "Surprise Me"
    return jsonify(surprise_text)


# ---------------------------------------------------------------------------------------

if __name__ == "__main__":
    app.run(port=5001, debug=True)
