"use client";

import BackgroundParticles from "@/components/BackgroundParticles";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

export default function PrivacyPage() {
    return (
        <>
            <BackgroundParticles />
            <main className="min-h-screen pt-32 pb-16 relative z-10">
                <article className="max-w-4xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="title-large mb-12 text-center">Privacy Protocol</h1>

                        <div className="prose prose-invert max-w-none">
                            <section className="mb-12">
                                <p className="subtitle mb-8 text-center accent">
                                    LAST UPDATED: DECEMBER 2025
                                </p>

                                <p className="font-serif text-xl leading-relaxed mb-8 opacity-90">
                                    The Key Foundation operates on a principle of absolute sovereignty.
                                    We believe that privacy is not a privilege, but a fundamental human right.
                                    This document outlines our minimal data practices, designed solely to facilitate
                                    encrypted communication without compromise.
                                </p>
                            </section>

                            <div className="space-y-12 font-serif">
                                <section className="engine-section !py-8 !border-0 !bg-transparent">
                                    <h2 className="text-2xl font-cinzel text-accent mb-4">1. Zero-Knowledge Architecture</h2>
                                    <p className="opacity-80 leading-relaxed">
                                        Our systems are built on a zero-knowledge proof architecture.
                                        We do not have access to your private keys, your messages, or your contacts.
                                        All encryption happens locally on your device before any data touches our relays.
                                        What we cannot see, we cannot sell, share, or surrender.
                                    </p>
                                </section>

                                <section className="engine-section !py-8 !border-0 !bg-transparent">
                                    <h2 className="text-2xl font-cinzel text-accent mb-4">2. Data Minimization</h2>
                                    <p className="opacity-80 leading-relaxed">
                                        We collect only what is strictly necessary for the protocol to function:
                                    </p>
                                    <ul className="list-disc pl-6 space-y-2 mt-4 opacity-70 font-mono text-sm">
                                        <li>Public Keys (for addressing)</li>
                                        <li>Encrypted Message Blobs (temporarily, for delivery)</li>
                                        <li>Connection Metadata (ephemeral, for routing)</li>
                                    </ul>
                                </section>

                                <section className="engine-section !py-8 !border-0 !bg-transparent">
                                    <h2 className="text-2xl font-cinzel text-accent mb-4">3. Local Sovereignty</h2>
                                    <p className="opacity-80 leading-relaxed">
                                        Your data lives on your device. We provide no cloud backups of unencrypted data.
                                        If you lose your device and your seed phrase, your data is gone forever.
                                        This is a feature, not a bug. It ensures that you are the sole custodian of your digital life.
                                    </p>
                                </section>

                                <section className="engine-section !py-8 !border-0 !bg-transparent">
                                    <h2 className="text-2xl font-cinzel text-accent mb-4">4. Network Analytics</h2>
                                    <p className="opacity-80 leading-relaxed">
                                        We do not use third-party analytics trackers (Google Analytics, Mixpanel, etc.) on our core messaging infrastructure.
                                        Our web gateway may collect basic, anonymized server logs for DDoS protection and uptime monitoring,
                                        which are purged regularly.
                                    </p>
                                </section>

                                <section className="engine-section !py-8 !border-0 !bg-transparent">
                                    <h2 className="text-2xl font-cinzel text-accent mb-4">5. Modifications</h2>
                                    <p className="opacity-80 leading-relaxed">
                                        The Key Foundation may update this protocol document as our technology evolves.
                                        Immutable updates will be broadcasted via our official signed channels.
                                    </p>
                                </section>
                            </div>
                        </div>
                    </motion.div>
                </article>
            </main>
            <Footer />
        </>
    );
}
