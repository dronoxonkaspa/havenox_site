import React, { useState, useRef } from "react";
import "/src/styles/havenox.css";

export default function CreateTent() {
  const [nftId, setNftId] = useState("");
  const [creator, setCreator] = useState("");
  const [royaltyPercent, setRoyaltyPercent] = useState("");
  const [status, setStatus] = useState("");
  const [verified, setVerified] = useState(false);
  const [preview, setPreview] = useState(null);
  const [meta, setMeta] = useState({});
  const dropRef = useRef(null);

  const handleFileDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.name.endsWith(".json")) {
      alert("Please drop a valid .json metadata file.");
      return;
    }
    dropRef.current.classList.remove("drag-over");
    const text = await file.text();
    try {
      const json = JSON.parse(text);
      setMeta(json);
      setNftId(json.nftId || "");
      setCreator(json.creator || "");
      setRoyaltyPercent(json.royaltyPercent || 0);
      setPreview(json.image || null);
      await verifyNFT(json);
    } catch (err) {
      setStatus("?? Invalid JSON structure");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    dropRef.current.classList.add("drag-over");
  };
  const handleDragLeave = () => dropRef.current.classList.remove("drag-over");

  const verifyNFT = async (metaData) => {
    setStatus("? Verifying NFT on Kaspa...");
    setVerified(false);
    try {
      const res = await fetch("https://backend-blue-bush-3995.fly.dev/mint-nft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nftId: metaData.nftId,
          creator: metaData.creator,
          royaltyPercent: metaData.royaltyPercent,
          message: "verify ownership",
          signature: "placeholder-signature"
        }),
      });
      const data = await res.json();
      if (res.ok && data.status === "verified") {
        setStatus("? Verified on Kaspa L1");
        setVerified(true);
      } else {
        setStatus("? Invalid NFT: " + (data.error || "verification failed"));
      }
    } catch (err) {
      setStatus("?? RPC Error: " + err.message);
    }
  };

  return (
    <div className="create-tent-container">
      <div className="cyber-bg"></div>
      <div className={`tent-card ${verified ? "verified-glow" : ""}`}>
        <h2>Create Tent</h2>
        <div
          ref={dropRef}
          className="upload-zone"
          onDrop={handleFileDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {preview ? (
            <div className="nft-preview">
              <img src={preview} alt="NFT Preview" />
              <h3>{meta.name}</h3>
              <p>{meta.description}</p>
            </div>
          ) : (
            "Drag & Drop NFT metadata (.json)"
          )}
        </div>

        <input className="tent-input" placeholder="NFT ID" value={nftId} readOnly />
        <input className="tent-input" placeholder="Creator" value={creator} readOnly />
        <input className="tent-input" placeholder="Royalty %" value={royaltyPercent} readOnly />

        <button className="create-btn" disabled={!verified}>
          {verified ? "Create Tent" : "Verify Required"}
        </button>

        <p style={{
          textAlign: "center",
          marginTop: "1rem",
          color: verified ? "cyan" : "magenta",
          textShadow: "0 0 8px currentColor"
        }}>
          {status}
        </p>
      </div>
    </div>
  );
}
