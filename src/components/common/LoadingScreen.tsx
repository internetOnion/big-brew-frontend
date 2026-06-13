import { motion } from "motion/react";

const LoadingScreen = () => (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
        <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <motion.div
                className="size-6 rounded-full border-2 border-muted border-t-primary"
                animate={{ rotate: 360 }}
                transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />
            <span className="font-mono text-sm font-medium text-muted-foreground">
                Loading...
            </span>
        </motion.div>
    </div>
);

export default LoadingScreen;
