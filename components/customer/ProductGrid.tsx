const ESSENTIALS = [
  { image: '/products/love-heart-earrings.png', name: 'लव हार्ट इयररिंग्स', tag: 'एनिवर्सरी भूल गए? जल्दी खरीद लो!' },
  { image: '/products/real-a5-notebook.png', name: 'रियल A-5 नोटबुक', tag: 'होमवर्क का बहाना खत्म!' },
  { image: '/products/orbit-calculator.png', name: 'ऑर्बिट कैलकुलेटर', tag: 'स्टाफ का कैलकुलेटर टूट गया? जल्दी खरीद लो!' },
  { image: '/products/taparia-plier.png', name: 'टापरिया प्लायर', tag: 'पापा का टूलबॉक्स अभी अपडेट करो!' },
  { image: '/products/joy-sunscreen.png', name: 'जॉय सनस्क्रीन SPF 30', tag: 'बहुत सह लिया सूरज को, अब लगाओ सनस्क्रीन!' },
  { image: '/products/humpi-handbag.png', name: 'हम्पी हैंडबैग', tag: 'लगो कूल इस खूबसूरत बॅग के साथ !' },
  { image: '/products/couple-watch.png', name: 'एनालॉजी कपल वॉच', tag: 'लेट होने का बहाना खत्म!' },
  { image: '/products/bournville-chocolate.png', name: 'बॉर्नविल क्रैनबेरी', tag: 'सॉरी बोलने का सबसे मीठा तरीका!' },
];

const TAGLINES = [
  'एनिवर्सरी भूल गए? जल्दी खरीद लो!',
  'स्टाफ का कैलकुलेटर टूट गया? जल्दी खरीद लो!',
  'बहुत सह लिया सूरज को, अब लगाओ सनस्क्रीन!',
  'लेट होने का बहाना खत्म, कपल वॉच 10 मिनट में!',
  'सॉरी बोलने का सबसे मीठा तरीका!',
  'लगो कूल इस खूबसूरत बॅग के साथ!',
];

function LoadingProducts({ isDark }: { isDark: boolean }) {
  const [tagIndex, setTagIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setTagIndex(i => (i + 1) % TAGLINES.length);
        setVisible(true);
      }, 300);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  const half = Math.ceil(ESSENTIALS.length / 2);
  const rowA = [...ESSENTIALS.slice(0, half), ...ESSENTIALS.slice(0, half)];
  const rowB = [...ESSENTIALS.slice(half), ...ESSENTIALS.slice(half)];

  const cardBg = isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-orange-200';
  const nameColor = isDark ? 'text-gray-200' : 'text-amber-900';
  const tagBg = isDark ? 'bg-[#251e40] text-indigo-300' : 'bg-orange-50 text-amber-700';
  const imgWrapBg = isDark ? 'bg-[#251e40]' : 'bg-orange-50';

  return (
    <div className="py-10">
      <style>{`
        @keyframes lp-scroll-left { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes lp-scroll-right { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .lp-track-a { animation: lp-scroll-left 24s linear infinite; }
        .lp-track-b { animation: lp-scroll-right 28s linear infinite; }
        .lp-row:hover .lp-track-a, .lp-row:hover .lp-track-b { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .lp-track-a, .lp-track-b { animation: none; }
        }
      `}</style>

      <div className="min-h-[56px] flex items-center justify-center px-6 mb-6">
        <p
          className={`font-display text-xl text-center transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}
          style={{ color: 'var(--brown)' }}
        >
          {TAGLINES[tagIndex]}
        </p>
      </div>

      <div
        className="lp-row overflow-hidden mb-3"
        style={{ WebkitMaskImage: 'linear-gradient(90deg, transparent 0, #000 24px, #000 calc(100% - 24px), transparent 100%)', maskImage: 'linear-gradient(90deg, transparent 0, #000 24px, #000 calc(100% - 24px), transparent 100%)' }}
      >
        <div className="lp-track-a flex gap-3 w-max">
          {rowA.map((p, idx) => (
            <div key={idx} className={`flex-shrink-0 w-32 rounded-xl border p-3 ${cardBg}`}>
              <div className={`w-full h-16 rounded-lg overflow-hidden mb-2 ${imgWrapBg}`}>
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <p className={`text-xs font-semibold leading-snug mb-2 ${nameColor}`}>{p.name}</p>
              <span className={`inline-block text-[10px] font-medium px-2 py-1 rounded-full ${tagBg}`}>{p.tag}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="lp-row overflow-hidden"
        style={{ WebkitMaskImage: 'linear-gradient(90deg, transparent 0, #000 24px, #000 calc(100% - 24px), transparent 100%)', maskImage: 'linear-gradient(90deg, transparent 0, #000 24px, #000 calc(100% - 24px), transparent 100%)' }}
      >
        <div className="lp-track-b flex gap-3 w-max">
          {rowB.map((p, idx) => (
            <div key={idx} className={`flex-shrink-0 w-32 rounded-xl border p-3 ${cardBg}`}>
              <div className={`w-full h-16 rounded-lg overflow-hidden mb-2 ${imgWrapBg}`}>
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <p className={`text-xs font-semibold leading-snug mb-2 ${nameColor}`}>{p.name}</p>
              <span className={`inline-block text-[10px] font-medium px-2 py-1 rounded-full ${tagBg}`}>{p.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
