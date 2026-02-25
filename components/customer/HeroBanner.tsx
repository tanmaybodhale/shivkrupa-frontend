export default function HeroBanner() {
  return (
    <div
      className="rounded-2xl mt-6 mb-8 px-10 py-12 grid gap-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1a1208 0%, #3a2008 50%, #5a3010 100%)',
        gridTemplateColumns: '1fr auto',
        alignItems: 'center',
      }}
    >
      {/* bg texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'url(https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200&q=80) center/cover',
          opacity: .06,
        }}
      />
      {/* glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: -60, top: -60,
          width: 300, height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,148,26,.22) 0%, transparent 70%)',
        }}
      />

      {/* Text */}
      <div className="relative z-10">
        <span
          className="inline-block text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4"
          style={{
            background: 'rgba(201,148,26,.2)',
            border: '1px solid rgba(201,148,26,.4)',
            color: 'var(--gold-light)',
          }}
        >
          🌟 Pune's Favourite Store
        </span>
        <h2
          className="font-display text-white mb-2"
          style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', lineHeight: 1.2 }}
        >
          Everything You Need,
          <br />
          <span style={{ color: 'var(--gold-light)' }}>One Place.</span>
        </h2>
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 14, lineHeight: 1.6, maxWidth: 400 }}>
          Stationery, snacks, gifts, jewellery, cutlery &amp; more — delivered or pick up. Shop fresh, shop local.
        </p>
      </div>

      {/* Free delivery badge */}
      <div
        className="relative z-10 rounded-2xl text-center py-5 px-6 hidden sm:block"
        style={{
          background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
          boxShadow: '0 8px 32px rgba(201,148,26,.4)',
          minWidth: 150,
        }}
      >
        <div
          className="font-display font-black leading-none"
          style={{ fontSize: '2.4rem', color: 'var(--dark)' }}
        >
          ₹99
        </div>
        <p
          className="text-xs font-bold mt-1"
          style={{ color: 'rgba(26,18,8,.65)' }}
        >
          FREE<br />DELIVERY<br />ABOVE
        </p>
      </div>
    </div>
  );
}
