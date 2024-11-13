"use client";

import { useState, useEffect, useCallback } from "react";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { Address, beginCell, toNano } from "@ton/core";
import { Account } from "@tonconnect/sdk";
import Image from "next/image";
import Coin from "../../svgs/coin.png";
import Crown from "../../svgs/crown.png";

const SBT_CONTRACT_ADDRESS = "EQABJOutwO97Aj6-xod1sJ9Kg1uf9l8AA9nXpABxxJjS-5MH";

// Constants matching the contract
const MIN_TONS_FOR_STORAGE = toNano("0.05");
const GAS_CONSUMPTION = toNano("0.05");

function isConnectedAccount(account: Account | null): account is Account {
  return account !== null;
}

export default function TonConnectionMinter() {
  const [tonConnectUI] = useTonConnectUI();
  const [tonWalletAddress, setTonWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const nftPrice = toNano("1");

  const metadata = {
    name: "KodoMochi Soul Bound Crown",
    description:
      "Support the development of KodoMochi by minting a Soul Bound Crown.",
    image: "https://kodomochi.pet/crown.png",
  };

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

  useEffect(() => {
    if (!tonConnectUI) return;

    const unsubscribe = tonConnectUI.onStatusChange((wallet) => {
      setIsConnected(!!wallet);
    });

    setIsConnected(!!tonConnectUI.account);

    return () => {
      unsubscribe();
    };
  }, [tonConnectUI]);

  const handleMint = async () => {
    if (!isConnected || !isConnectedAccount(tonConnectUI.account)) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      setIsLoading(true);

      // Calculate total cost according to contract
      const totalCost =
        BigInt(MIN_TONS_FOR_STORAGE) +
        BigInt(GAS_CONSUMPTION) +
        BigInt(nftPrice);

      // Create simple "Mint" message as expected by the contract
      const payload = beginCell()
        .storeUint(0, 32) // Simple comment message
        .storeStringTail("Mint")
        .endCell();

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 360, // 6 minutes expiration
        messages: [
          {
            address: SBT_CONTRACT_ADDRESS,
            amount: totalCost.toString(),
            payload: payload.toBoc().toString("base64"),
          },
        ],
      };

      console.log("Sending transaction:", transaction);

      const result = await tonConnectUI.sendTransaction(transaction);
      console.log("Transaction result:", result);

      alert(
        "Minting transaction sent successfully! Please wait for confirmation."
      );
    } catch (error) {
      console.error("Error minting:", error);
      alert(
        `Error minting: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='p-4 w-full'>
      <h2 className='text-6xl font-bold mb-2'>Wallet</h2>
      <div className='flex justify-between items-center mb-2'>
        <div className='flex gap-2 items-start'>
          <Image
            className='mr-2 aspect-square'
            width={30}
            height={25}
            alt='coin'
            src={Coin}
          />
          <p className='text-2xl'>5</p>
        </div>
        <div className='flex gap-2 items-start'>
          <Image
            className='mr-2 aspect-square'
            width={30}
            height={25}
            alt='crown'
            src={Crown}
          />
          <p className='text-2xl'>1</p>
        </div>
        <div>
          <button
            onClick={() => alert("NEED AEON API KEY TO INTEGRATE THIS HERE")}
            className='bg-green-500  text-white font-bold py-2 px-4 '
          >
            <div className='flex gap-2'>
              <p className='text-xl'>Buy Coins</p>
            </div>
          </button>
        </div>
      </div>

      {isLoading ? (
        <>...Loading</>
      ) : (
        <>
          {tonWalletAddress ? (
            <div className='flex flex-col'>
              <button
                onClick={handleWalletAction}
                className='bg-red-500  text-white font-bold py-2 px-4 '
              >
                Disconnect {formatAddress(tonWalletAddress)}
              </button>
              <p className='text-green-500'>
                Your are currently eligible for $KODO Season 1.
              </p>
            </div>
          ) : (
            <div className='flex flex-col'>
              <button
                onClick={handleWalletAction}
                className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 '
              >
                Connect TON Wallet For Airdrop Season 1
              </button>
            </div>
          )}
        </>
      )}

      <div className='flex mt-2'>
        <div className=' mr-4 w-32'>
          <img
            src={metadata.image}
            alt={metadata.name}
            className='w-16 h-16 '
          />

          <p className=' '>
            {(
              Number(MIN_TONS_FOR_STORAGE + GAS_CONSUMPTION + nftPrice) / 1e9
            ).toFixed(2)}{" "}
            TON
          </p>
        </div>

        <div>
          <h1 className='text-xl font-bold'>{metadata.name}</h1>
          <p className='text-gray-400  '>{metadata.description}</p>
        </div>
      </div>
      <button
        onClick={handleMint}
        disabled={isLoading || !isConnected}
        className={`w-full py-3 px-6 font-semibold   text-white
              ${isConnected ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-600"} 
              transition-colors disabled:opacity-50`}
      >
        {isLoading
          ? "Minting..."
          : isConnected
          ? "Mint Soul Bound Crown"
          : "Connect Wallet First"}
      </button>
    </div>
  );
}
