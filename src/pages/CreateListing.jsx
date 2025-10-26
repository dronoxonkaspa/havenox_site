import { useState } from "react";
import { ethers } from "ethers";
import { supabase } from "../lib/supabaseClient";
import { useListings } from "../context/ListingsContext";
import { useWallet } from "../context/WalletContext";

const ERC721_ABI = [
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)"
];

export default function CreateListing() {
  const { address } = useWallet();
  const { addListing } = useListings();

  const [formData, setFormData] = useState({
    network: "EVM",
    contract: "",
    tokenId: "",
    price: "",
    trade: false,
  });
  const [meta, setMeta] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [signature, setSignature] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  // === Kaspa NFT Verification ===
  async function verifyKaspaNFT() {
    try {
      setMsg("Verifying Kaspa NFT...");
      const kaspaApi = `https://api.kasplex.org/v1/token/${formData.contract}/tokenid/${formData.tokenId}`;
      const response = await fetch(kaspaApi);
      if (!response.ok) throw new Error("Token not found on Kaspa");
      const data = await response.json();

      if (!data.owner || data.owner.toLowerCase() !== address.toLowerCase()) {
        throw new Error("You do not own this Kaspa NFT");
      }

      const metadata = data.metadata || {};
      const imageUrl = metadata.image || metadata.img || "";
      setMeta({
        name: metadata.name || `Token #${formData.tokenId}`,
        description: metadata.description || "Kaspa NFT",
        image: imageUrl,
      });
      setMsg("✅ Verified Kaspa NFT");
    } catch (err) {
      console.error(err);
      setMeta(null);
      setMsg("⚠️ " + err.message);

    }
  }

  // === EVM NFT Verification ===
  async function verifyEvmNFT() {
    try {
      setMsg("Verifying EVM NFT...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(formData.contract, ERC721_ABI, provider);
      const owner = await contract.ownerOf(formData.tokenId);
      if (owner.toLowerCase() !== address.toLowerCase()) {
        throw new Error("You do not own this EVM NFT");
      }

      const uri = await contract.tokenURI(formData.tokenId);
      const res = await fetch(uri);
      const json = await res.json();
      setMeta(json);
      setMsg("✅ Verified EVM NFT");
    } catch (err) {
      console.error(err);
      setMeta(null);
      setMsg("⚠️ " + err.message);
    }
  }

  // === Handle verification logic ===
  async function handleVerify() {
    setMeta(null);
    setMsg("");
    if (!address) return setMsg("⚠️ Connect your wallet first.");
    if (!formData.contract || !formData.tokenId)
      return setMsg("⚠️ Contract and Token ID required.");

    if (formData.network === "Kaspa") await verifyKaspaNFT();
    else await verifyEvmNFT();
  }

  // === Signature Request ===
  async function requestSignature() {
    if (!address) return setMsg("⚠️ Connect your wallet first.");
    try {
      setMsg("Requesting signature...");
      let message = `Dronox Escrow Listing Verification\n\nNetwork: ${formData.network}\nContract: ${formData.contract}\nToken ID: ${formData.tokenId}\nWallet: ${address}\nTimestamp: ${Date.now()}`;

      if (formData.network === "EVM") {
        const signature = await window.ethereum.request({
          method: "personal_sign",
          params: [message, address],
        });
        setSignature(signature);
        setMsg("✅ Signature verified");
      } else {
        // For Kasware / KDX users
        const kas = window.kasware || window.kdx || window.kaspium;
        const sig = await kas.requestSignature({ message });
        setSignature(sig);
        setMsg("✅ Kaspa signature verified");
      }
    } catch (err) {
      console.error(err);
      setSignature("");
      setMsg("⚠️ " + err.message);
    }
  }

  // === Save Listing ===
  async function handleSubmit(e) {
    e.preventDefault();
    if (!meta) return setMsg("⚠️ Verify NFT first.");
    if (!signature) return setMsg("⚠️ Signature required.");
    try {
      setLoading(true);
      setMsg("Saving listing...");

      const { error } = await supabase.from("listings").insert([
        {
          name: meta.name || `Token #${formData.tokenId}`,
          type: meta.description || formData.network,
          price: parseFloat(formData.price),
          image_url: meta.image,
          trade: formData.trade,
          signature,
          network: formData.network,
        },
      ]);
      if (error) throw error;
      await addListing();
      setMsg("✅ Listing created & signed!");
      setFormData({
        network: "EVM",
        contract: "",
        tokenId: "",
        price: "",
        trade: false,
      });
      setMeta(null);
      setSignature("");
    } catch (err) {
      console.error(err);
      setMsg("⚠️ " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-4xl font-bold mb-10 neon-text">
        Create Verified & Signed Listing
      </h1>

      <div className="glow-box w-full max-w-md p-8">
        <form onSubmit={handleSubmit}>
          {/* Network */}
          <label className="block mb-4 text-gray-300">
            Network:
            <select
              name="network"
              value={formData.network}
              onChange={handleChange}
              className="ml-2 bg-black/40 border border-[#00E8C8]/40 rounded px-2 py-1 text-[#00E8C8]"
            >
              <option value="EVM">EVM (Ethereum, Polygon, etc.)</option>
              <option value="Kaspa">Kaspa (KRC-721)</option>
            </select>
          </label>

          <input
            type="text"
            name="contract"
            placeholder="NFT Contract Address"
            value={formData.contract}
            onChange={handleChange}
            className="mb-4"
            required
          />
          <input
            type="number"
            name="tokenId"
            placeholder="Token ID"
            value={formData.tokenId}
            onChange={handleChange}
            className="mb-4"
            required
          />
          <input
            type="number"
            name="price"
            placeholder="Price in KAS"
            value={formData.price}
            onChange={handleChange}
            className="mb-4"
            required
          />

          <div className="flex justify-between mb-4">
            <label className="text-gray-300 text-sm">
              Allow trading instead of direct sale?
            </label>
            <input
              type="checkbox"
              name="trade"
              checked={formData.trade}
              onChange={handleChange}
            />
          </div>

          <button
            type="button"
            onClick={handleVerify}
            disabled={!address || loading}
            className="btn-neon w-full py-2 mb-3 font-semibold"
          >
            Verify NFT
          </button>

          {meta && (
            <div className="mb-4">
              <img
                src={meta.image}
                alt="preview"
                className="rounded-md mx-auto mb-2 max-h-48"
              />
              <p className="text-[#00E8C8] text-sm">{meta.name}</p>
              <p className="text-gray-400 text-xs">{meta.description}</p>
            </div>
          )}

          <button
            type="button"
            onClick={requestSignature}
            disabled={!meta || !address || loading}
            className="btn-neon w-full py-2 mb-3 font-semibold"
          >
            Sign Listing
          </button>

          <button
            type="submit"
            className={`btn-neon w-full py-3 font-semibold ${
              !address ? "opacity-40 cursor-not-allowed" : ""
            }`}
            disabled={!address || loading}
          >
            {loading ? "Submitting..." : "Create Listing"}
          </button>
        </form>
        {msg && <p className="mt-4 text-[#00FFA3]">{msg}</p>}
      </div>
    </div>
  );
}
