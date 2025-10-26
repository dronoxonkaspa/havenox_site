export default function About() {
  return (
    <div className="min-h-screen pt-24 px-6 text-center text-gray-300">
      <h1 className="text-4xl font-bold mb-6 neon-text">About HavenOx</h1>

      <p className="max-w-2xl mx-auto leading-relaxed text-gray-400 mb-8">
        <strong>HavenOx</strong> is a decentralized escrow marketplace built on the Kaspa
        and EVM networks. We focus on transparency, security, and simplicity —
        every trade passes through a dual-signature escrow system ensuring both
        buyer and seller confirm before assets move.
      </p>

      <p className="max-w-2xl mx-auto leading-relaxed text-gray-400 mb-8">
        Our mission is to provide a safe haven for creators, collectors, and
        traders. With on-chain verification, open transparency, and low fees,
        HavenOx empowers the Kaspa ecosystem and enables peer-to-peer trades
        that are both safe and efficient.
      </p>

      <p className="text-sm text-gray-500">
        Version 1.0 • Built on Kaspa · Supabase · Render · Netlify
      </p>
    </div>
  );
}
