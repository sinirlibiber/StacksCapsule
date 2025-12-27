'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { AppConfig, UserSession, showConnect, openContractCall } from '@stacks/connect';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import { 
  uintCV, 
  stringUtf8CV, 
  principalCV,
  cvToValue,
  fetchCallReadOnlyFunction,
  PostConditionMode,
  makeStandardSTXPostCondition,
  FungibleConditionCode,
  Pc
} from '@stacks/transactions';

// Types
export interface Capsule {
  id: number;
  sender: string;
  recipient: string;
  amount: number;
  releaseBlock: number;
  status: string;
  memo: string;
  createdAt: number;
}

interface StacksContextType {
  isConnected: boolean;
  userAddress: string | null;
  stxBalance: number;
  currentBlock: number;
  isLoading: boolean;
  connectWallet: () => void;
  disconnectWallet: () => void;
  lockSTX: (recipient: string, amount: number, releaseBlock: number, memo: string) => Promise<void>;
  claimSTX: (capsuleId: number) => Promise<void>;
  getCapsuleInfo: (id: number) => Promise<Capsule | null>;
  getUserCapsules: () => Promise<Capsule[]>;
  refreshData: () => Promise<void>;
}

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

const StacksContext = createContext<StacksContextType | undefined>(undefined);

// Contract configuration
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const CONTRACT_NAME = 'stacks-capsule';
const NETWORK = process.env.NEXT_PUBLIC_NETWORK === 'mainnet' 
  ? new StacksMainnet() 
  : new StacksTestnet();

export function StacksProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [stxBalance, setStxBalance] = useState(0);
  const [currentBlock, setCurrentBlock] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Check if already connected on mount
  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      const address = process.env.NEXT_PUBLIC_NETWORK === 'mainnet'
        ? userData.profile.stxAddress.mainnet
        : userData.profile.stxAddress.testnet;
      setUserAddress(address);
      setIsConnected(true);
    }
  }, []);

  // Fetch current block height
  const fetchCurrentBlock = useCallback(async () => {
    try {
      const response = await fetch(
        `https://stacks-node-api${process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? '' : '.testnet'}.stacks.co/v2/info`
      );
      const data = await response.json();
      setCurrentBlock(data.burn_block_height || 0);
    } catch (error) {
      console.error('Failed to fetch block height:', error);
    }
  }, []);

  // Fetch STX balance
  const fetchBalance = useCallback(async (address: string) => {
    try {
      const response = await fetch(
        `https://stacks-node-api${process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? '' : '.testnet'}.stacks.co/extended/v1/address/${address}/balances`
      );
      const data = await response.json();
      setStxBalance(parseInt(data.stx.balance) / 1_000_000); // Convert to STX
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  }, []);

  // Refresh data
  const refreshData = useCallback(async () => {
    await fetchCurrentBlock();
    if (userAddress) {
      await fetchBalance(userAddress);
    }
  }, [fetchCurrentBlock, fetchBalance, userAddress]);

  // Auto-refresh block height every 30 seconds
  useEffect(() => {
    fetchCurrentBlock();
    const interval = setInterval(fetchCurrentBlock, 30000);
    return () => clearInterval(interval);
  }, [fetchCurrentBlock]);

  // Fetch balance when connected
  useEffect(() => {
    if (userAddress) {
      fetchBalance(userAddress);
    }
  }, [userAddress, fetchBalance]);

  // Connect wallet
  const connectWallet = useCallback(() => {
    showConnect({
      appDetails: {
        name: 'Stacks Capsule',
        icon: '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        const userData = userSession.loadUserData();
        const address = process.env.NEXT_PUBLIC_NETWORK === 'mainnet'
          ? userData.profile.stxAddress.mainnet
          : userData.profile.stxAddress.testnet;
        setUserAddress(address);
        setIsConnected(true);
      },
      userSession,
    });
  }, []);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    userSession.signUserOut();
    setIsConnected(false);
    setUserAddress(null);
    setStxBalance(0);
  }, []);

  // Lock STX in capsule
  const lockSTX = useCallback(async (
    recipient: string,
    amount: number,
    releaseBlock: number,
    memo: string
  ) => {
    if (!userAddress) throw new Error('Wallet not connected');

    const microSTX = Math.floor(amount * 1_000_000);

    const postConditions = [
      Pc.principal(userAddress).willSendLte(microSTX).ustx()
    ];

    await openContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'lock-stx',
      functionArgs: [
        principalCV(recipient),
        uintCV(microSTX),
        uintCV(releaseBlock),
        stringUtf8CV(memo),
      ],
      postConditions,
      postConditionMode: PostConditionMode.Deny,
      network: NETWORK,
      onFinish: (data) => {
        console.log('Transaction submitted:', data.txId);
        refreshData();
      },
      onCancel: () => {
        console.log('Transaction cancelled');
      },
    });
  }, [userAddress, refreshData]);

  // Claim STX from capsule
  const claimSTX = useCallback(async (capsuleId: number) => {
    if (!userAddress) throw new Error('Wallet not connected');

    await openContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'claim-stx',
      functionArgs: [uintCV(capsuleId)],
      postConditionMode: PostConditionMode.Allow,
      network: NETWORK,
      onFinish: (data) => {
        console.log('Claim submitted:', data.txId);
        refreshData();
      },
      onCancel: () => {
        console.log('Claim cancelled');
      },
    });
  }, [userAddress, refreshData]);

  // Get capsule info
  const getCapsuleInfo = useCallback(async (id: number): Promise<Capsule | null> => {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-capsule-info',
        functionArgs: [uintCV(id)],
        network: NETWORK,
        senderAddress: userAddress || CONTRACT_ADDRESS,
      });

      const value = cvToValue(result);
      if (!value) return null;

      return {
        id,
        sender: value.sender.value,
        recipient: value.recipient.value,
        amount: parseInt(value.amount.value) / 1_000_000,
        releaseBlock: parseInt(value['release-block'].value),
        status: value.status.value,
        memo: value.memo.value,
        createdAt: parseInt(value['created-at'].value),
      };
    } catch (error) {
      console.error('Failed to get capsule info:', error);
      return null;
    }
  }, [userAddress]);

  // Get user's capsules (as sender or recipient)
  const getUserCapsules = useCallback(async (): Promise<Capsule[]> => {
    if (!userAddress) return [];

    try {
      // Get capsules where user is recipient
      const recipientResult = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-recipient-capsules',
        functionArgs: [principalCV(userAddress)],
        network: NETWORK,
        senderAddress: userAddress,
      });

      const recipientValue = cvToValue(recipientResult);
      const capsuleIds: number[] = recipientValue?.['capsule-ids']?.map((id: any) => parseInt(id.value)) || [];

      // Get capsules where user is sender
      const senderResult = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-sender-capsules',
        functionArgs: [principalCV(userAddress)],
        network: NETWORK,
        senderAddress: userAddress,
      });

      const senderValue = cvToValue(senderResult);
      const senderIds: number[] = senderValue?.['capsule-ids']?.map((id: any) => parseInt(id.value)) || [];

      // Combine and dedupe
      const allIds = [...new Set([...capsuleIds, ...senderIds])];

      // Fetch details for each capsule
      const capsules: Capsule[] = [];
      for (const id of allIds) {
        const capsule = await getCapsuleInfo(id);
        if (capsule) {
          capsules.push(capsule);
        }
      }

      return capsules.sort((a, b) => b.id - a.id);
    } catch (error) {
      console.error('Failed to get user capsules:', error);
      return [];
    }
  }, [userAddress, getCapsuleInfo]);

  return (
    <StacksContext.Provider
      value={{
        isConnected,
        userAddress,
        stxBalance,
        currentBlock,
        isLoading,
        connectWallet,
        disconnectWallet,
        lockSTX,
        claimSTX,
        getCapsuleInfo,
        getUserCapsules,
        refreshData,
      }}
    >
      {children}
    </StacksContext.Provider>
  );
}

export function useStacks() {
  const context = useContext(StacksContext);
  if (!context) {
    throw new Error('useStacks must be used within a StacksProvider');
  }
  return context;
}

