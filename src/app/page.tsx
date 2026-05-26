"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Gamepad2, Users, Globe, Zap } from "lucide-react";

const features = [
  {
    icon: Gamepad2,
    title: "Classic Game, Modern Feel",
    desc: "The party guessing game you love, rebuilt for 2026 with a gorgeous interface.",
  },
  {
    icon: Users,
    title: "Play with Friends",
    desc: "One holds the phone, others guess. Tilt down for correct, up to skip.",
  },
  {
    icon: Globe,
    title: "All Packs Free",
    desc: "Every pack is free. Create your own or browse community packs.",
  },
  {
    icon: Zap,
    title: "Custom Cards",
    desc: "Add text, images, and GIFs to your cards. Make it your own.",
  },
];

const howItWorks = [
  { step: "1", title: "Pick a Pack", desc: "Choose from thousands of community packs or create your own." },
  { step: "2", title: "Hold the Phone", desc: "Hold your phone to your forehead. The screen shows a word or phrase." },
  { step: "3", title: "Get Clues", desc: "Your friends act out, describe, or give clues for you to guess." },
  { step: "4", title: "Tilt to Score", desc: "Tilt the phone down when you guess correctly, up to skip." },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-50 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
        <div className="flex items-center justify-between max-w-5xl mx-auto px-4 h-16">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold">OpenHeads</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="primary" size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-600/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 pt-20 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-medium mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              Free & Open Source
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
              The Party Game
              <br />
              <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Everyone Loves
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-xl mx-auto leading-relaxed">
              The classic heads-up guessing game, completely free. Act it out, tilt to score, party on.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/auth/register">
                <Button variant="primary" size="xl" className="w-full sm:w-auto text-base gap-2">
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/discovery">
                <Button variant="outline" size="xl" className="w-full sm:w-auto text-base">
                  Browse Packs
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-zinc-200/50 dark:border-zinc-800/50 py-24">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why OpenHeads?
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-md mx-auto">
              Everything you love about the game, none of the restrictions.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 hover:border-violet-500/50 transition-colors duration-300"
              >
                <div className="h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-4">
                  <feature.icon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-200/50 dark:border-zinc-800/50 py-24 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg">
              Three minutes to learn, a lifetime to master.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center mx-auto mb-4 text-xl font-bold text-white shadow-lg shadow-violet-500/25">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-200/50 dark:border-zinc-800/50 py-24">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Built by the Community
            </h2>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-8">
              Browse thousands of packs created by players worldwide, or create your own and share it with everyone.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {["Funny", "Movies", "Animals", "Food", "Music", "Sports", "Celebrities", "Custom"].map(
                (cat) => (
                  <span
                    key={cat}
                    className="px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    {cat}
                  </span>
                )
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-zinc-200/50 dark:border-zinc-800/50 py-24 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Play?
            </h2>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-8">
              Join thousands of players. It&apos;s free, it&apos;s fun, it&apos;s OpenHeads.
            </p>
            <Link href="/auth/register">
              <Button variant="primary" size="xl" className="text-base gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-zinc-200/50 dark:border-zinc-800/50 py-8">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-500">
          <span>OpenHeads. Free forever.</span>
          <div className="flex items-center gap-4">
            <span>About</span>
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
