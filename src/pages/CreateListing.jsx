import { useState } from "react";
import { ethers } from "ethers";
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

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  }

  async function verifyNFT() {
    try {
      if (!window.ethereum) throw new Error("EVM wallet not detected.");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(formData.contract, ERC721_ABI, provider);
      const owner = await contract.ownerOf(formData.tokenId);
      if (owner.toLowerCase() !== address.toLowerCase()) throw new Error("You do not own this token.");

      const tokenURI = await contract.tokenURI(formData.tokenId);
      const metadata = await fetch(tokenURI).then((r) => r.json());
      setMeta(metadata);
      setMsg("✅ NFT verified!");
    } catch (err) {
      console.error(err);
      setMeta(null);
      setMsg("⚠️ " + err.message);
    }
  }

  async function signListing() {
    try {
      const message = `List NFT ${formData.contract} #${formData.tokenId} for sale`;
      if (window.ethereum?.request) {
        const sig = await window.ethereum.request({
          method: "personal_sign",
          params: [message, address],
        });
        setSignature(sig);
        setMsg("✅ Signature verified");
      } else {
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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!meta) return setMsg("⚠️ Verify NFT first.");
    if (!signature) return setMsg("⚠️ Signature required.");
    try {
      setLoading(true);
      setMsg("Saving listing...");

      await addListing({
        name: meta.name || `Token #${formData.tokenId}`,
        type: meta.description || formData.network,
        price: parseFloat(formData.price),
        image_url: meta.image,
        trade: formData.trade,
        signature,
        network: formData.network,
        seller: address,
      });

      setMsg("✅ Listing created & signed!");
      setFormData({ network: "EVM", contract: "", tokenId: "", price: "", trade: false });
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
      <h1 className="text-4xl font-bold mb-10 neon-text">Create Verified & Signed Listing</h1>

      <div className="glow-box w-full max-w-md p-8">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="contract"
            placeholder="Contract Address"
            value={formData.contract}
            onChange={handleChange}
            className="mb-4 w-full"
            required
          />

          <input
            type="text"
            name="tokenId"
            placeholder="Token ID"
            value={formData.tokenId}
            onChange={handleChange}
            className="mb-4 w-full"
            required
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

          <label className="flex items-center mb-4">
            <input
              type="checkbox"
              name="trade"
              checked={formData.trade}
              onChange={handleChange}
              className="mr-2"
            />
            Enable Trading Option
          </label>

          <div className="flex flex-col gap-2 mb-4">
            <button type="button" onClick={verifyNFT} className="btn-secondary w-full">
              Verify NFT
            </button>
            <button type="button" onClick={signListing} className="btn-secondary w-full">
              Sign Listing
            </button>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Saving..." : "Create Listing"}
          </button>
        </form>

        {msg && <p className="mt-4 text-[#00FFA3]">{msg}</p>}
      </div>
    </div>
  );
}
