'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, User, Coins, FileText, Calculator, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { useStacks } from '@/context/StacksContext';

interface CapsuleFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CapsuleForm({ isOpen, onClose }: CapsuleFormProps) {
  const { currentBlock, stxBalance, lockSTX, isConnected } = useStacks();
  
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [targetBlock, setTargetBlock] = useState('');
  const [memo, setMemo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Calculate estimated days until unlock
  const blocksAhead = targetBlock ? parseInt(targetBlock) - currentBlock : 0;
  const estimatedMinutes = blocksAhead > 0 ? blocksAhead * 10 : 0;
  const estimatedDays = Math.floor(estimatedMinutes / 1440);
  const estimatedHours = Math.floor((estimatedMinutes % 1440) / 60);

  // Reset form when closing
  useEffect(() => {
    if (!isOpen) {
      setRecipient('');
      setAmount('');
      setTargetBlock('');
      setMemo('');
      setError('');
    }
  }, [isOpen]);

  // Set initial target block suggestion
  useEffect(() => {
    if (isOpen && currentBlock > 0 && !targetBlock) {
      setTargetBlock((currentBlock + 144).toString()); // ~1 day
    }
  }, [isOpen, currentBlock, targetBlock]);

  const validateForm = (): boolean => {
    setError('');

    if (!recipient.trim()) {
      setError('Recipient address is required');
      return false;
    }

    if (!recipient.startsWith('ST') && !recipient.startsWith('SP')) {
      setError('Invalid Stacks address format');
      return false;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Amount must be greater than 0');
      return false;
    }

    if (amountNum > stxBalance) {
      setError('Insufficient balance');
      return false;
    }

    const targetBlockNum = parseInt(targetBlock);
    if (isNaN(targetBlockNum) || targetBlockNum <= currentBlock) {
      setError('Target block must be greater than current block');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError('');

    try {
      await lockSTX(
        recipient.trim(),
        parseFloat(amount),
        parseInt(targetBlock),
        memo.trim() || 'Created with Stacks Capsule'
      );
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create capsule');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickSetBlocks = [
    { label: '1 Day', blocks: 144 },
    { label: '1 Week', blocks: 1008 },
    { label: '1 Month', blocks: 4320 },
    { label: '1 Year', blocks: 52560 },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-lg cyber-card rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Create Capsule</h2>
                <p className="text-sm text-gray-400 mt-1">Lock STX with a time-based release</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-xl bg-vault-card hover:bg-vault-border transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </motion.button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Recipient */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <User className="w-4 h-4 text-stacks-purple-light" />
                  Recipient Address
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
                  className="w-full px-4 py-3 rounded-xl bg-vault-card border border-vault-border text-white font-mono text-sm placeholder:text-gray-600 focus:border-stacks-purple transition-colors"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <Coins className="w-4 h-4 text-bitcoin-gold" />
                  Amount (STX)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.000001"
                    min="0"
                    className="w-full px-4 py-3 rounded-xl bg-vault-card border border-vault-border text-white font-mono text-lg placeholder:text-gray-600 focus:border-stacks-purple transition-colors pr-20"
                  />
                  <button
                    type="button"
                    onClick={() => setAmount(stxBalance.toString())}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-medium text-bitcoin-gold bg-bitcoin-gold/10 rounded-lg hover:bg-bitcoin-gold/20 transition-colors"
                  >
                    MAX
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Available: <span className="text-bitcoin-gold">{stxBalance.toFixed(6)} STX</span>
                </p>
              </div>

              {/* Target Block */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <Clock className="w-4 h-4 text-stacks-purple-light" />
                  Target Block Height
                </label>
                <input
                  type="number"
                  value={targetBlock}
                  onChange={(e) => setTargetBlock(e.target.value)}
                  placeholder={`> ${currentBlock}`}
                  min={currentBlock + 1}
                  className="w-full px-4 py-3 rounded-xl bg-vault-card border border-vault-border text-white font-mono text-lg placeholder:text-gray-600 focus:border-stacks-purple transition-colors"
                />
                
                {/* Quick Set Buttons */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {quickSetBlocks.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => setTargetBlock((currentBlock + option.blocks).toString())}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-vault-card border border-vault-border text-gray-400 hover:text-white hover:border-stacks-purple/50 transition-all"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {/* Time Estimate */}
                {blocksAhead > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 p-3 rounded-xl bg-stacks-purple/10 border border-stacks-purple/20"
                  >
                    <div className="flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-stacks-purple-light" />
                      <span className="text-sm text-gray-300">
                        Estimated unlock: <span className="text-white font-medium">
                          {estimatedDays > 0 && `${estimatedDays}d `}
                          {estimatedHours}h
                        </span>
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Based on ~10 min/block • {blocksAhead.toLocaleString()} blocks ahead
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Memo */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  Memo (optional)
                </label>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="Add a message to your time capsule..."
                  maxLength={256}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-vault-card border border-vault-border text-white text-sm placeholder:text-gray-600 focus:border-stacks-purple transition-colors resize-none"
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {memo.length}/256 characters
                </p>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/30"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-400">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting || !isConnected}
                className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                  isSubmitting || !isConnected
                    ? 'bg-vault-card text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-stacks-purple to-bitcoin-gold text-white glow-purple'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Capsule...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Lock STX in Capsule
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

