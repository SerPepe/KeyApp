"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Footer from "@/components/Footer"

export const metadata = {
    title: "Whitepaper | Key Protocol",
    description: "Technical whitepaper for the Key Protocol - a permissionless messaging protocol on Solana with end-to-end encryption"
}

export default function Whitepaper() {
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
    }

    return (
        <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)] relative overflow-hidden">
            {/* Background Gradient */}
            <div className="fixed inset-0 bg-gradient-to-b from-transparent via-[rgba(212,175,55,0.02)] to-transparent pointer-events-none" />

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-xl">
                <div className="max-w-[1400px] mx-auto px-8 py-6 flex justify-between items-center">
                    <Link href="/" className="accent font-serif text-2xl tracking-widest no-underline">
                        KEY
                    </Link>
                    <div className="flex gap-8 items-center">
                        <Link href="/docs" className="opacity-60 hover:opacity-100 transition-opacity mono text-sm">
                            Docs
                        </Link>
                        <Link href="/" className="opacity-60 hover:opacity-100 transition-opacity mono text-sm">
                            Home
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-32 pb-40 px-8">
                <div className="max-w-[900px] mx-auto">
                    <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                        <p className="mono text-xs opacity-40 uppercase tracking-widest mb-4">Technical Whitepaper V1.0</p>
                        <h1 className="font-serif text-6xl mb-6 accent">Key Protocol</h1>
                        <p className="text-2xl opacity-60 font-serif italic mb-16">
                            A Permissionless Messaging Protocol on Solana
                        </p>
                    </motion.div>

                    {/* Abstract */}
                    <section className="mb-24">
                        <h2 className="text-3xl font-serif italic mb-6 border-b border-[var(--accent)] pb-4 inline-block pr-12">
                            Abstract
                        </h2>
                        <p className="text-lg leading-relaxed opacity-80 mb-6">
                            Key is an open, permissionless messaging protocol built on Solana that combines end-to-end encryption
                            with blockchain immutability. By abstracting transaction costs through a fee-payer model and storing
                            encrypted messages on-chain via memo instructions, Key provides a censorship-resistant communication
                            layer with no vendor lock-in.
                        </p>
                        <p className="leading-relaxed opacity-70">
                            This whitepaper describes the technical architecture, cryptographic implementation, and economic
                            sustainability model that enables truly sovereign digital communication.
                        </p>
                    </section>

                    {/* Problem Statement */}
                    <section className="mb-24">
                        <h2 className="text-3xl font-serif italic mb-6 border-b border-[var(--accent)] pb-4 inline-block pr-12">
                            Problem Statement
                        </h2>
                        <div className="space-y-6">
                            <p className="leading-relaxed opacity-80">
                                Modern messaging platforms suffer from three critical vulnerabilities:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-6 bg-[rgba(255,0,0,0.05)] border border-[rgba(255,0,0,0.1)]">
                                    <h4 className="mono accent text-xs uppercase mb-3">Centralization</h4>
                                    <p className="text-sm opacity-80">Messages stored on corporate servers, subject to surveillance and deletion.</p>
                                </div>
                                <div className="p-6 bg-[rgba(255,0,0,0.05)] border border-[rgba(255,0,0,0.1)]">
                                    <h4 className="mono accent text-xs uppercase mb-3">Vendor Lock-In</h4>
                                    <p className="text-sm opacity-80">Users cannot export their identity or migrate to alternative clients.</p>
                                </div>
                                <div className="p-6 bg-[rgba(255,0,0,0.05)] border border-[rgba(255,0,0,0.1)]">
                                    <h4 className="mono accent text-xs uppercase mb-3">Cost Barriers</h4>
                                    <p className="text-sm opacity-80">Blockchain-based solutions impose transaction fees that hinder adoption.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Solution */}
                    <section className="mb-24">
                        <h2 className="text-3xl font-serif italic mb-6 border-b border-[var(--accent)] pb-4 inline-block pr-12">
                            Solution Architecture
                        </h2>
                        <div className="space-y-8">
                            <div>
                                <h3 className="mono accent text-sm uppercase tracking-widest mb-4">1. Username Registry (Anchor Program)</h3>
                                <p className="leading-relaxed opacity-80 mb-4">
                                    A Solana program deployed at <code className="mono text-xs accent">96hG67JxhNEptr1LkdtDcrqvtWiHH3x4GibDBcdh4MYQ</code> manages
                                    the mapping of human-readable usernames to cryptographic public keys.
                                </p>
                                <div className="p-6 bg-[rgba(255,255,255,0.02)] border border-white/5">
                                    <p className="mono text-xs opacity-60 mb-2">Program Data Account (PDA):</p>
                                    <ul className="space-y-1 text-sm opacity-80 mono">
                                        <li>• Owner: Ed25519 public key (32 bytes)</li>
                                        <li>• Username: UTF-8 string (3-20 characters)</li>
                                        <li>• Encryption Key: X25519 public key (32 bytes)</li>
                                        <li>• Created At: Unix timestamp (8 bytes)</li>
                                    </ul>
                                </div>
                            </div>

                            <div>
                                <h3 className="mono accent text-sm uppercase tracking-widest mb-4">2. Message Transmission (Memo + Arweave)</h3>
                                <p className="leading-relaxed opacity-80 mb-4">
                                    Messages are transmitted via Solana memo instructions. For messages under 750 bytes, the encrypted
                                    content is stored directly in the memo. Larger messages are uploaded to Arweave with only the
                                    transaction ID stored on-chain.
                                </p>
                                <div className="p-6 bg-[rgba(255,255,255,0.02)] border border-white/5">
                                    <p className="mono text-xs opacity-60 mb-2">Transaction Structure:</p>
                                    <ul className="space-y-1 text-sm opacity-80 mono">
                                        <li>1. SystemProgram.transfer(1 lamport) → Triggers recipient listener</li>
                                        <li>2. MemoProgram → Stores "senderPubkey|encryptedMessage"</li>
                                        <li>3. Fee Payer Signature → Server subsidizes cost</li>
                                    </ul>
                                </div>
                            </div>

                            <div>
                                <h3 className="mono accent text-sm uppercase tracking-widest mb-4">3. Encryption Scheme (X25519 + ChaCha20)</h3>
                                <p className="leading-relaxed opacity-80 mb-4">
                                    All messages use NaCl box (X25519 Elliptic Curve Diffie-Hellman + ChaCha20-Poly1305 AEAD cipher).
                                    Encryption keys are derived from Ed25519 signing keys using the first 32 bytes.
                                </p>
                                <div className="p-6 bg-[rgba(0,255,0,0.05)] border border-[rgba(0,255,0,0.1)]">
                                    <p className="mono text-xs text-green-400 mb-2">Security Guarantees:</p>
                                    <ul className="space-y-1 text-sm opacity-80">
                                        <li>• 128-bit security level (X25519)</li>
                                        <li>• Authenticated encryption (Poly1305 MAC)</li>
                                        <li>• Random nonce per message (forward secrecy)</li>
                                        <li>• Client-side encryption (server never sees plaintext)</li>
                                    </ul>
                                </div>
                            </div>

                            <div>
                                <h3 className="mono accent text-sm uppercase tracking-widest mb-4">4. Fee Abstraction (Gasless UX)</h3>
                                <p className="leading-relaxed opacity-80">
                                    Users never pay transaction fees. A fee-payer service signs and submits all transactions to Solana.
                                    Users only sign with their own keypair to prove authorship.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Security Model */}
                    <section className="mb-24">
                        <h2 className="text-3xl font-serif italic mb-6 border-b border-[var(--accent)] pb-4 inline-block pr-12">
                            Security Model
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="mono accent text-sm uppercase tracking-widest mb-4">Threat Model</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="mono text-xs opacity-60 mb-3">Protected Against:</p>
                                        <ul className="space-y-2 text-sm opacity-80">
                                            <li>• Server-side decryption (keys never leave device)</li>
                                            <li>• Message tampering (authenticated encryption)</li>
                                            <li>• Replay attacks (5-minute timestamp window)</li>
                                            <li>• Spoofing (Ed25519 signature verification)</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <p className="mono text-xs opacity-60 mb-3">Limitations:</p>
                                        <ul className="space-y-2 text-sm opacity-80">
                                            <li>• Metadata visible (sender/recipient/timestamp)</li>
                                            <li>• No perfect forward secrecy (no key ratcheting)</li>
                                            <li>• Compromised keypair leaks all messages</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Tokenomics */}
                    <section className="mb-24">
                        <h2 className="text-3xl font-serif italic mb-6 border-b border-[var(--accent)] pb-4 inline-block pr-12">
                            Tokenomics
                        </h2>
                        <p className="leading-relaxed opacity-80 mb-6">
                            The Key Protocol is sustained by the $KEY token launched on Bags.fm. Creator fees from $KEY trading
                            volume fund the fee-payer service, subsidizing all transaction costs for users.
                        </p>
                        <div className="p-6 bg-[rgba(212,175,55,0.03)] border border-[rgba(212,175,55,0.1)] rounded-lg">
                            <p className="font-serif italic text-lg accent">
                                "By holding $KEY, you are not just an investor; you are a Patron of privacy."
                            </p>
                        </div>
                    </section>

                    {/* Open Protocol */}
                    <section className="mb-24">
                        <h2 className="text-3xl font-serif italic mb-6 border-b border-[var(--accent)] pb-4 inline-block pr-12">
                            Decentralization & Open Protocol
                        </h2>
                        <p className="leading-relaxed opacity-80 mb-6">
                            Key is fully open and permissionless. Any developer can:
                        </p>
                        <ul className="space-y-3 text-sm opacity-80">
                            <li>• Build alternative frontends with custom UI/UX</li>
                            <li>• Deploy their own fee-payer service</li>
                            <li>• Call the username registry program directly via Solana RPC</li>
                            <li>• Create platform-specific clients (desktop, CLI, mobile)</li>
                        </ul>
                        <p className="leading-relaxed opacity-70 mt-6">
                            Users retain full sovereignty over their keypairs and can export their identity to any compatible client.
                        </p>
                    </section>

                    {/* Group Chat Architecture */}
                    <section className="mb-24">
                        <h2 className="text-3xl font-serif italic mb-6 border-b border-[var(--accent)] pb-4 inline-block pr-12">
                            Group Chat Architecture
                        </h2>
                        <p className="text-sm opacity-80 mb-6 leading-relaxed">
                            Key implements Signal-style hybrid encryption for group messaging, supporting up to 50 members
                            with full end-to-end encryption. No group messages are stored in plaintext - ever.
                        </p>

                        <h3 className="text-xl font-serif mb-4 accent">Encryption Flow</h3>
                        <div className="space-y-3 text-sm opacity-80 mb-6">
                            <p><strong className="accent">1. Message Encryption:</strong> Generate random ChaCha20 symmetric key → Encrypt message with symmetric key</p>
                            <p><strong className="accent">2. Key Distribution:</strong> Encrypt symmetric key separately for each member using their X25519 public key</p>
                            <p><strong className="accent">3. Storage:</strong> Upload encrypted payload to Arweave: {`{encryptedMessage, encryptedKeys: {member1: key1, ...}}`}</p>
                            <p><strong className="accent">4. Notification:</strong> Send 1 lamport transaction to each member with memo: {`group:groupId:arweaveTxId`}</p>
                            <p><strong className="accent">5. Decryption:</strong> Member receives notification → Fetches from Arweave → Decrypts their personal key → Decrypts message</p>
                        </div>

                        <h3 className="text-xl font-serif mb-4 accent">Data Storage</h3>
                        <ul className="space-y-2 text-sm opacity-80">
                            <li>• <strong>Redis:</strong> Group metadata only (name, member list) - NO MESSAGES</li>
                            <li>• <strong>Arweave:</strong> Encrypted message payloads (cannot be decrypted without member keys)</li>
                            <li>• <strong>Solana:</strong> Notification transactions (pointers only, no content)</li>
                            <li>• <strong>Your Device:</strong> Decryption keys never leave your device</li>
                        </ul>
                    </section>

                    {/* Roadmap */}
                    <section className="mb-24">
                        <h2 className="text-3xl font-serif italic mb-6 border-b border-[var(--accent)] pb-4 inline-block pr-12">
                            Roadmap
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <span className="mono text-xs signal">LIVE</span>
                                <div>
                                    <p className="font-serif">Group Chat Support ✓</p>
                                    <p className="text-sm opacity-60">Hybrid encryption for up to 50 members with Arweave storage</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <span className="mono text-xs accent">Q2 2026</span>
                                <div>
                                    <p className="font-serif">Ephemeral Messages</p>
                                    <p className="text-sm opacity-60">Self-destructing messages with local-only mode</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <span className="mono text-xs accent">Q3 2026</span>
                                <div>
                                    <p className="font-serif">Desktop Clients</p>
                                    <p className="text-sm opacity-60">Native macOS/Windows/Linux applications</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* References */}
                    <section className="mb-24">
                        <h2 className="text-3xl font-serif italic mb-6 border-b border-[var(--accent)] pb-4 inline-block pr-12">
                            References
                        </h2>
                        <ul className="space-y-2 text-sm opacity-80 mono">
                            <li>• Program: <a href="https://explorer.solana.com/address/96hG67JxhNEptr1LkdtDcrqvtWiHH3x4GibDBcdh4MYQ?cluster=devnet" className="accent hover:underline" target="_blank" rel="noopener">96hG67JxhNEptr1LkdtDcrqvtWiHH3x4GibDBcdh4MYQ</a></li>
                            <li>• Source Code: <a href="https://github.com/SerPepe/KeyApp" className="accent hover:underline" target="_blank" rel="noopener">github.com/SerPepe/KeyApp</a></li>
                            <li>• API: <a href="https://keyapp-production.up.railway.app" className="accent hover:underline" target="_blank" rel="noopener">keyapp-production.up.railway.app</a></li>
                            <li>• Solana Docs: <a href="https://docs.solana.com" className="accent hover:underline" target="_blank" rel="noopener">docs.solana.com</a></li>
                        </ul>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    )
}
