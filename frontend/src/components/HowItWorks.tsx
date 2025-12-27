'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Lock, Blocks, Unlock, ArrowDown } from 'lucide-react';

const steps = [
  {
    icon: Wallet,
    title: 'Connect Wallet',
    description: 'Connect your Stacks-compatible wallet (like Leather or Xverse) to get started.',
    color: 'text-stacks-purple-light',
    bgColor: 'bg-stacks-purple/20',
  },
  {
    icon: Lock,
    title: 'Lock STX',
    description: 'Choose a recipient, amount, and target Bitcoin block height for unlocking.',
    color: 'text-bitcoin-gold',
    bgColor: 'bg-bitcoin-gold/20',
  },
  {
    icon: Blocks,
    title: 'Wait for Blocks',
    description: 'The Bitcoin network mines blocks approximately every 10 minutes. Your capsule stays secure.',
    color: 'text-status-locked',
    bgColor: 'bg-status-locked/20',
  },
  {
    icon: Unlock,
    title: 'Claim Assets',
    description: 'Once the target block is reached, the recipient can claim the locked STX.',
    color: 'text-status-open',
    bgColor: 'bg-status-open/20',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            How It <span className="text-stacks-purple-light">Works</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Stacks Capsule uses Bitcoin's block height as a trustless time oracle, 
            ensuring your assets are locked until the exact block you specify.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-stacks-purple via-bitcoin-gold to-status-open hidden lg:block" />

          <div className="space-y-8 lg:space-y-0">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`flex flex-col lg:flex-row items-center gap-6 ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                <div className={`flex-1 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="cyber-card rounded-2xl p-6 inline-block"
                  >
                    <div className={`flex items-center gap-4 ${index % 2 === 0 ? 'lg:flex-row-reverse' : ''}`}>
                      <div className={`w-14 h-14 rounded-xl ${step.bgColor} flex items-center justify-center`}>
                        <step.icon className={`w-7 h-7 ${step.color}`} />
                      </div>
                      <div className={index % 2 === 0 ? 'lg:text-right' : ''}>
                        <span className="text-xs text-gray-500 uppercase tracking-wider">
                          Step {index + 1}
                        </span>
                        <h3 className={`text-xl font-bold ${step.color}`}>
                          {step.title}
                        </h3>
                      </div>
                    </div>
                    <p className={`text-gray-400 mt-4 ${index % 2 === 0 ? 'lg:text-right' : ''}`}>
                      {step.description}
                    </p>
                  </motion.div>
                </div>

                {/* Center Circle */}
                <div className="relative z-10 hidden lg:flex items-center justify-center">
                  <div className={`w-12 h-12 rounded-full ${step.bgColor} border-4 border-vault-dark flex items-center justify-center`}>
                    <span className={`text-lg font-bold ${step.color}`}>{index + 1}</span>
                  </div>
                </div>

                <div className="flex-1 hidden lg:block" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bitcoin Security Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 cyber-card rounded-3xl p-8 text-center"
        >
          <h3 className="text-xl font-bold text-white mb-4">
            🔐 Secured by Bitcoin
          </h3>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Stacks uses Bitcoin's consensus mechanism. The <code className="text-bitcoin-gold bg-bitcoin-gold/10 px-2 py-0.5 rounded">burn-block-height</code> 
            in Clarity contracts directly references Bitcoin's blockchain, making your time locks 
            immutable and trustless. No one—not even the contract deployer—can unlock capsules early.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

