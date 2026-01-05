"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Footer from "@/components/Footer"

export default function Developers() {
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
    }

    return (
        <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)] relative overflow-hidden">
            {/* Background Gradient */}
            <div className="fixed inset-0 bg-gradient-to-b from-transparent via-[rgba(0,127,255,0.02)] to-transparent pointer-events-none" />

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
                        <Link href="/whitepaper" className="opacity-60 hover:opacity-100 transition-opacity mono text-sm">
                            Whitepaper
                        </Link>
                        <Link href="/" className="opacity-60 hover:opacity-100 transition-opacity mono text-sm">
                            Home
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-32 pb-40 px-8">
                <div className="max-w-[1200px] mx-auto">
                    <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                        <p className="mono text-xs opacity-40 uppercase tracking-widest mb-4">Developer Portal</p>
                        <h1 className="font-serif text-6xl mb-6 signal">Build on Key</h1>
                        <p className="text-2xl opacity-60 font-serif italic mb-16">
                            Open protocol, infinite possibilities
                        </p>
                    </motion.div>

                    {/* Quick Start */}
                    <section className="mb-24">
                        <h2 className="text-3xl font-serif italic mb-8 border-b border-[var(--signal)] pb-4 inline-block pr-12">
                            Quick Start
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="p-8 bg-[rgba(0,127,255,0.03)] border border-[rgba(0,127,255,0.1)]">
                                <h3 className="mono signal text-sm uppercase tracking-widest mb-4">Option 1: Use Key API</h3>
                                <p className="text-sm opacity-80 mb-4">
                                    Quickest way to get started. Use our API for username registration, message sending, and inbox fetching.
                                </p>
                                <p className="mono text-xs opacity-60">
                                    No blockchain knowledge required
                                </p>
                            </div>
                            <div className="p-8 bg-[rgba(212,175,55,0.03)] border border-[rgba(212,175,55,0.1)]">
                                <h3 className="mono accent text-sm uppercase tracking-widest mb-4">Option 2: Direct Program Calls</h3>
                                <p className="text-sm opacity-80 mb-4">
                                    Maximum control. Call the Solana program directly, implement your own fee-payer, build custom infrastructure.
                                </p>
                                <p className="mono text-xs opacity-60">
                                    Full customization, no dependencies
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* API Reference */}
                    <section className="mb-24">
                        <h2 className="text-3xl font-serif italic mb-8 border-b border-[var(--signal)] pb-4 inline-block pr-12">
                            API Reference
                        </h2>
                        <div className="space-y-8">
                            <div className="p-6 bg-[rgba(255,255,255,0.02)] border border-white/5">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <code className="mono text-sm accent">POST /api/username/register</code>
                                        <p className="text-sm opacity-60 mt-2">Register a new username on-chain</p>
                                    </div>
                                </div>
                                <div className="code-block text-xs">
                                    <pre className="text-emerald-400">{`// Request Body`}</pre>
                                    <pre className="text-white">&#123;</pre>
                                    <pre className="text-blue-400">{`  "username": "alice",`}</pre>
                                    <pre className="text-blue-400">{`  "publicKey": "Fkf3...base58",`}</pre>
                                    <pre className="text-blue-400">{`  "encryptionKey": "Ab4d...base64",`}</pre>
                                    <pre className="text-blue-400">{`  "signature": "YzNm...base64",`}</pre>
                                    <pre className="text-blue-400">{`  "timestamp": 1704067200000`}</pre>
                                    <pre className="text-white">&#125;</pre>
                                </div>
                            </div>

                            <div className="p-6 bg-[rgba(255,255,255,0.02)] border border-white/5">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <code className="mono text-sm accent">POST /api/message/send</code>
                                        <p className="text-sm opacity-60 mt-2">Send encrypted message to recipient</p>
                                    </div>
                                </div>
                                <div className="code-block text-xs">
                                    <pre className="text-emerald-400">// Request Body</pre>
                                    <pre className="text-white">&#123;</pre>
                                    <pre className="text-blue-400">  "encryptedMessage": "base64_ciphertext",</pre>
                                    <pre className="text-blue-400">  "recipientPubkey": "Fkf3...base58",</pre>
                                    <pre className="text-blue-400">  "senderPubkey": "Ab4d...base58",</pre>
                                    <pre className="text-blue-400">  "signature": "YzNm...base64",</pre>
                                    <pre className="text-blue-400">  "timestamp": 1704067200000</pre>
                                    <pre className="text-white">&#125;</pre>
                                </div>
                            </div>

                            <div className="p-6 bg-[rgba(255,255,255,0.02)] border border-white/5">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <code className="mono text-sm accent">GET /api/message/inbox/:pubkey</code>
                                        <p className="text-sm opacity-60 mt-2">Fetch received messages</p>
                                    </div>
                                </div>
                                <div className="code-block text-xs">
                                    <pre className="text-emerald-400">// Response</pre>
                                    <pre className="text-white">&#123;</pre>
                                    <pre className="text-blue-400">  "messages": [</pre>
                                    <pre className="text-gray-400">    &#123;</pre>
                                    <pre className="text-gray-400">      "signature": "tx_sig",</pre>
                                    <pre className="text-gray-400">      "senderPubkey": "Fkf3...base58",</pre>
                                    <pre className="text-gray-400">      "encryptedMessage": "base64_ciphertext",</pre>
                                    <pre className="text-gray-400">      "timestamp": 1704067200</pre>
                                    <pre className="text-gray-400">    &#125;</pre>
                                    <pre className="text-blue-400">  ]</pre>
                                    <pre className="text-white">&#125;</pre>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Program IDL */}
                    <section className="mb-24">
                        <h2 className="text-3xl font-serif italic mb-8 border-b border-[var(--signal)] pb-4 inline-block pr-12">
                            Program Interface (IDL)
                        </h2>
                        <div className="p-6 bg-[rgba(255,255,255,0.02)] border border-white/5 mb-6">
                            <p className="mono text-xs opacity-60 mb-2">Program Address:</p>
                            <code className="mono text-sm accent">96hG67JxhNEptr1LkdtDcrqvtWiHH3x4GibDBcdh4MYQ</code>
                        </div>
                        <div className="space-y-4">
                            <div className="p-6 bg-[rgba(255,255,255,0.02)] border border-white/5">
                                <h4 className="mono accent text-xs uppercase mb-3">registerUsername</h4>
                                <p className="text-sm opacity-80 mb-3">Create a new username account (PDA derived from username)</p>
                                <div className="code-block text-xs">
                                    <pre className="text-blue-400">pub fn register_username(</pre>
                                    <pre className="text-gray-400">  ctx: Context&lt;RegisterUsername&gt;,</pre>
                                    <pre className="text-gray-400">  username: String,</pre>
                                    <pre className="text-gray-400">  encryption_key: [u8; 32]</pre>
                                    <pre className="text-blue-400">) -&gt; Result&lt;()&gt;</pre>
                                </div>
                            </div>

                            <div className="p-6 bg-[rgba(255,255,255,0.02)] border border-white/5">
                                <h4 className="mono accent text-xs uppercase mb-3">updateEncryptionKey</h4>
                                <p className="text-sm opacity-80 mb-3">Rotate encryption key (owner-only)</p>
                                <div className="code-block text-xs">
                                    <pre className="text-blue-400">pub fn update_encryption_key(</pre>
                                    <pre className="text-gray-400">  ctx: Context&lt;UpdateEncryptionKey&gt;,</pre>
                                    <pre className="text-gray-400">  new_key: [u8; 32]</pre>
                                    <pre className="text-blue-400">) -&gt; Result&lt;()&gt;</pre>
                                </div>
                            </div>

                            <div className="p-6 bg-[rgba(255,255,255,0.02)] border border-white/5">
                                <h4 className="mono accent text-xs uppercase mb-3">transferUsername</h4>
                                <p className="text-sm opacity-80 mb-3">Transfer username to new owner</p>
                                <div className="code-block text-xs">
                                    <pre className="text-blue-400">pub fn transfer_username(</pre>
                                    <pre className="text-gray-400">  ctx: Context&lt;TransferUsername&gt;,</pre>
                                    <pre className="text-gray-400">  new_owner: Pubkey</pre>
                                    <pre className="text-blue-400">) -&gt; Result&lt;()&gt;</pre>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Code Examples */}
                    <section className="mb-24">
                        <h2 className="text-3xl font-serif italic mb-8 border-b border-[var(--signal)] pb-4 inline-block pr-12">
                            Code Examples
                        </h2>
                        <div className="space-y-8">
                            <div>
                                <h3 className="mono accent text-sm uppercase tracking-widest mb-4">TypeScript (Client)</h3>
                                <div className="code-block">
                                    <pre className="text-emerald-400">// Encrypt a message with TweetNaCl</pre>
                                    <pre className="text-white">import nacl from 'tweetnacl';</pre>
                                    <pre className="text-white">import bs58 from 'bs58';</pre>
                                    <pre className="text-blue-400"></pre>
                                    <pre className="text-blue-400">const nonce = nacl.randomBytes(nacl.box.nonceLength);</pre>
                                    <pre className="text-blue-400">const messageBytes = new TextEncoder().encode(message);</pre>
                                    <pre className="text-blue-400">const encrypted = nacl.box(</pre>
                                    <pre className="text-gray-400">  messageBytes,</pre>
                                    <pre className="text-gray-400">  nonce,</pre>
                                    <pre className="text-gray-400">  recipientPublicKey,</pre>
                                    <pre className="text-gray-400">  senderSecretKey</pre>
                                    <pre className="text-blue-400">);</pre>
                                </div>
                            </div>

                            <div>
                                <h3 className="mono accent text-sm uppercase tracking-widest mb-4">Rust (Program)</h3>
                                <div className="code-block">
                                    <pre className="text-emerald-400">// Username account structure</pre>
                                    <pre className="text-blue-400">#[account]</pre>
                                    <pre className="text-white">pub struct UserAccount &#123;</pre>
                                    <pre className="text-gray-400">    pub owner: Pubkey,</pre>
                                    <pre className="text-gray-400">    pub username: String,</pre>
                                    <pre className="text-gray-400">    pub encryption_key: [u8; 32],</pre>
                                    <pre className="text-gray-400">    pub created_at: i64,</pre>
                                    <pre className="text-gray-400">    pub bump: u8,</pre>
                                    <pre className="text-white">&#125;</pre>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SDKs & Libraries */}
                    <section className="mb-24">
                        <h2 className="text-3xl font-serif italic mb-8 border-b border-[var(--signal)] pb-4 inline-block pr-12">
                            SDKs & Libraries
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 bg-[rgba(255,255,255,0.02)] border border-white/5">
                                <h4 className="mono accent text-xs uppercase mb-3">JavaScript/TypeScript</h4>
                                <ul className="space-y-2 text-sm opacity-80">
                                    <li>• @solana/web3.js</li>
                                    <li>• tweetnacl</li>
                                    <li>• bs58</li>
                                    <li>• @coral-xyz/anchor</li>
                                </ul>
                            </div>
                            <div className="p-6 bg-[rgba(255,255,255,0.02)] border border-white/5">
                                <h4 className="mono accent text-xs uppercase mb-3">Rust</h4>
                                <ul className="space-y-2 text-sm opacity-80">
                                    <li>• anchor-lang</li>
                                    <li>• solana-program</li>
                                    <li>• borsh</li>
                                    <li>• ed25519-dalek</li>
                                </ul>
                            </div>
                            <div className="p-6 bg-[rgba(255,255,255,0.02)] border border-white/5">
                                <h4 className="mono accent text-xs uppercase mb-3">Python</h4>
                                <ul className="space-y-2 text-sm opacity-80">
                                    <li>• solana-py</li>
                                    <li>• PyNaCl</li>
                                    <li>• base58</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Community */}
                    <section className="mb-24">
                        <h2 className="text-3xl font-serif italic mb-8 border-b border-[var(--signal)] pb-4 inline-block pr-12">
                            Community
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-8 bg-[rgba(0,127,255,0.03)] border border-[rgba(0,127,255,0.1)]">
                                <h4 className="mono signal text-sm uppercase tracking-widest mb-4">GitHub</h4>
                                <p className="text-sm opacity-80 mb-4">
                                    Source code, issues, pull requests
                                </p>
                                <a href="https://github.com/SerPepe/KeyApp" className="mono text-xs signal hover:underline" target="_blank" rel="noopener">
                                    github.com/SerPepe/KeyApp →
                                </a>
                            </div>
                            <div className="p-8 bg-[rgba(212,175,55,0.03)] border border-[rgba(212,175,55,0.1)]">
                                <h4 className="mono accent text-sm uppercase tracking-widest mb-4">Discord</h4>
                                <p className="text-sm opacity-80 mb-4">
                                    Developer community, support, discussions
                                </p>
                                <a href="https://discord.gg" className="mono text-xs accent hover:underline" target="_blank" rel="noopener">
                                    discord.gg/keyprotocol →
                                </a>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    )
}
