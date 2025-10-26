import { useState } from "react";

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[#00E8C8]/30 py-4 text-left">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center text-[#00FFA3] font-semibold"
      >
        {question}
        <span>{open ? "−" : "+"}</span>
      </button>
      {open && <p className="text-gray-400 mt-2">{answer}</p>}
    </div>
  );
}

export default function FAQ() {
  const faqs = [
    {
      question: "How does TradeHaven escrow work?",
      answer:
        "When a buyer initiates a trade, their payment and the seller’s NFT are held in escrow. Once both sides confirm via digital signatures, the system releases the NFT to the buyer and the funds to the seller automatically.",
    },
    {
      question: "What fees are charged?",
      answer:
        "TradeHaven charges a 2% platform fee on every completed trade and a 10 KAS non-refundable listing fee for posting on the marketplace. These fees keep the platform secure and sustainable.",
    },
    {
      question: "What wallets are supported?",
      answer:
        "Currently we support Kasware, KDX, and Kaspium wallets. MetaMask and other EVM wallets will be added soon.",
    },
    {
      question: "Are listing fees refundable?",
      answer:
        "No. The 10 KAS listing fee is non-refundable and helps prevent spam listings while covering storage and verification costs.",
    },
    {
      question: "Is TradeHaven decentralized?",
      answer:
        "Yes. TradeHaven uses decentralized storage, blockchain verification, and open APIs to maintain transparency. Escrow confirmations require both parties’ signatures for safety.",
    },
  ];

  return (
    <div className="min-h-screen pt-24 px-6 text-center text-gray-300">
      <h1 className="text-4xl font-bold mb-6 neon-text">FAQ</h1>
      <div className="max-w-3xl mx-auto text-left">
        {faqs.map((item, idx) => (
          <FAQItem key={idx} question={item.question} answer={item.answer} />
        ))}
      </div>
    </div>
  );
}
