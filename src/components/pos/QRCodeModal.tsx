import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

interface QRCodeModalProps {
  amount: number;
  currency?: "USD" | "KHR";
  onClose: () => void;
}

const KHR_RATE = 4100;

export function QRCodeModal({ amount, currency = "USD", onClose }: QRCodeModalProps) {
  const displayAmount = currency === "KHR"
    ? "៛" + Math.round(amount * KHR_RATE).toLocaleString()
    : "$" + amount.toFixed(2);
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ background: "rgba(10,6,2,0.8)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      >
        <motion.div
          className="relative mx-4 rounded-2xl overflow-hidden flex flex-col items-center"
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.88, opacity: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 260 }}
          style={{ background: "var(--card)", border: "1px solid var(--border)", padding: "32px 40px", minWidth: 300 }}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 hover:opacity-60 transition-opacity"
            style={{ color: "var(--muted-foreground)" }}
          >
            <X size={18} />
          </button>

          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--muted-foreground)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
            Scan to Pay
          </p>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, color: "var(--primary)", fontWeight: 600, marginBottom: 24 }}>
            {displayAmount}
          </p>

          {/* QR Code SVG — a decorative but realistic-looking QR pattern */}
          <div className="rounded-xl overflow-hidden" style={{ background: "#fff", padding: 16 }}>
            <svg width={160} height={160} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Top-left finder pattern */}
              <rect x="8" y="8" width="44" height="44" rx="4" fill="#1a1008"/>
              <rect x="16" y="16" width="28" height="28" rx="2" fill="#fff"/>
              <rect x="22" y="22" width="16" height="16" rx="1" fill="#1a1008"/>
              {/* Top-right finder pattern */}
              <rect x="108" y="8" width="44" height="44" rx="4" fill="#1a1008"/>
              <rect x="116" y="16" width="28" height="28" rx="2" fill="#fff"/>
              <rect x="122" y="22" width="16" height="16" rx="1" fill="#1a1008"/>
              {/* Bottom-left finder pattern */}
              <rect x="8" y="108" width="44" height="44" rx="4" fill="#1a1008"/>
              <rect x="16" y="116" width="28" height="28" rx="2" fill="#fff"/>
              <rect x="22" y="122" width="16" height="16" rx="1" fill="#1a1008"/>
              {/* Data modules (simplified decorative pattern) */}
              {[60,66,72,78,84,90,96].map((x, xi) =>
                [8,14,20,26,32,38,44,50,56].map((y, yi) =>
                  (xi + yi) % 3 !== 0 ? <rect key={`${x}-${y}`} x={x} y={y} width="5" height="5" rx="1" fill="#1a1008" /> : null
                )
              )}
              {[8,14,20,26,32,38,44,50,56].map((x, xi) =>
                [60,66,72,78,84,90,96,102].map((y, yi) =>
                  (xi * 2 + yi) % 3 !== 1 ? <rect key={`${x}-${y}`} x={x} y={y} width="5" height="5" rx="1" fill="#1a1008" /> : null
                )
              )}
              {[60,66,72,78,84,90,96,102].map((x, xi) =>
                [60,66,72,78,84,90,96,102].map((y, yi) =>
                  (xi + yi * 3) % 4 !== 2 ? <rect key={`${x}-${y}`} x={x} y={y} width="5" height="5" rx="1" fill="#1a1008" /> : null
                )
              )}
              {[108,114,120,126,132,138,144,150].map((x, xi) =>
                [60,66,72,78,84,90,96,102].map((y, yi) =>
                  (xi * 3 + yi) % 3 !== 0 ? <rect key={`${x}-${y}`} x={x} y={y} width="5" height="5" rx="1" fill="#1a1008" /> : null
                )
              )}
              {[8,14,20,26,32,38,44,50,56,60,66,72,78,84,90,96,102].map((x, xi) =>
                [108,114,120,126,132,138,144,150].map((y, yi) =>
                  (xi + yi * 2) % 3 !== 1 ? <rect key={`${x}-${y}`} x={x} y={y} width="5" height="5" rx="1" fill="#1a1008" /> : null
                )
              )}
              {/* Center logo area */}
              <rect x="68" y="68" width="24" height="24" rx="4" fill="#d4843a"/>
              {/* center logo — no emoji, colored square only */}
            </svg>
          </div>

          <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 16, textAlign: "center" }}>
            Waiting for payment confirmation…
          </p>
          <div className="flex gap-1 mt-3">
            {[0,1,2].map(i => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)" }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
