"use client"

import { motion } from "framer-motion"
import SkeletonKey from "./SkeletonKey"

export default function Hero() {
    return (
        <section className="hero-section">
            <div className="hero-grid">
                <div className="hero-text">
                    <motion.h1
                        className="title-large"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                    >
                        The Sovereign <br />
                        <span className="accent">Whisper.</span>
                    </motion.h1>

                    <motion.p
                        className="subtitle mono"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 0.8, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 }}
                    >
                        Unstoppable, encrypted communication. <br />
                        Powered by Solana. Free forever.
                    </motion.p>

                    <motion.div
                        className="hero-ctas flex flex-col items-center gap-6"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 1 }}
                    >
                        <div className="flex flex-row items-center gap-4">
                            <a href="#" className="btn">Download Key</a>
                            <a href="https://pump.fun/board" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">Trade $KEY</a>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <a href="https://web.trykey.app/onboarding" target="_blank" rel="noopener noreferrer" className="text-accent underline hover:opacity-80 transition-opacity">Open Key Web</a>
                            <a href="https://github.com/SerPepe/KeyApp" target="_blank" rel="noopener noreferrer" className="text-sm opacity-50 hover:opacity-100 transition-opacity">View Source</a>
                        </div>
                    </motion.div>
                </div>

                <div className="hero-visual">
                    <SkeletonKey />
                </div>
            </div>
        </section>
    )
}
