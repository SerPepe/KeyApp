"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useState } from "react"

export default function Docs() {
    const [activeSection, setActiveSection] = useState("overview")

    const sections = [
        { id: "overview", title: "01. Overview" },
        { id: "anchor", title: "02. Anchor Protocol" },
        { id: "whisper", title: "03. Whisper Mechanism" },
        { id: "feepayer", title: "04. Fee Payer" },
        { id: "sustainability", title: "05. Sustainability" },
        { id: "manifesto", title: "06. Manifesto" }
    ]

    const fadeIn = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
    }

    return (
        <div className="docs-container">
            {/* Sidebar Navigation */}
            <aside className="docs-sidebar">
                <div className="mb-12">
                    <Link href="/" className="accent font-serif text-2xl tracking-widest no-underline">KEY</Link>
                    <p className="mono text-[10px] opacity-40 mt-1">INTERNAL_DOCS_V1</p>
                </div>

                <nav>
                    {sections.map((section) => (
                        <a
                            key={section.id}
                            href={`#${section.id}`}
                            className={activeSection === section.id ? "active" : ""}
                            onClick={() => setActiveSection(section.id)}
                        >
                            {section.title}
                        </a>
                    ))}
                    <Link href="/" className="mt-8 opacity-40 hover:opacity-100 italic">
                        ← Exit Docs
                    </Link>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="docs-content">
                <div className="max-w-[800px]">
                    <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                        <h1 className="title-large mb-12">System Architecture</h1>
                    </motion.div>

                    <section id="overview" className="mb-32">
                        <h2 className="text-3xl font-serif italic mb-8 border-b border-[var(--accent)] pb-4 inline-block pr-12">
                            01. Overview
                        </h2>
                        <div className="space-y-6">
                            <p className="text-lg leading-relaxed">
                                The Key Protocol is an <span className="accent">algorithmic baroque</span> approach to
                                digital sovereignty. It provides a layer of absolute privacy for communication
                                atop the high-performance Solana ledger.
                            </p>
                            <p className="text-lg leading-relaxed opacity-80">
                                Unlike traditional messaging apps, Key does not utilize a traditional database for
                                message storage. Instead, it leverages the ledger as an immutable, append-only
                                transmission medium, using the Fee Payer Network to subsidize the friction of
                                blockchain interactions.
                            </p>
                            <div className="p-6 bg-[rgba(212,175,55,0.03)] border border-[rgba(212,175,55,0.1)] rounded-lg">
                                <h3 className="mono text-xs accent uppercase mb-4 tracking-widest">Key Principles</h3>
                                <ul className="space-y-3 mono text-sm opacity-80">
                                    <li>• Identity is local and absolute.</li>
                                    <li>• Transmission is public, content is private.</li>
                                    <li>• Sovereignty is gasless.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section id="anchor" className="mb-32">
                        <h2 className="text-3xl font-serif italic mb-8 border-b border-[var(--accent)] pb-4 inline-block pr-12">
                            02. Anchor Protocol
                        </h2>
                        <p className="mb-8 opacity-80 leading-relaxed">
                            The identity registry is governed by a secure Anchor program. It manages the
                            mapping of human-readable handles to cryptographic public keys.
                        </p>

                        <div className="code-block">
                            <pre className="text-blue-400">#[program]</pre>
                            <pre className="text-white">pub mod key_registry &#123;</pre>
                            <pre className="text-emerald-400">    pub fn register_username(ctx: Context, username: String) -&gt; Result&lt;()&gt; &#123;</pre>
                            <pre className="text-gray-400">        let user_account = &mut ctx.accounts.user_account;</pre>
                            <pre className="text-gray-400">        user_account.owner = ctx.accounts.owner.key();</pre>
                            <pre className="text-gray-400">        user_account.username = username.to_lowercase();</pre>
                            <pre className="text-emerald-400">        Ok(())</pre>
                            <pre className="text-white">    &#125;</pre>
                            <pre className="text-white">&#125;</pre>
                        </div>

                        <p className="leading-relaxed opacity-80">
                            Each username exists as a <span className="accent">Program Derived Address (PDA)</span>.
                            This design prevents handle-space collisions and ensures that each handle can only
                            be initialized once, effectively creating a decentralized name service for messaging.
                        </p>
                    </section>

                    <section id="whisper" className="mb-32">
                        <h2 className="text-3xl font-serif italic mb-8 border-b border-[var(--accent)] pb-4 inline-block pr-12">
                            03. Whisper Mechanism
                        </h2>
                        <p className="mb-8 opacity-80 leading-relaxed">
                            Communication is achieved through "Whisper Transactions" — tiny SOL transfers
                            carrying encrypted payloads in their memo data.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            <div className="bg-[rgba(255,255,255,0.02)] p-6 border border-white/5">
                                <h4 className="mono accent text-xs mb-4 uppercase">Phase I: Local</h4>
                                <p className="text-sm opacity-70">
                                    Sender generates an ephemeral keypair and performs a Diffie-Hellman exchange
                                    to derive a symmetric key. The message is encrypted via XSalsa20-Poly1305.
                                </p>
                            </div>
                            <div className="bg-[rgba(255,255,255,0.02)] p-6 border border-white/5">
                                <h4 className="mono accent text-xs mb-4 uppercase">Phase II: Ledger</h4>
                                <p className="text-sm opacity-70">
                                    The Fee Payer prepares a transaction with a SystemProgram::transfer
                                    of 1 lamport to the recipient, embedding the encrypted blob in a
                                    SplMemo instruction.
                                </p>
                            </div>
                        </div>

                        <div className="p-8 border-l border-[var(--signal)] bg-[rgba(0,127,255,0.03)] text-sm">
                            <p className="mono text-[var(--signal)] mb-2 uppercase tracking-widest text-[10px]">Security Note</p>
                            <p className="opacity-70 italic font-serif">
                                "The ledger acts as a public waterfall. While everyone can see the water falling,
                                only those who hold the matching key can extract the meaning from the spray."
                            </p>
                        </div>
                    </section>

                    <section id="feepayer" className="mb-32">
                        <h2 className="text-3xl font-serif italic mb-8 border-b border-[var(--accent)] pb-4 inline-block pr-12">
                            04. Fee Payer
                        </h2>
                        <p className="mb-8 opacity-80 leading-relaxed">
                            To enable a frictionless user experience, Key operates a robust Fee Payer Network.
                            This off-chain service manages the operational treasury required to fund user activity.
                        </p>

                        <ul className="space-y-8">
                            <li>
                                <h4 className="font-serif accent text-xl mb-2">Automated Underwriting</h4>
                                <p className="opacity-70">
                                    The API uses sophisticated rate-limiting and spending caps (0.01 SOL/day per user)
                                    to ensure the sustainability of the free-forever model while preventing malicious drain.
                                </p>
                            </li>
                            <li>
                                <h4 className="font-serif accent text-xl mb-2">Non-Custodial Design</h4>
                                <p className="opacity-70">
                                    While the Fee Payer signs for gas, it never has access to identity keys or
                                    message content. It is a blind service, underwriting the costs of sovereignty
                                    without compromising it.
                                </p>
                            </li>
                        </ul>
                    </section>

                    <section id="sustainability" className="mb-32">
                        <h2 className="text-3xl font-serif italic mb-8 border-b border-[var(--accent)] pb-4 inline-block pr-12">
                            05. Sustainability
                        </h2>
                        <div className="space-y-8">
                            <p className="font-serif italic text-2xl leading-relaxed text-[var(--accent)] opacity-90 border-l-2 border-[var(--accent)] pl-8">
                                "True privacy should not have a subscription fee. The Key Protocol is sustained by the $KEY token on Pump.fun. We utilize the creator fees generated by $KEY volume to subsidize gas costs for every message sent on the network. By holding $KEY, you are not just an investor; you are a Patron of privacy."
                            </p>
                            <p className="opacity-80 leading-relaxed">
                                The Key Protocol is a native Solana protocol. Every whisper, every registry update, and every signal is a permanent, onchain record on the Solana blockchain. We don't hide behind sidechains; we leverage the raw performance of the mainnet.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 bg-[rgba(255,255,255,0.02)] border border-white/5">
                                    <h4 className="mono accent text-xs mb-2 uppercase">Network</h4>
                                    <p className="text-xl font-serif">Solana Mainnet</p>
                                </div>
                                <div className="p-6 bg-[rgba(255,255,255,0.02)] border border-white/5">
                                    <h4 className="mono accent text-xs mb-2 uppercase">Token Launch</h4>
                                    <p className="text-xl font-serif">Pump.fun</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="manifesto" className="pb-40">
                        <h2 className="text-3xl font-serif italic mb-8 border-b border-[var(--ink)] pb-4 inline-block pr-12">
                            06. Manifesto
                        </h2>
                        <div className="font-serif italic text-2xl leading-relaxed opacity-90 border-l-2 border-[var(--accent)] pl-8 space-y-8">
                            <p>
                                In an era of digital panopticons, we reclaim the whisper.
                                We believe that privacy is not a luxury for the guilty,
                                but a prerequisite for the free.
                            </p>
                            <p>
                                Key is not just a tool, but a statement. It is the architectural
                                embodiment of the idea that code can be as immutable as stone
                                and as fleeting as thought.
                            </p>
                            <p className="text-[var(--accent)]">
                                Verba Volant, Scripta Manent.
                            </p>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}
