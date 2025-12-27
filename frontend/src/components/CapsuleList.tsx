'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, RefreshCw, Filter, Inbox } from 'lucide-react';
import { useStacks, Capsule } from '@/context/StacksContext';
import CapsuleCard from './CapsuleCard';

type FilterType = 'all' | 'sent' | 'received' | 'claimable';

export default function CapsuleList() {
  const { isConnected, userAddress, getUserCapsules, claimSTX, currentBlock, refreshData } = useStacks();
  
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const loadCapsules = useCallback(async () => {
    if (!isConnected) return;
    
    setIsLoading(true);
    try {
      const userCapsules = await getUserCapsules();
      setCapsules(userCapsules);
    } catch (error) {
      console.error('Failed to load capsules:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, getUserCapsules]);

  useEffect(() => {
    loadCapsules();
  }, [loadCapsules]);

  const handleClaim = async (capsuleId: number) => {
    try {
      await claimSTX(capsuleId);
      // Refresh after claim
      setTimeout(loadCapsules, 2000);
    } catch (error) {
      console.error('Failed to claim:', error);
    }
  };

  const handleRefresh = async () => {
    await refreshData();
    await loadCapsules();
  };

  // Filter capsules
  const filteredCapsules = capsules.filter((capsule) => {
    switch (filter) {
      case 'sent':
        return capsule.sender === userAddress;
      case 'received':
        return capsule.recipient === userAddress;
      case 'claimable':
        return (
          capsule.status === 'open' &&
          capsule.recipient === userAddress &&
          currentBlock >= capsule.releaseBlock
        );
      default:
        return true;
    }
  });

  const filters: { label: string; value: FilterType; count: number }[] = [
    { label: 'All', value: 'all', count: capsules.length },
    { label: 'Sent', value: 'sent', count: capsules.filter(c => c.sender === userAddress).length },
    { label: 'Received', value: 'received', count: capsules.filter(c => c.recipient === userAddress).length },
    { 
      label: 'Claimable', 
      value: 'claimable', 
      count: capsules.filter(c => 
        c.status === 'open' && 
        c.recipient === userAddress && 
        currentBlock >= c.releaseBlock
      ).length 
    },
  ];

  if (!isConnected) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="cyber-card rounded-3xl p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-vault-card flex items-center justify-center">
              <Package className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Connect your Stacks wallet to view and manage your time capsules
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Package className="w-7 h-7 text-stacks-purple-light" />
              Your Capsules
            </h2>
            <p className="text-gray-400 mt-1">
              Manage your time-locked assets
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-vault-card border border-vault-border text-gray-300 hover:text-white hover:border-stacks-purple/50 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </motion.button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                filter === f.value
                  ? 'bg-stacks-purple text-white'
                  : 'bg-vault-card text-gray-400 hover:text-white border border-vault-border hover:border-stacks-purple/50'
              }`}
            >
              {f.label}
              {f.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  filter === f.value ? 'bg-white/20' : 'bg-vault-border'
                }`}>
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Capsule Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="cyber-card rounded-2xl p-6 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-vault-card" />
                  <div className="flex-1">
                    <div className="h-6 bg-vault-card rounded w-24 mb-2" />
                    <div className="h-4 bg-vault-card rounded w-16" />
                  </div>
                </div>
                <div className="h-2 bg-vault-card rounded mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-vault-card rounded" />
                  <div className="h-4 bg-vault-card rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCapsules.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="cyber-card rounded-3xl p-12 text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-vault-card flex items-center justify-center">
              <Inbox className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Capsules Found</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              {filter === 'all'
                ? "You haven't created or received any capsules yet. Create your first time capsule to get started!"
                : `No capsules match the "${filter}" filter.`}
            </p>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredCapsules.map((capsule) => (
                <CapsuleCard
                  key={capsule.id}
                  capsule={capsule}
                  onClaim={handleClaim}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
}

