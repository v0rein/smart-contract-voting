// ============================================
// useContract Hook
// Custom React hook untuk Web3 / smart contract interaction
// ============================================

import { useState, useEffect, useCallback, useRef } from "react";
import { ethers } from "ethers";
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  HARDHAT_CHAIN_ID,
} from "../utils/contract";
import { formatError } from "../utils/helpers";

export function useContract() {
  // ---- State ----
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null); // read-only contract
  const [writeContract, setWriteContract] = useState(null); // read-write contract
  const [isOwner, setIsOwner] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Data from contract
  const [candidates, setCandidates] = useState([]);
  const [totalVoters, setTotalVoters] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [votingDeadline, setVotingDeadline] = useState(0n);
  const [minimumQuorum, setMinimumQuorum] = useState(0);
  const [winner, setWinner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Transaction history (from events)
  const [voteHistory, setVoteHistory] = useState([]);

  // Refs untuk event listeners
  const contractRef = useRef(null);

  // ---- Setup Provider ----
  const setupProvider = useCallback(async () => {
    if (!window.ethereum) return null;
    const prov = new ethers.BrowserProvider(window.ethereum);
    setProvider(prov);
    return prov;
  }, []);

  // ---- Connect Wallet ----
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError(
        "MetaMask belum terinstall! Silakan install MetaMask terlebih dahulu.",
      );
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const prov = new ethers.BrowserProvider(window.ethereum);
      const sign = await prov.getSigner();
      const network = await prov.getNetwork();

      setProvider(prov);
      setSigner(sign);
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));
      setIsCorrectNetwork(Number(network.chainId) === HARDHAT_CHAIN_ID);

      // Setup contracts
      const readContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        prov,
      );
      const rwContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        sign,
      );
      setContract(readContract);
      setWriteContract(rwContract);
      contractRef.current = readContract;

      // Check if owner
      try {
        const ownerAddr = await readContract.owner();
        setIsOwner(ownerAddr.toLowerCase() === accounts[0].toLowerCase());
      } catch {
        setIsOwner(false);
      }
    } catch (err) {
      setError(formatError(err));
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // ---- Disconnect Wallet ----
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setContract(null);
    setWriteContract(null);
    setIsOwner(false);
    setChainId(null);
    setIsCorrectNetwork(false);
    setHasVoted(false);
    setCandidates([]);
    setTotalVoters(0);
    setWinner(null);
    setVoteHistory([]);
  }, []);

  // ---- Load Contract Data (READ operations) ----
  const loadContractData = useCallback(async () => {
    if (!contract) return;

    try {
      setIsLoading(true);

      // Read: getCandidateCount + getCandidate (loop)
      const count = await contract.getCandidateCount();
      const candidateList = [];
      for (let i = 0; i < Number(count); i++) {
        const [name, voteCount] = await contract.getCandidate(i);
        candidateList.push({ id: i, name, voteCount: Number(voteCount) });
      }
      setCandidates(candidateList);

      // Read: totalVoters
      const voters = await contract.totalVoters();
      setTotalVoters(Number(voters));

      // Read: votingDeadline
      const deadline = await contract.votingDeadline();
      setVotingDeadline(deadline);

      // Read: minimumQuorum
      const quorum = await contract.minimumQuorum();
      setMinimumQuorum(Number(quorum));

      // Read: hasVoted (for connected account)
      if (account) {
        const voted = await contract.hasVoted(account);
        setHasVoted(voted);
      }

      // Read: getWinner (might revert if quorum not met)
      try {
        const [winnerName, winnerVoteCount] = await contract.getWinner();
        setWinner({ name: winnerName, voteCount: Number(winnerVoteCount) });
      } catch {
        setWinner(null); // Quorum not met or no candidates
      }
    } catch (err) {
      console.error("Error loading contract data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [contract, account]);

  // ---- Load Vote History from Events ----
  const loadVoteHistory = useCallback(async () => {
    if (!contract) return;

    try {
      const filter = contract.filters.Voted();
      const events = await contract.queryFilter(filter, 0, "latest");
      const history = events.map((e) => ({
        voter: e.args[0],
        candidateId: Number(e.args[1]),
        blockNumber: e.blockNumber,
        txHash: e.transactionHash,
      }));
      setVoteHistory(history.reverse()); // newest first
    } catch (err) {
      console.error("Error loading vote history:", err);
    }
  }, [contract]);

  // ---- WRITE: Vote ----
  const vote = useCallback(
    async (candidateId) => {
      if (!writeContract) throw new Error("Wallet belum terkoneksi");

      const tx = await writeContract.vote(candidateId);
      await tx.wait();
      await loadContractData();
      await loadVoteHistory();
      return tx;
    },
    [writeContract, loadContractData, loadVoteHistory],
  );

  // ---- WRITE: Add Candidate ----
  const addCandidate = useCallback(
    async (name) => {
      if (!writeContract) throw new Error("Wallet belum terkoneksi");

      const tx = await writeContract.addCandidate(name);
      await tx.wait();
      await loadContractData();
      return tx;
    },
    [writeContract, loadContractData],
  );

  // ---- WRITE: Set Deadline ----
  const setDeadline = useCallback(
    async (durationInMinutes) => {
      if (!writeContract) throw new Error("Wallet belum terkoneksi");

      const tx = await writeContract.setDeadline(durationInMinutes);
      await tx.wait();
      await loadContractData();
      return tx;
    },
    [writeContract, loadContractData],
  );

  // ---- Event Listeners (Real-time updates) ----
  useEffect(() => {
    if (!contract) return;

    const onVoted = () => {
      loadContractData();
      loadVoteHistory();
    };

    const onCandidateAdded = () => {
      loadContractData();
    };

    const onDeadlineSet = () => {
      loadContractData();
    };

    contract.on("Voted", onVoted);
    contract.on("CandidateAdded", onCandidateAdded);
    contract.on("DeadlineSet", onDeadlineSet);

    return () => {
      contract.off("Voted", onVoted);
      contract.off("CandidateAdded", onCandidateAdded);
      contract.off("DeadlineSet", onDeadlineSet);
    };
  }, [contract, loadContractData, loadVoteHistory]);

  // ---- MetaMask Event Listeners ----
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAccount(accounts[0]);
        // Re-connect to update signer
        connectWallet();
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [connectWallet, disconnectWallet]);

  // ---- Auto-load data when contract is ready ----
  useEffect(() => {
    if (contract) {
      loadContractData();
      loadVoteHistory();
    }
  }, [contract, loadContractData, loadVoteHistory]);

  return {
    // State
    account,
    isOwner,
    chainId,
    isCorrectNetwork,
    isConnecting,
    error,
    isLoading,

    // Contract data
    candidates,
    totalVoters,
    hasVoted,
    votingDeadline,
    minimumQuorum,
    winner,
    voteHistory,

    // Actions
    connectWallet,
    disconnectWallet,
    vote,
    addCandidate,
    setDeadline,
    loadContractData,

    // Setters
    setError,
  };
}
