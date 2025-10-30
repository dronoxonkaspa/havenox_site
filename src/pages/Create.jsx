import { useState } from "react";
import { useListings } from "../context/ListingsContext";
import { useWallet } from "../context/WalletContext";

export default function Create() {
  const { address } = useWallet();
  const { addListing } = useListings();
  const [formData, setFormData] = useState({
    name: "",
    nftId: "",
    type: "",
    price: "",
    image_url: "",
    trade: false,
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const LISTING_FEE = 10; // 10 KAS non-refundable

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!address) return setMsg("⚠️ Connect wallet first.");
    if (!formData.name || !formData.price)
      return setMsg("⚠️ Name and Price required.");
    try {
      setLoading(true);
      setMsg("Posting listing...");
      await addListing({
        name: formData.name,
        nftId: formData.nftId || undefined,
        type: formData.type,
        price: parseFloat(formData.price),
        image_url: formData.image_url,
        trade: formData.trade,
        listing_fee: LISTING_FEE,
        network: "Kaspa",
        seller: address,
      });
      setMsg("✅ Listing created (10 KAS non-refundable fee recorded).");
      setFormData({
        name: "",
        nftId: "",
        type: "",
        price: "",
        image_url: "",
        trade: false,
      });
    } catch (err) {
      console.error(err);
      setMsg("⚠️ " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-4xl font-bold mb-8 neon-text">Create Listing</h1>
      <div className="glow-box w-full max-w-md p-8">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="NFT Name / Token ID"
            value={formData.name}
            onChange={handleChange}
            className="mb-4 w-full"
            required
          />
          <input
            type="text"
            name="nftId"
            placeholder="Minted NFT ID (optional)"
            value={formData.nftId}
            onChange={handleChange}
            className="mb-4 w-full"
          />
          <input
            type="text"
            name="type"
            placeholder="Type (e.g., Art, Collectible)"
            value={formData.type}
            onChange={handleChange}
            className="mb-4 w-full"
          />
          <input
            type="number"
            name="price"
            placeholder="Price (KAS)"
            value={formData.price}
            onChange={handleChange}
            className="mb-4 w-full"
            required
          />
          <input
            type="text"
            name="image_url"
            placeholder="Image URL"
            value={formData.image_url}
            onChange={handleChange}
            className="mb-4 w-full"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-semibold py-3 rounded-lg transition"
          >
            {loading ? "Creating..." : "Create Listing"}
          </button>
          {msg && <p className="text-sm text-cyan-300 mt-3">{msg}</p>}
        </form>
      </div>
    </div>
  );
}
