import { motion } from "motion/react";

const RINGS = [
    { size: 600, opacity: 8, delay: 0 },
    { size: 480, opacity: 12, delay: 0.1 },
    { size: 360, opacity: 16, delay: 0.2 },
    { size: 240, opacity: 20, delay: 0.3 },
] as const;

export const LoginBrandingPanel = () => (
    <div className="relative flex w-[42%] flex-col items-center justify-center overflow-hidden bg-primary">
        {RINGS.map((ring) => (
            <motion.div
                key={ring.size}
                className={`absolute top-1/2 left-1/2 h-[${ring.size}px] w-[${ring.size}px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary-foreground/${ring.opacity}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                    duration: 1.2,
                    delay: ring.delay,
                    ease: "easeOut",
                }}
            />
        ))}

        <motion.div
            className="relative z-10 flex flex-col items-center gap-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        >
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-primary-foreground/25 bg-primary-foreground/15">
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
                <p className="mt-3 font-mono text-xs uppercase tracking-[0.15em] text-primary-foreground/70">
                    Point of Sale
                </p>
            </div>
        </motion.div>

        <motion.p
            className="absolute bottom-10 font-mono text-[11px] tracking-[0.1em] text-primary-foreground/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
        >
            crafted with care since 2024
        </motion.p>
    </div>
);
