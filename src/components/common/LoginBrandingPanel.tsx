import { motion } from "motion/react";

const RINGS = [
    { size: 620, opacity: 0.06, delay: 0 },
    { size: 520, opacity: 0.1, delay: 0.08 },
    { size: 420, opacity: 0.14, delay: 0.16 },
    { size: 320, opacity: 0.18, delay: 0.24 },
    { size: 220, opacity: 0.22, delay: 0.32 },
    { size: 140, opacity: 0.28, delay: 0.4 },
] as const;

export const LoginBrandingPanel = () => (
    <div className="relative flex h-[35vh] w-full flex-col items-center justify-center overflow-hidden bg-[#faf8f5] md:h-[40vh] lg:h-auto lg:w-[48%]">
        <div className="pointer-events-none absolute inset-0 scale-[0.45] md:scale-[0.6] lg:scale-100">
            {RINGS.map((ring) => (
                <motion.div
                    key={ring.size}
                    style={{
                        width: ring.size,
                        height: ring.size,
                        borderColor: `rgba(74, 37, 18, ${ring.opacity})`,
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        duration: 1.4,
                        delay: ring.delay,
                        ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                />
            ))}
        </div>

        <motion.div
            className="relative z-10 flex flex-col items-center gap-4 md:gap-6"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
                duration: 0.9,
                delay: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
        >
            <div className="flex size-16 items-center justify-center rounded-2xl border border-[#4a2512]/10 bg-[#4a2512]/5 md:size-20">
                <img
                    src="/homebrew.svg"
                    alt="Homebrew"
                    className="size-10 md:size-12"
                />
            </div>
            <div className="text-center">
                <h1 className="font-sans text-3xl font-extrabold leading-none tracking-tight text-[#4a2512] md:text-5xl">
                    Big Brew
                </h1>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[#8b7a67] md:mt-3 md:text-xs">
                    Point of Sale
                </p>
            </div>
        </motion.div>

        <motion.p
            className="absolute bottom-6 font-mono text-[10px] tracking-[0.12em] text-[#a89888] md:bottom-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
        >
            Brewing since 2024
        </motion.p>
    </div>
);
