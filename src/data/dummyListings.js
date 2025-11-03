// src/data/dummyListings.js
// Example starter listings for HavenOx Marketplace

export const dummyListings = [
  {
    id: 1,
    name: "HavenOx Guardian #01",
    type: "NFT – Mythic",
    price: 1200,
    trade: true,
    network: "Kaspa",
    image_url: "https://havenoxonkaspa.com/assets/guard/1.png",
    signature: "verified",
    status: "complete",
  },
  {
    id: 2,
    name: "Kaspa Relic #44",
    type: "NFT – Rare",
    price: 300,
    trade: false,
    network: "Kaspa",
    image_url: "https://havenoxonkaspa.com/assets/guard/2.png",
    signature: null,       // not yet verified
    status: "pending",
  },
];
