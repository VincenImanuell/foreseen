import { encodePacked, keccak256, type Address, type Hex } from "viem";
import { generatePrivateKey } from "viem/accounts";
import { Move } from "./types.js";

/**
 * Fresh, cryptographically-random 32-byte salt. (We borrow viem's CSPRNG-backed
 * key generator — it returns exactly a random 0x-prefixed 32-byte hex.) Keep the
 * salt secret until reveal; it is the blind in commit-reveal.
 * @returns A 0x-prefixed 32-byte hex string suitable as a commit salt.
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

/** Local mirror of RPSCore._result: 0=draw, 1=A wins, 2=B wins. */
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

/** The move that beats `m`. */
export function counter(m: Move): Move {
  return m === Move.Rock ? Move.Paper : m === Move.Paper ? Move.Scissors : Move.Rock;
}
