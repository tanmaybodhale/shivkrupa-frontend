import AuthCard from '@/components/auth/AuthCard';

export default function Home() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden bg-auth-grad"
      style={{
        background: 'linear-gradient(135deg, #1a1208 0%, #3a2008 40%, #6b3a1f 100%)',
      }}
    >
      {/* decorative radial glows */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 60% 20%, rgba(201,148,26,.18) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(201,148,26,.10) 0%, transparent 50%)',
        }}
      />
      {/* decorative circle */}
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 600, height: 600,
          border: '1px solid rgba(201,148,26,.12)',
          top: -200, right: -150,
        }}
      />
      {/* grid texture */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(78,205,196,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(78,205,196,.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Logo */}
      <div className="text-center mb-10 relative z-10">
        <span
          className="block text-6xl mb-3 spin-slow"
          style={{ display: 'inline-block' }}
        >
          ✿
        </span>
        <h1
          className="font-display text-5xl font-black"
          style={{ color: '#f0c040', letterSpacing: '2px', lineHeight: 1.1 }}
        >
          Shivkrupa Emporium
        </h1>
        <p
          className="italic mt-1"
          style={{ color: 'rgba(240,192,64,.7)', fontSize: 14, letterSpacing: 1 }}
        >
          Your Neighbourhood Everything Store
        </p>
        <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 13, letterSpacing: '3px', marginTop: 4 }}>
          📞 9975636622
        </p>
      </div>

      {/* Auth card */}
      <div className="relative z-10 w-full max-w-md">
        <AuthCard />
      </div>
    </main>
  );
}
