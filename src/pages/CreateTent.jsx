import React, { useState } from "react";
import "../styles/havenox.css";

export default function CreateTent() {
  const [nftId, setNftId] = useState("");
  const [kaspaAmount, setKaspaAmount] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [fileName, setFileName] = useState("");

  const handleFile = (e) => {
    setFileName(e.target.files[0]?.name || "");
  };

  return (
    <div className="create-tent-container">
      <div className="cyber-bg"></div>
      <div className="tent-card">
        <h2>Create New Tent</h2>
        <input className="tent-input" placeholder="NFT ID" value={nftId} onChange={(e)=>setNftId(e.target.value)} />
        <input className="tent-input" placeholder="Kaspa Amount" value={kaspaAmount} onChange={(e)=>setKaspaAmount(e.target.value)} />
        <input className="tent-input" placeholder="Partner Email" value={partnerEmail} onChange={(e)=>setPartnerEmail(e.target.value)} />
        <label className="upload-zone">
          {fileName ? fileName : "Click to upload NFT image"}
          <input type="file" onChange={handleFile} hidden />
        </label>
        <button className="create-btn">Create Tent</button>
      </div>
    </div>
  );
}
