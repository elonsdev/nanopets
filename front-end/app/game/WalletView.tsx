"use client";

import { useTonConnectUI } from "@tonconnect/ui-react";
import { useCallback, useEffect, useState } from "react";
import { Address } from "@ton/core";

interface WalletViewProps {
  coins: number;
  weight: number;
  careMistakes: number;
  resetTamagotchi: () => void;
}

export default function WalletView({
  coins,
  weight,
  careMistakes,
  resetTamagotchi,
}: WalletViewProps) {
  const [tonConnectUI] = useTonConnectUI();
  const [tonWalletAddress, setTonWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleWalletConnection = useCallback((address: string) => {
    setTonWalletAddress(address);
    console.log("Wallet connected successfully!");
    setIsLoading(false);
  }, []);

  const handleWalletDisconnection = useCallback(() => {
    setTonWalletAddress(null);
    console.log("Wallet disconnected successfully!");
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (tonConnectUI.account?.address) {
        handleWalletConnection(tonConnectUI.account?.address);
      } else {
        handleWalletDisconnection();
      }
    };

    checkWalletConnection();

    const unsubscribe = tonConnectUI.onStatusChange((wallet) => {
      if (wallet) {
        handleWalletConnection(wallet.account.address);
      } else {
        handleWalletDisconnection();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [tonConnectUI, handleWalletConnection, handleWalletDisconnection]);

  const handleWalletAction = async () => {
    if (tonConnectUI.connected) {
      setIsLoading(true);
      await tonConnectUI.disconnect();
    } else {
      await tonConnectUI.openModal();
    }
  };

  const formatAddress = (address: string) => {
    const tempAddress = Address.parse(address).toString();
    return `${tempAddress.slice(0, 4)}...${tempAddress.slice(-4)}`;
  };

  return (
    <div className='p-4 w-full'>
      <h2 className='text-6xl font-bold mb-4'>Wallet</h2>
      {isLoading ? (
        <>...Loading</>
      ) : (
        <>
          {tonWalletAddress ? (
            <div className='flex flex-col items-center'>
              <p className='mb-4'>
                Connected: {formatAddress(tonWalletAddress)}
              </p>
              <button
                onClick={handleWalletAction}
                className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'
              >
                Disconnect Wallet
              </button>
            </div>
          ) : (
            <button
              onClick={handleWalletAction}
              className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
            >
              Connect TON Wallet
            </button>
          )}
        </>
      )}

      <p className='mb-4 text-2xl'>Coins: {coins}</p>
      <div className='flex gap-2 mb-4'>
        <button
          onClick={resetTamagotchi}
          className='bg-red-500 hover:bg-red-600 text-white'
        >
          Reset Tamagotchi
        </button>
      </div>
      <h2 className='text-4xl font-bold my-4'>Stats</h2>
      <p className='text-lg'>Weight: {weight}</p>
      <p className='text-lg'>Care Mistakes: {careMistakes}</p>
    </div>
  );
}
