export default function About() {
  return (
    <div className="min-h-screen pt-24 px-6 text-center text-gray-300">
      <h1 className="text-4xl font-bold mb-6 neon-text">About TradeHaven</h1>

      <p className="max-w-2xl mx-auto leading-relaxed text-gray-400 mb-8">
        <strong>TradeHaven</strong> is a decentralized NFT escrow marketplace
        built on Kaspa and EVM networks. We prioritize transparency, security,
        and simplicity. Every NFT trade passes through a dual-signature escrow
        system — meaning both buyer and seller sign off before assets move.
      </p>

      <p className="max-w-2xl mx-auto leading-relaxed text-gray-400 mb-8">
        Our mission is to provide a safe haven for creators, collectors, and
        traders. With real-time blockchain verification, on-chain transparency,
        and low fees, TradeHaven empowers the Kaspa ecosystem and makes NFT
        trading accessible for everyone.
      </p>

      <p className="text-sm text-gray-500">
        Version 1.0 • Powered by Kaspa · Supabase · Render · Netlify
      </p>
    </div>
  );
}
