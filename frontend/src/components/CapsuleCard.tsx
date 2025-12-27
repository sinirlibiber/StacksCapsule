'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Coins, User, FileText, Unlock, CheckCircle, Lock, ArrowRight } from 'lucide-react';
import { Capsule } from '@/context/StacksContext';
import { useStacks } from '@/context/StacksContext';

interface CapsuleCardProps {
  capsule: Capsule;
  onClaim: (id: number) => void;
}

export default function CapsuleCard({ capsule, onClaim }: CapsuleCardProps) {
  const { currentBlock, userAddress } = useStacks();

  const isClaimable = 
    capsule.status === 'open' && 
    currentBlock >= capsule.releaseBlock &&
    capsule.recipient === userAddress;
  
  const isClaimed = capsule.status === 'claimed';
  const isLocked = capsule.status === 'open' && currentBlock < capsule.releaseBlock;
  const isRecipient = capsule.recipient === userAddress;
  const isSender = capsule.sender === userAddress;

  // Progress calculation
  const totalBlocks = capsule.releaseBlock - capsule.createdAt;
  const elapsedBlocks = Math.min(currentBlock - capsule.createdAt, totalBlocks);
  const progress = totalBlocks > 0 ? Math.min((elapsedBlocks / totalBlocks) * 100, 100) : 0;

  // Blocks remaining
  const blocksRemaining = Math.max(capsule.releaseBlock - currentBlock, 0);
  const minutesRemaining = blocksRemaining * 10;
  const daysRemaining = Math.floor(minutesRemaining / 1440);
  const hoursRemaining = Math.floor((minutesRemaining % 1440) / 60);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-4)}`;
  };

  const getStatusBadge = () => {
    if (isClaimed) {
      return (
        <span className="badge-claimed px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Claimed
        </span>
      );
    }
    if (isClaimable) {
      return (
        <span className="badge-open px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 animate-pulse">
          <Unlock className="w-3 h-3" />
          Ready to Claim
        </span>
      );
    }
    return (
      <span className="badge-locked px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
        <Lock className="w-3 h-3" />
        Locked
      </span>
    );
  };

  const getRoleBadge = () => {
    if (isSender && isRecipient) {
      return <span className="text-xs text-gray-500">Self Capsule</span>;
    }
    if (isSender) {
      return <span className="text-xs text-stacks-purple-light">You Sent</span>;
    }
    if (isRecipient) {
      return <span className="text-xs text-bitcoin-gold">For You</span>;
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={`cyber-card rounded-2xl p-6 transition-all duration-300 ${
        isClaimable ? 'ring-2 ring-status-open/50' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isClaimed 
              ? 'bg-status-claimed/20' 
              : isClaimable 
                ? 'bg-status-open/20' 
                : 'bg-status-locked/20'
          }`}>
            <Coins className={`w-6 h-6 ${
              isClaimed 
                ? 'text-status-claimed' 
                : isClaimable 
                  ? 'text-status-open' 
                  : 'text-status-locked'
            }`} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-mono">
              {capsule.amount.toFixed(2)} <span className="text-bitcoin-gold text-lg">STX</span>
            </p>
            {getRoleBadge()}
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Progress Bar */}
      {!isClaimed && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Block {capsule.createdAt.toLocaleString()}</span>
            <span>Block {capsule.releaseBlock.toLocaleString()}</span>
          </div>
          <div className="h-2 bg-vault-card rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                progress >= 100 
                  ? 'bg-gradient-to-r from-status-open to-status-open/60 progress-glow' 
                  : 'bg-gradient-to-r from-stacks-purple to-bitcoin-gold'
              }`}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              Progress: {progress.toFixed(1)}%
            </span>
            {blocksRemaining > 0 && (
              <span className="text-xs text-gray-400">
                {daysRemaining > 0 && `${daysRemaining}d `}{hoursRemaining}h remaining
              </span>
            )}
          </div>
        </div>
      )}

      {/* Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400">
            <User className="w-4 h-4" />
            <span className="text-xs">{isSender ? 'Recipient' : 'Sender'}</span>
          </div>
          <span className="text-sm font-mono text-gray-300">
            {truncateAddress(isSender ? capsule.recipient : capsule.sender)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Release Block</span>
          </div>
          <span className="text-sm font-mono text-stacks-purple-light">
            #{capsule.releaseBlock.toLocaleString()}
          </span>
        </div>

        {capsule.memo && (
          <div className="pt-3 border-t border-vault-border">
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-400 leading-relaxed">
                "{capsule.memo}"
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      {isClaimable && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onClaim(capsule.id)}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-status-open to-status-open/80 text-white font-semibold flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-status-open/30"
        >
          <Unlock className="w-5 h-5" />
          Claim {capsule.amount.toFixed(2)} STX
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      )}
    </motion.div>
  );
}

