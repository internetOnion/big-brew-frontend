import { useState } from "react";
import { motion } from "motion/react";
import {
  Delete,
  ArrowLeft,
  CheckCircle2,
  Coffee,
  Milk,
  Leaf,
  GlassWater,
  Croissant,
  type LucideIcon,
} from "lucide-react";
import { QRCodeModal } from "./QRCodeModal";
import { type CartItem } from "./data";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  espresso: Coffee,
  milk: Milk,
  tea: Leaf,
  cold: GlassWater,
  food: Croissant,
};

interface PaymentScreenProps {
  total: number;
  items: CartItem[];
  onBack: () => void;
  onComplete: () => void;
}

const KHR_RATE = 4100;

export function PaymentScreen({ total, items, onBack, onComplete }: PaymentScreenProps) {
  const [entered, setEntered] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [currency, setCurrency] = useState<"USD" | "KHR">("USD");
  const [success, setSuccess] = useState(false);

  const totalInCurrency = currency === "KHR" ? total * KHR_RATE : total;
  const enteredAmount = parseFloat(entered) || 0;
  const change = enteredAmount - totalInCurrency;
  const isFullyPaid = enteredAmount >= totalInCurrency && enteredAmount > 0;

  const handleKey = (k: string) => {
    if (currency === "KHR") {
      if (k === ".") return;
      setEntered(prev => prev + k);
      return;
    }
    if (k === "." && entered.includes(".")) return;
    if (k === "." && entered === "") { setEntered("0."); return; }
    if (entered.split(".")[1]?.length >= 2) return;
    setEntered(prev => prev + k);
  };

  const handleDelete = () => setEntered(prev => prev.slice(0, -1));

  const handleConfirmPayment = () => {
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onComplete();
    }, 1800);
  };

  const currencySymbol = currency === "USD" ? "$" : "៛";

  const formatDisplay = (val: number) =>
    currency === "USD" ? `$${val.toFixed(2)}` : `៛${Math.round(val).toLocaleString()}`;

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  if (success) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4" style={{ background: "var(--background)" }}>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 16, stiffness: 200 }}
          className="flex flex-col items-center gap-4"
          style={{ position: "relative" }}
        >
          {/* Pulse ring behind icon */}
          <motion.div
            style={{
              position: "absolute",
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(192,120,48,0.2)",
              top: 0,
            }}
            animate={{ scale: [1, 1.7], opacity: [0.4, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
          />
          <CheckCircle2 size={80} strokeWidth={1.5} style={{ color: "var(--accent)", position: "relative", zIndex: 1 }} />
          <p style={{ fontSize: 24, color: "var(--foreground)", fontWeight: 700 }}>Payment Complete</p>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, color: "var(--primary)" }}>
            Change: {change > 0 ? formatDisplay(change) : "$0.00"}
          </p>
        </motion.div>
      </div>
    );
  }

  const KEYS = [["1","2","3"],["4","5","6"],["7","8","9"],[".", "0","⌫"]];

  return (
    <div className="flex-1 flex flex-col" style={{ background: "var(--background)" }}>
      {showQR && <QRCodeModal amount={total} currency={currency} onClose={() => setShowQR(false)} />}

      {/* Top bar */}
      <div className="px-8 pt-6 pb-4 flex items-center gap-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <button onClick={onBack} className="hover:opacity-60 transition-opacity flex items-center gap-2" style={{ color: "var(--muted-foreground)", fontSize: 13 }}>
          <ArrowLeft size={16} /> Back to Menu
        </button>
        <div className="flex-1" />
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--muted-foreground)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Payment
        </p>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--muted-foreground)" }}>
          {itemCount} item{itemCount !== 1 ? "s" : ""} · ${total.toFixed(2)}
        </span>
      </div>

      <div className="flex-1 flex items-stretch">
        {/* Left — Amount display + keypad */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-6 gap-5">
          <div className="text-center">
            <p style={{ fontSize: 10, color: "var(--muted-foreground)", fontFamily: "'DM Mono', monospace", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
              Total Due
            </p>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 48, color: "var(--primary)", fontWeight: 700, lineHeight: 1 }}>
              {formatDisplay(totalInCurrency)}
            </p>
            {currency === "KHR" && (
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "var(--muted-foreground)", marginTop: 4 }}>
                ≈ ${total.toFixed(2)}
              </p>
            )}
          </div>

          {/* Amount entered */}
          <div
            className="w-full max-w-xs rounded-xl px-5 py-4 text-right"
            style={{
              background: "var(--secondary)",
              border: `1.5px solid ${entered ? "var(--accent)" : "var(--border)"}`,
              minHeight: 60,
              transition: "border-color 0.15s",
            }}
          >
            <p style={{ fontSize: 11, color: "var(--muted-foreground)", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", marginBottom: 2 }}>
              Amount Given
            </p>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 28, color: "var(--foreground)", fontWeight: 600, minHeight: 36 }}>
              {entered
                ? `${currencySymbol}${currency === "KHR" ? parseInt(entered || "0").toLocaleString() : entered}`
                : <span style={{ color: "var(--muted-foreground)", opacity: 0.4 }}>{formatDisplay(0)}</span>}
            </p>
          </div>

          {/* Change */}
          <div
            className="w-full max-w-xs rounded-xl px-5 py-3 flex justify-between items-center"
            style={{
              background: change >= 0 && enteredAmount > 0 ? "#DCFCE7" : change < 0 ? "#FEE2E2" : "var(--secondary)",
              border: `1.5px solid ${change >= 0 && enteredAmount > 0 ? "#86EFAC" : change < 0 ? "#FCA5A5" : "var(--border)"}`,
            }}
          >
            <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Change</span>
            <span style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 24,
              fontWeight: 700,
              color: change >= 0 && enteredAmount > 0 ? "#15803D" : change < 0 ? "#DC2626" : "var(--muted-foreground)",
            }}>
              {enteredAmount === 0
                ? "—"
                : change >= 0
                  ? formatDisplay(change)
                  : `-${currency === "USD" ? "$" : ""}${currency === "KHR" ? "៛" + Math.round(Math.abs(change)).toLocaleString() : Math.abs(change).toFixed(2)}`
              }
            </span>
          </div>

          {/* Keypad */}
          <div className="w-full max-w-xs grid gap-2" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {KEYS.flat().map(k => (
              <motion.button
                key={k}
                whileTap={{ scale: 0.93 }}
                onClick={() => k === "⌫" ? handleDelete() : handleKey(k)}
                className="py-5 rounded-xl flex items-center justify-center"
                style={{
                  background: k === "⌫" ? "rgba(192,57,43,0.12)" : "var(--secondary)",
                  color: k === "⌫" ? "#c0392b" : "var(--foreground)",
                  border: "1px solid #E2D8CC",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 20,
                  fontWeight: 600,
                  cursor: "pointer",
                  opacity: k === "." && currency === "KHR" ? 0.25 : 1,
                  pointerEvents: k === "." && currency === "KHR" ? "none" : "auto",
                  transition: "none",
                }}
              >
                {k === "⌫" ? <Delete size={18} /> : k}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Right — Order summary + Currency + Confirm */}
        <div className="flex flex-col" style={{ width: 280, borderLeft: "1px solid var(--border)" }}>

          {/* Currency toggle */}
          <div style={{ padding: "16px 16px 0" }}>
            <p style={{ fontSize: 11, color: "var(--muted-foreground)", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
              Order Summary
            </p>
            <div className="flex rounded-lg overflow-hidden" style={{ background: "var(--secondary)", padding: 2, gap: 2, marginBottom: 12 }}>
              {(["USD", "KHR"] as const).map(c => (
                <button
                  key={c}
                  onClick={() => { setCurrency(c); setEntered(""); }}
                  className="flex-1 py-1.5 rounded-md transition-all"
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 12,
                    fontWeight: 600,
                    background: currency === c ? "var(--primary)" : "transparent",
                    color: currency === c ? "var(--primary-foreground)" : "var(--muted-foreground)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {c === "USD" ? "$ USD" : "៛ KHR"}
                </button>
              ))}
            </div>
          </div>

          {/* Order items */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-2" style={{ padding: "0 16px 12px", scrollbarWidth: "none" }}>
            {items.map(item => {
              const Icon = CATEGORY_ICONS[item.category] ?? Coffee;
              return (
                <div key={item.id} className="flex items-start gap-2 py-2" style={{ borderBottom: "1px solid var(--border)", paddingLeft: 4 }}>
                  <Icon size={14} strokeWidth={1.5} style={{ color: "var(--primary)", marginTop: 2, flexShrink: 0 }} />
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 13, color: "var(--foreground)", fontWeight: 500 }}>
                      {item.quantity > 1 && <span style={{ color: "var(--accent)", fontWeight: 700 }}>{item.quantity}× </span>}
                      {item.name}
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 4px", marginTop: 3 }}>
                      {item.size && (
                        <span style={{ fontSize: 10, color: "var(--muted-foreground)", fontFamily: "'DM Mono', monospace", background: "var(--secondary)", borderRadius: 4, padding: "1px 5px", border: "1px solid var(--border)" }}>
                          {item.size}
                        </span>
                      )}
                      {item.sugarLevel && item.sugarLevel !== "50%" && (
                        <span style={{ fontSize: 10, color: "var(--muted-foreground)", background: "var(--secondary)", borderRadius: 4, padding: "1px 5px", border: "1px solid var(--border)" }}>
                          Sugar {item.sugarLevel}
                        </span>
                      )}
                      {item.toppings.map(topping => (
                        <span key={topping.name} style={{ fontSize: 10, color: "var(--muted-foreground)", background: "var(--secondary)", borderRadius: 4, padding: "1px 5px", border: "1px solid var(--border)" }}>
                          {topping.qty > 1 ? `${topping.qty}× ` : "+"}{topping.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--foreground)", fontWeight: 600, flexShrink: 0, textAlign: "right" }}>
                    {currency === "KHR" ? "៛" + Math.round(item.price * KHR_RATE).toLocaleString() : "$" + item.price.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Confirm button */}
          <div style={{ padding: "12px 16px 20px", borderTop: "1px solid var(--border)" }}>
            <motion.button
              onClick={handleConfirmPayment}
              disabled={!isFullyPaid}
              animate={isFullyPaid ? { scale: [1, 1.01, 1] } : { scale: 1 }}
              transition={isFullyPaid ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : {}}
              className="w-full rounded-xl flex flex-col items-center gap-1"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
                border: "none",
                cursor: isFullyPaid ? "pointer" : "not-allowed",
                opacity: isFullyPaid ? 1 : 0.3,
                padding: "16px 0",
                transition: "none",
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 15 }}>Confirm Payment</span>
              {!isFullyPaid && (
                <span style={{ fontSize: 10, opacity: 0.7 }}>Enter full amount</span>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentScreen;
