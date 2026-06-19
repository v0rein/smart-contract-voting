// ============================================
// useContract Hook
// Custom React hook untuk Web3 / smart contract interaction
// ============================================

import { useState, useEffect, useCallback, useRef } from "react";
import { ethers } from "ethers";
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  isSupportedNetwork,
} from "../utils/contract";
import { formatError } from "../utils/helpers";

export function useContract() {
  // ---- State ----
  const [account, setAccount] = useState(null);
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
  const [minimumQuorum, setMinimumQuorum] = useState(0);
  const [winner, setWinner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fitur Lanjutan State
  const [votingOpen, setVotingOpen] = useState(false);
  const [votingStartTime, setVotingStartTime] = useState(0n);
  const [votingEndTime, setVotingEndTime] = useState(0n);
  const [registeredVotersCount, setRegisteredVotersCount] = useState(0);
  const [isRegistered, setIsRegistered] = useState(false);
  const [delegatedTo, setDelegatedTo] = useState(null);

  // Transaction history (from events)
  const [voteHistory, setVoteHistory] = useState([]);

  // Refs untuk event listeners
  const contractRef = useRef(null);

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

      setAccount(accounts[0]);
      setChainId(Number(network.chainId));
      setIsCorrectNetwork(isSupportedNetwork(Number(network.chainId)));

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
    setVotingOpen(false);
    setIsRegistered(false);
    setDelegatedTo(null);
  }, []);

  // ---- Load Contract Data (READ operations) ----
  const loadContractData = useCallback(async () => {
    if (!contract) return;

    try {
      setIsLoading(true);

      const candidatesData = await contract.getAllCandidates();
      const formattedCandidates = candidatesData.map((c) => ({
        id: Number(c.id),
        name: c.name,
        voteCount: Number(c.voteCount),
      }));
      setCandidates(formattedCandidates);

      const totalVotersData = await contract.totalVoters();
      setTotalVoters(Number(totalVotersData));

      const quorum = await contract.minimumQuorum();
      setMinimumQuorum(Number(quorum));

      const isOpen = await contract.votingOpen();
      setVotingOpen(isOpen);

      const startTime = await contract.votingStartTime();
      setVotingStartTime(startTime);

      const endTime = await contract.votingEndTime();
      setVotingEndTime(endTime);

      const registeredCount = await contract.registeredVotersCount();
      setRegisteredVotersCount(Number(registeredCount));

      if (account) {
        const voted = await contract.checkIfVoted(account);
        setHasVoted(voted);

        const registered = await contract.registeredVoters(account);
        setIsRegistered(registered);

        const delegateAddress = await contract.delegations(account);
        if (delegateAddress !== ethers.ZeroAddress) {
          setDelegatedTo(delegateAddress);
        } else {
          setDelegatedTo(null);
        }
      }

      // Read: getWinner
      try {
        const [winnerName, winnerVoteCount] = await contract.getWinner();
        setWinner({ name: winnerName, voteCount: Number(winnerVoteCount) });
      } catch {
        setWinner(null); 
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
        weight: Number(e.args[2]),
        blockNumber: e.blockNumber,
        txHash: e.transactionHash,
      }));
      setVoteHistory(history.reverse()); 
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

  // ---- WRITE: Delegate ----
  const delegateVote = useCallback(
    async (toAddress) => {
      if (!writeContract) throw new Error("Wallet belum terkoneksi");
      const tx = await writeContract.delegate(toAddress);
      await tx.wait();
      await loadContractData();
      return tx;
    },
    [writeContract, loadContractData],
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

  // ---- WRITE: Set Voting Status ----
  const setVotingStatusAction = useCallback(
    async (status) => {
      if (!writeContract) throw new Error("Wallet belum terkoneksi");
      const tx = await writeContract.setVotingStatus(status);
      await tx.wait();
      await loadContractData();
      return tx;
    },
    [writeContract, loadContractData],
  );

  // ---- WRITE: Set Voting Period ----
  const setVotingPeriodAction = useCallback(
    async (startTime, endTime) => {
      if (!writeContract) throw new Error("Wallet belum terkoneksi");
      const tx = await writeContract.setVotingPeriod(startTime, endTime);
      await tx.wait();
      await loadContractData();
      return tx;
    },
    [writeContract, loadContractData],
  );

  // ---- WRITE: Register Voter ----
  const registerVoterAction = useCallback(
    async (voterAddress) => {
      if (!writeContract) throw new Error("Wallet belum terkoneksi");
      const tx = await writeContract.registerVoter(voterAddress);
      await tx.wait();
      await loadContractData();
      return tx;
    },
    [writeContract, loadContractData],
  );

  // ---- WRITE: Set Minimum Quorum ----
  const setMinimumQuorumAction = useCallback(
    async (newQuorum) => {
      if (!writeContract) throw new Error("Wallet belum terkoneksi");
      const tx = await writeContract.setMinimumQuorum(newQuorum);
      await tx.wait();
      await loadContractData();
      return tx;
    },
    [writeContract, loadContractData],
  );

  // ---- WRITE: Set Voter Weight ----
  const setVoterWeightAction = useCallback(
    async (voterAddress, weight) => {
      if (!writeContract) throw new Error("Wallet belum terkoneksi");
      const tx = await writeContract.setVoterWeight(voterAddress, weight);
      await tx.wait();
      return tx;
    },
    [writeContract],
  );

  // ---- Event Listeners (Real-time updates) ----
  useEffect(() => {
    if (!contract) return;

    const onUpdate = () => {
      loadContractData();
    };

    const onVoted = () => {
      loadContractData();
      loadVoteHistory();
    };

    contract.on("Voted", onVoted);
    contract.on("CandidateAdded", onUpdate);
    contract.on("VotingStatusChanged", onUpdate);
    contract.on("VotingPeriodSet", onUpdate);
    contract.on("VoterRegistered", onUpdate);
    contract.on("VoteDelegated", onUpdate);
    contract.on("QuorumUpdated", onUpdate);

    return () => {
      contract.off("Voted", onVoted);
      contract.off("CandidateAdded", onUpdate);
      contract.off("VotingStatusChanged", onUpdate);
      contract.off("VotingPeriodSet", onUpdate);
      contract.off("VoterRegistered", onUpdate);
      contract.off("VoteDelegated", onUpdate);
      contract.off("QuorumUpdated", onUpdate);
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
      // eslint-disable-next-line react-hooks/rules-of-hooks, no-restricted-syntax
      const fetchInitialData = async () => {
        await loadContractData();
        await loadVoteHistory();
      };
      fetchInitialData();
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
    minimumQuorum,
    winner,
    voteHistory,

    // Fitur Lanjutan Data
    votingOpen,
    votingStartTime,
    votingEndTime,
    registeredVotersCount,
    isRegistered,
    delegatedTo,

    // Actions
    connectWallet,
    disconnectWallet,
    vote,
    delegateVote,
    addCandidate,
    setVotingStatusAction,
    setVotingPeriodAction,
    registerVoterAction,
    setMinimumQuorumAction,
    setVoterWeightAction,
    loadContractData,

    // Setters
    setError,
  };
}
