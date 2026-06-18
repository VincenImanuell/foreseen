import { encodePacked, keccak256, type Address, type Hex } from "viem";
import { generatePrivateKey } from "viem/accounts";
import { Move } from "./types.js";

/**
 * Fresh, cryptographically-random 32-byte salt. Borrows viem's CSPRNG-backed
 * key generator — returns exactly a random 0x-prefixed 32-byte hex.
 *
 * **Keep this secret until reveal.** It is the blind in the CELO commit-reveal
 * scheme: losing the salt before reveal forfeits your ability to reveal on time.
 * @returns A 0x-prefixed 32-byte hex string suitable as a commit salt on CELO.
 * @since 0.1.0
 */
export function randomSalt(): Hex {
  return generatePrivateKey();
}

/**
 * Compute the commitment hash RPSCore expects: `keccak256(abi.encodePacked(player, move, salt))`.
 * Binding the commit to the player prevents replay attacks.
 * @param player - The address of the committing player.
 * @param move - The move being committed (Rock, Paper, or Scissors).
 * @param salt - A 32-byte random salt from {@link randomSalt}.
 * @returns The 32-byte commitment hash to pass to `commitMove`.
 * @since 0.1.0
 */
export function computeCommit(player: Address, move: Move, salt: Hex): Hex {
  return keccak256(encodePacked(["address", "uint8", "bytes32"], [player, move, salt]));
}

/**
 * Local mirror of `RPSCore._result`. Returns 0=draw, 1=A wins, 2=B wins.
 * Useful for previewing the outcome before the on-chain reveal settles.
 * @since 0.1.0
 */
export function resultOf(a: Move, b: Move): 0 | 1 | 2 {
  if (a === b) return 0;
  if (
    (a === Move.Rock && b === Move.Scissors) ||
    (a === Move.Paper && b === Move.Rock) ||
    (a === Move.Scissors && b === Move.Paper)
  ) {
    return 1;
  }
  return 2;
}

/**
 * Returns the move that beats `m`. Rock→Paper, Paper→Scissors, Scissors→Rock.
 * @since 0.1.0
 */
export function counter(m: Move): Move {
  return m === Move.Rock ? Move.Paper : m === Move.Paper ? Move.Scissors : Move.Rock;
}
