import dotenv from 'dotenv';


const PHASE2_ADDRESS = process.env.NEXT_PUBLIC_PHASE2_CONTRACT_ADDRESS;
const PHASE1_ADDRESS = process.env.NEXT_PUBLIC_PHASE1_CONTRACT_ADDRESS;

export { PHASE1_ADDRESS, PHASE2_ADDRESS };

export const PHASE1_ABI = [
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'hasExploitedVulnerability',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserAuthInfo',
    outputs: [
      { name: 'isAuthorized', type: 'bool' },
      { name: 'level', type: 'uint256' },
      { name: 'cooldownEnds', type: 'uint256' },
      { name: 'hasExploited', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// EmergencyVIPGateway (Phase 2) ABI - only needed functions
export const PHASE2_ABI = [
  {
    inputs: [{ name: 'contractAddress', type: 'address' }],
    name: 'checkIfExploited',
    outputs: [{ name: 'exploited', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserInfo',
    outputs: [
      { name: 'userDeposits', type: 'uint256' },
      { name: 'exploited', type: 'bool' },
      { name: 'userIsWhitelisted', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;