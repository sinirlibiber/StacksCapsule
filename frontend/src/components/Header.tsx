'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, LogOut, Blocks, Coins } from 'lucide-react';
import { useStacks } from '@/context/StacksContext';

export default function Header() {
  const { isConnected, userAddress, stxBalance, connectWallet, disconnectWallet } = useStacks();

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-vault-dark/80 border-b border-vault-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-stacks-purple to-bitcoin-gold flex items-center justify-center">
                <Blocks className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-bitcoin-gold rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-stacks-purple-light to-bitcoin-gold bg-clip-text text-transparent">
                Stacks Capsule
              </h1>
              <p className="text-xs text-gray-400 -mt-0.5">Time-Locked Assets</p>
            </div>
          </motion.div>

          {/* Wallet Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            {isConnected && userAddress ? (
              <>
                {/* Balance Display */}
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-vault-card/60 border border-vault-border">
                  <Coins className="w-4 h-4 text-bitcoin-gold" />
                  <span className="text-sm font-mono text-gray-300">
                    {stxBalance.toFixed(2)} <span className="text-bitcoin-gold">STX</span>
                  </span>
                </div>

                {/* Address */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-vault-card/60 border border-vault-border">
                  <div className="w-2 h-2 rounded-full bg-status-open animate-pulse" />
                  <span className="text-sm font-mono text-gray-300">
                    {truncateAddress(userAddress)}
                  </span>
                </div>

                {/* Disconnect Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={disconnectWallet}
                  className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={connectWallet}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-stacks-purple to-stacks-purple-light text-white font-medium glow-purple transition-all hover:shadow-lg"
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </motion.button>
            )}
          </motion.div>
        </div>
      </div>
    </header>
  );
}

