// Auto-generated from contracts/out/RPSCore.sol/RPSCore.json — do not edit by hand.
export const rpsCoreAbi = [
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "treasury_",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "stats_",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "ranked_",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "BPS_DENOMINATOR",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "FEE_BPS",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "REVEAL_TIMEOUT",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "cancelMatch",
    "inputs": [
      {
        "name": "matchId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "claimTimeout",
    "inputs": [
      {
        "name": "matchId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "createMatch",
    "inputs": [
      {
        "name": "mode",
        "type": "uint8",
        "internalType": "enum RPSCore.Mode"
      },
      {
        "name": "commit",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "matchId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "getMatch",
    "inputs": [
      {
        "name": "matchId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct RPSCore.Match",
        "components": [
          {
            "name": "playerA",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "playerB",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "commitA",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "commitB",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "revealA",
            "type": "uint8",
            "internalType": "enum RPSCore.Move"
          },
          {
            "name": "revealB",
            "type": "uint8",
            "internalType": "enum RPSCore.Move"
          },
          {
            "name": "bet",
            "type": "uint128",
            "internalType": "uint128"
          },
          {
            "name": "createdAt",
            "type": "uint64",
            "internalType": "uint64"
          },
          {
            "name": "joinedAt",
            "type": "uint64",
            "internalType": "uint64"
          },
          {
            "name": "revealDeadline",
            "type": "uint64",
            "internalType": "uint64"
          },
          {
            "name": "mode",
            "type": "uint8",
            "internalType": "enum RPSCore.Mode"
          },
          {
            "name": "state",
            "type": "uint8",
            "internalType": "enum RPSCore.MatchState"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "joinMatch",
    "inputs": [
      {
        "name": "matchId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "commit",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "matches",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "playerA",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "playerB",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "commitA",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "commitB",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "revealA",
        "type": "uint8",
        "internalType": "enum RPSCore.Move"
      },
      {
        "name": "revealB",
        "type": "uint8",
        "internalType": "enum RPSCore.Move"
      },
      {
        "name": "bet",
        "type": "uint128",
        "internalType": "uint128"
      },
      {
        "name": "createdAt",
        "type": "uint64",
        "internalType": "uint64"
      },
      {
        "name": "joinedAt",
        "type": "uint64",
        "internalType": "uint64"
      },
      {
        "name": "revealDeadline",
        "type": "uint64",
        "internalType": "uint64"
      },
      {
        "name": "mode",
        "type": "uint8",
        "internalType": "enum RPSCore.Mode"
      },
      {
        "name": "state",
        "type": "uint8",
        "internalType": "enum RPSCore.MatchState"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "nextMatchId",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "pendingWithdrawals",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "ranked",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "contract IRPSRanked"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "reveal",
    "inputs": [
      {
        "name": "matchId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "move",
        "type": "uint8",
        "internalType": "enum RPSCore.Move"
      },
      {
        "name": "salt",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "stats",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "contract IRPSStats"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "treasury",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "withdraw",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "MatchCancelled",
    "inputs": [
      {
        "name": "matchId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MatchCreated",
    "inputs": [
      {
        "name": "matchId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "playerA",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "mode",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum RPSCore.Mode"
      },
      {
        "name": "bet",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "createdAt",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MatchJoined",
    "inputs": [
      {
        "name": "matchId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "playerB",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "joinedAt",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "revealDeadline",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Revealed",
    "inputs": [
      {
        "name": "matchId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "player",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "move",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum RPSCore.Move"
      },
      {
        "name": "timestamp",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Settled",
    "inputs": [
      {
        "name": "matchId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "winner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "payout",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "fee",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "moveA",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum RPSCore.Move"
      },
      {
        "name": "moveB",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum RPSCore.Move"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Withdrawn",
    "inputs": [
      {
        "name": "account",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "AlreadyRevealed",
    "inputs": []
  },
  {
    "type": "error",
    "name": "BadReveal",
    "inputs": []
  },
  {
    "type": "error",
    "name": "BetMismatch",
    "inputs": []
  },
  {
    "type": "error",
    "name": "CannotJoinOwnMatch",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidBet",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidMove",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotAContract",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotPlayer",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NothingToWithdraw",
    "inputs": []
  },
  {
    "type": "error",
    "name": "Reentrancy",
    "inputs": []
  },
  {
    "type": "error",
    "name": "TooEarly",
    "inputs": []
  },
  {
    "type": "error",
    "name": "TransferFailed",
    "inputs": []
  },
  {
    "type": "error",
    "name": "WrongState",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ZeroAddress",
    "inputs": []
  }
] as const;
