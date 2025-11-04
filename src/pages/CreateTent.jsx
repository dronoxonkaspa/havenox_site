import React, { useState, useRef } from "react";
import "../styles/havenox.css";

export default function CreateTent() {
  const [nftId, setNftId] = useState("");
  const [creator, setCreator] = useState("");
  const [royaltyPercent, setRoyaltyPercent] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const dropRef = useRef(null);

  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    setFile(droppedFile);
    dropRef.current.classList.remove("drag-over");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    dropRef.current.classList.add("drag-over");
  };

  const handleDragLeave = () => dropRef.current.classList.remove("drag-over");

  const verifyNFT = async () => {
    setStatus("? Verifying on Kaspa Layer-1...");
    try {
      const formData = {
        nftId,
        creator,
        royaltyPercent,
        message: "verify ownership",
        signature: "placeholder-signature"
      };

      const res = await fetch("https://backend-blue-bush-3995.fly.dev/mint-nft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        setStatus("? Verified on Kaspa L1");
      } else {
        setStatus("? Invalid NFT: " + (data.error || "Verification failed"));
      }
    } catch (err) {
      setStatus("?? RPC Error: " + err.message);
    }
  };

  return (
    <div className="create-tent-container">
      <div className="cyber-bg"></div>
      <div className="tent-card">
        <h2>Authenticate NFT Trade</h2>
        <input
          className="tent-input"
          placeholder="NFT ID"
          value={nftId}
          onChange={(e) => setNftId(e.target.value)}
        />
        <input
          className="tent-input"
          placeholder="Creator Kaspa Address"
          value={creator}
          onChange={(e) => setCreator(e.target.value)}
        />
        <input
          className="tent-input"
          placeholder="Royalty %"
          value={royaltyPercent}
          onChange={(e) => setRoyaltyPercent(e.target.value)}
        />

        <div
          ref={dropRef}
          className="upload-zone"
          onDrop={handleFileDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {file ? (
            <img
              src={URL.createObjectURL(file)}
              alt="preview"
              style={{ maxWidth: "100%", borderRadius: "10px" }}
            />
          ) : (
            "Drag & Drop NFT image here or click to upload"
          )}
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            hidden
          />
        </div>

        <button className="create-btn" onClick={verifyNFT}>
          Verify NFT
        </button>

        <p
          style={{
            textAlign: "center",
            marginTop: "1rem",
            color: status.includes("?") ? "cyan" : "magenta",
            textShadow: "0 0 8px currentColor"
          }}
        >
          {status}
        </p>
      </div>
    </div>
  );
}
