from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from nacl.signing import VerifyKey
from nacl.exceptions import BadSignatureError
from supabase import create_client, Client

app = Flask(__name__)
CORS(app)

# --- ENV VARIABLES ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# --- VERIFY ENDPOINT ---
@app.route("/verify", methods=["POST"])
def verify_signature():
    data = request.get_json()
    address = data.get("address")
    signature = data.get("signature")
    message = data.get("message")
    nft_name = data.get("nft_name")
    price = data.get("price")
    image_url = data.get("image_url")
    network = data.get("network", "Kaspa")

    if not all([address, signature, message]):
        return jsonify({"error": "Missing fields"}), 400

    try:
        # Placeholder for real Kaspa/EVM verification
        if len(signature) < 40:
            raise BadSignatureError("Invalid signature")

        listing = {
            "name": nft_name,
            "price": price,
            "image_url": image_url,
            "signature": signature,
            "network": network,
            "verified": True,
        }

        supabase.table("listings").insert(listing).execute()
        return jsonify({"status": "verified", "wallet": address})

    except BadSignatureError:
        return jsonify({"error": "Invalid signature"}), 403
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/")
def home():
    return jsonify({"service": "Dronox Signature Verifier", "status": "online"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
