import { useState } from "react";

export default function SignAndUpload() {
  const [message, setMessage] = useState("Mint EvilSpud #30");
  const [signature, setSignature] = useState("");
  const [address, setAddress] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState("");

  async function handleSign() {
    try {
      if (!window.kasware) {
        alert("KasWare wallet not detected");
        return;
      }
      const addr = await window.kasware.getSelectedAddress();
      const sig = await window.kasware.signMessage(message);
      setAddress(addr);
      setSignature(sig);
      setStatus("✅ Message signed successfully!");
    } catch (err) {
      console.error("Sign error:", err);
      setStatus("❌ Failed to sign message");
    }
  }

  async function handleMint() {
    if (!signature || !address || !message) {
      alert("Sign a message first!");
      return;
    }

    try {
      setStatus("⏳ Uploading NFT...");
      const metadata = {
        name: message,
        description: "NFT minted via HavenOx",
        image: preview,
      };

      const body = {
        nftId: `nft-${Date.now()}`,
        creator: address,
        signature,
        message,
        royaltyPercent: 5,
        metadata,
      };

      const res = await fetch(`${import.meta.env.VITE_API_BASE}/mint-nft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStatus(`✅ NFT minted! ID: ${data.record.nftId}`);
    } catch (err) {
      console.error("Mint error:", err);
      setStatus(`❌ Mint failed: ${err.message}`);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(f);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-[#00FFA3]">
        Sign & Upload NFT
      </h1>

      <textarea
        className="w-96 h-24 p-3 rounded-lg text-black mb-4"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button
        onClick={handleSign}
        className="mb-4 bg-[#00E8C8]/30 border border-[#00E8C8]/50 text-[#00FFA3] px-5 py-2 rounded-lg hover:bg-[#00E8C8]/40 transition"
      >
        Sign Message
      </button>

      {signature && (
        <div className="w-96 text-left text-sm bg-black/40 p-4 rounded-lg mb-6">
          <p><strong>Address:</strong> {address}</p>
          <p className="break-all mt-2"><strong>Signature:</strong> {signature}</p>
        </div>
      )}

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="w-96 h-48 border-2 border-dashed border-[#00E8C8]/40 rounded-lg flex flex-col items-center justify-center hover:border-[#00FFA3] transition mb-4"
      >
        {preview ? (
          <img src={preview} alt="preview" className="w-full h-full object-cover rounded-lg" />
        ) : (
          <>
            <p className="text-[#00E8C8]">Drag & Drop an image here</p>
            <p className="text-sm text-gray-400 mt-2">or click to choose a file</p>
          </>
        )}
        <input
          type="file"
          className="hidden"
          onChange={(e) =>
            handleDrop({ preventDefault: () => {}, dataTransfer: { files: e.target.files } })
          }
        />
      </div>

      <button
        onClick={handleMint}
        className="bg-[#00E8C8]/30 border border-[#00E8C8]/50 text-[#00FFA3] px-5 py-2 rounded-lg hover:bg-[#00E8C8]/40 transition"
      >
        Upload & Mint NFT
      </button>

      {status && <p className="mt-4 text-[#00FFA3]">{status}</p>}
    </div>
  );
}
