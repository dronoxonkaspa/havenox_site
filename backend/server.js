import express from "express";
import fs from "fs";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const tentsPath = "./backend/data/tents.json";
const escrowsPath = "./backend/data/escrows.json";

// Load or init JSON data
const read = (path) => JSON.parse(fs.existsSync(path) ? fs.readFileSync(path, "utf-8") : "[]");

// --- Tent endpoints ---
app.get("/tent", (req, res) => res.json(read(tentsPath)));

app.post("/tent", (req, res) => {
  const tents = read(tentsPath);
  const newTent = { id: Date.now(), ...req.body };
  tents.push(newTent);
  fs.writeFileSync(tentsPath, JSON.stringify(tents, null, 2));
  res.json(newTent);
});

// --- Escrow endpoints ---
app.get("/escrows", (req, res) => res.json(read(escrowsPath)));

app.post("/escrows", (req, res) => {
  const escrows = read(escrowsPath);
  const newEscrow = { id: Date.now(), ...req.body };
  escrows.push(newEscrow);
  fs.writeFileSync(escrowsPath, JSON.stringify(escrows, null, 2));
  res.json(newEscrow);
});

app.listen(5000, () => console.log("🧩 HavenOx Tent API running on port 5000"));
