'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Blocks, Clock, Shield, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { useStacks } from '@/context/StacksContext';

interface HeroProps {
  onCreateCapsule: () => void;
}

export default function Hero({ onCreateCapsule }: HeroProps) {
  const { currentBlock, isConnected } = useStacks();

  const stats = [
    { 
      icon: Blocks, 
      label: 'Current Block', 
      value: currentBlock.toLocaleString(), 
      color: 'text-bitcoin-gold',
      description: 'Bitcoin block height'
    },
    { 
      icon: Clock, 
      label: 'Block Time', 
      value: '~10 min', 
      color: 'text-stacks-purple-light',
      description: 'Average interval'
    },
    { 
      icon: Shield, 
      label: 'Network', 
      value: 'Testnet', 
      color: 'text-status-open',
      description: 'Stacks blockchain'
    },
  ];

  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 2 }}
          className="absolute top-20 left-1/4 w-96 h-96 bg-stacks-purple/10 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute bottom-0 right-1/4 w-80 h-80 bg-bitcoin-gold/10 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main Hero Content */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stacks-purple/10 border border-stacks-purple/30 mb-6"
          >
            <Sparkles className="w-4 h-4 text-stacks-purple-light" />
            <span className="text-sm text-stacks-purple-light font-medium">
              Powered by Bitcoin Security
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
          >
            <span className="text-white">Time-Lock Your </span>
            <span className="bg-gradient-to-r from-stacks-purple via-stacks-purple-light to-bitcoin-gold bg-clip-text text-transparent">
              Digital Assets
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-400 max-w-2xl mx-auto mb-10"
          >
            Create trustless time capsules using Bitcoin block heights. 
            Lock STX tokens today, unlock them when the blockchain reaches your target block.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCreateCapsule}
              disabled={!isConnected}
              className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-lg transition-all ${
                isConnected
                  ? 'bg-gradient-to-r from-stacks-purple to-bitcoin-gold text-white glow-purple hover:shadow-2xl'
                  : 'bg-vault-card text-gray-500 cursor-not-allowed border border-vault-border'
              }`}
            >
              <Zap className="w-5 h-5" />
              Create New Capsule
            </motion.button>

            <a
              href="#how-it-works"
              className="flex items-center gap-2 px-6 py-4 rounded-2xl font-medium text-gray-400 hover:text-white transition-colors"
            >
              <TrendingUp className="w-5 h-5" />
              Learn How It Works
            </a>
          </motion.div>

          {!isConnected && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-sm text-gray-500"
            >
              Connect your wallet to create capsules
            </motion.p>
          )}
        </div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              className="cyber-card rounded-2xl p-6 text-center transition-all"
            >
              <div className="flex justify-center mb-3">
                <div className={`p-3 rounded-xl bg-vault-card ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                {stat.label}
              </p>
              <p className={`text-2xl font-bold font-mono ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stat.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

