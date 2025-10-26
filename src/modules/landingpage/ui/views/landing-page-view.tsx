"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ClipboardCheck, Sparkles, Share2 } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: <ClipboardCheck className="w-7 h-7 text-blue-600" />,
    title: "Smart Goal Tracking",
    desc: "Bring your dreams and wishes to life—organize them by category and follow your journey toward fulfillment.",
    color: "from-blue-50 to-blue-100",
  },
  {
    icon: <Sparkles className="w-7 h-7 text-green-600" />,
    title: "Always Free to Start",
    desc: "Freemium software. Try it free—no payment info required. Your data is safe with full GDPR compliance.",
    color: "from-green-50 to-green-100",
  },
  {
    icon: <Share2 className="w-7 h-7 text-pink-600" />,
    title: "Visual Progress",
    desc: "Watch your goals and wishes transform into achievements with beautiful progress visuals.",
    color: "from-pink-50 to-pink-100",
  },
];

const LandingPageView = () => {
  return (
    <section className="relative w-full py-[6vh] min-h-[88vh] flex flex-col items-center justify-center text-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/GoWish-Background.webp"
          alt="Background"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 w-full max-w-5xl mx-auto px-6 text-white "
      >
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-block bg-yellow-400/90 text-black text-sm font-medium px-4 py-1 rounded-full mb-6 shadow-lg"
        >
          ⚡ AI-Powered Goal Setting
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl sm:text-6xl font-extrabold leading-tight mb-5"
        >
          Create Your Dream{" "}
          <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
            Bucket List
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg text-gray-100 max-w-2xl mx-auto mb-10"
        >
          Transform your dreams into achievable goals with GoFastWISH. Track your
          progress, get AI-powered inspiration, and celebrate every milestone on
          your journey to an extraordinary life.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center gap-4 mb-16"
        >
          <Link
            href="/signup"
            className="px-7 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-semibold rounded-md shadow-md hover:shadow-xl transition-all"
          >
            Create Account
          </Link>
          <Link
            href="/learn-more"
            className="px-7 py-3 border border-white/80 text-white font-semibold rounded-md hover:bg-white/10 transition-all"
          >
            Learn More Video
          </Link>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-0"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -6, scale: 1.03 }}
              className={`bg-gradient-to-br ${f.color} backdrop-blur-xl rounded-2xl p-8 text-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300`}
            >
              <div className="flex justify-center mb-5">
                <div className="bg-white p-4 rounded-full shadow-md">{f.icon}</div>
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-gray-700">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default LandingPageView;
