import { useState } from "react";
import { ethers } from "ethers";
import { supabase } from "../lib/supabaseClient";
import { useListings } from "../context/ListingsContext";
import { useWallet } from "../context/WalletContext";

export default function Create() {
  const { address } = useWallet();
  const { addListing } = useListings();
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    price: "",
    image_url: "",
    trade: false,
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const LISTING_FEE = 10; // 10 KAS non-refundable fee

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!address) return setMsg("⚠️ Connect wallet first.");
    if (!formData.name || !formData.price)
      return setMsg("⚠️ Name and Price required.");

    try {
      setLoading(true);
      setMsg("Posting listing...");

      // Insert into Supabase
      const { error } = await supabase.from("listings").insert([
        {
          name: formData.name,
          type: formData.type,
          price: parseFloat(formData.price),
          image_url: formData.image_url,
          trade: formData.trade,
          listing_fee: LISTING_FEE,
          network: "Kaspa",
        },
      ]);

      if (error) throw error;

      await addListing();
      setMsg("✅ Listing created (10 KAS non-refundable fee recorded).");
      setFormData({ name: "", type: "", price: "", image_url: "", trade: false });
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
            name="type"
            placeholder="NFT Type (Mythic, Rare, etc.)"
            value={formData.type}
            onChange={handleChange}
            className="mb-4 w-full"
          />
          <input
            type="number"
            name="price"
            placeholder="Price in KAS"
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
            className="mb-6 w-full"
          />

          {/* Fee notice */}
          <p className="text-sm text-gray-400 mb-6">
            A <span className="text-[#00FFA3] font-semibold">10 KAS</span>{" "}
            non-refundable listing fee will be charged when posting.
          </p>

          <button
            type="submit"
            disabled={!address || loading}
            className={`btn-neon w-full py-3 font-semibold ${
              !address ? "opacity-40 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Submitting..." : "Create Listing"}
          </button>
        </form>

        {msg && <p className="mt-4 text-[#00FFA3]">{msg}</p>}
      </div>
    </div>
  );
}
