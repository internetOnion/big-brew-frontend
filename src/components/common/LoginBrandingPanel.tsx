import { motion } from "motion/react";

const RINGS = [
    { size: 620, opacity: 6, delay: 0 },
    { size: 520, opacity: 10, delay: 0.08 },
    { size: 420, opacity: 14, delay: 0.16 },
    { size: 320, opacity: 18, delay: 0.24 },
    { size: 220, opacity: 22, delay: 0.32 },
    { size: 140, opacity: 28, delay: 0.4 },
] as const;

export const LoginBrandingPanel = () => (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary to-accent/25 lg:w-[48%]">
        {RINGS.map((ring) => (
            <motion.div
                key={ring.size}
                className={`absolute top-1/2 left-1/2 h-[${ring.size}px] w-[${ring.size}px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary-foreground/${ring.opacity}`}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                    duration: 1.4,
                    delay: ring.delay,
                    ease: [0.25, 0.46, 0.45, 0.94],
                }}
            />
        ))}

        <motion.div
            className="relative z-10 flex flex-col items-center gap-6"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
                duration: 0.9,
                delay: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
        >
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-primary-foreground/25 bg-primary-foreground/10 shadow-[0_0_60px_-12px_rgba(255,255,255,0.15)]">
                <img
                    src="/homebrew.svg"
                    alt="Homebrew"
                    className="size-12 brightness-0 invert"
                />
            </div>
            <div className="text-center">
                <h1 className="font-sans text-5xl font-extrabold leading-none tracking-tight text-primary-foreground">
                    Big Brew
                </h1>
                <p className="mt-3 font-mono text-xs uppercase tracking-[0.15em] text-primary-foreground/60">
                    Point of Sale
                </p>
            </div>
        </motion.div>

        <motion.p
            className="absolute bottom-8 font-mono text-[10px] tracking-[0.12em] text-primary-foreground/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
        >
            Brewing since 2024
        </motion.p>
    </div>
);
