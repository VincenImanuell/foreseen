"use client";

import { useMemo } from "react";
import { useReadContract, useReadContracts } from "wagmi";
import { rpsCore } from "@/lib/contracts";
import { toRpsMatch, type RpsMatch } from "@/lib/rps";

export type MatchEntry = { id: bigint; match: RpsMatch };

/** How many of the most recent matches to load (keeps a long-lived
 *  contract from ballooning the multicall). */
const WINDOW = 50;

export function useMatches() {
  const {
    data: nextId,
    refetch: refetchNext,
    isLoading: loadingNext,
  } = useReadContract({
    ...rpsCore,
    functionName: "nextMatchId",
    query: { refetchInterval: 8_000 },
  });

  const ids = useMemo(() => {
    const n = nextId ? Number(nextId) : 0;
    const start = Math.max(0, n - WINDOW);
    return Array.from({ length: n - start }, (_, i) => BigInt(start + i));
  }, [nextId]);

  const {
    data,
    refetch: refetchMatches,
    isLoading: loadingMatches,
  } = useReadContracts({
    contracts: ids.map((id) => ({
      ...rpsCore,
      functionName: "getMatch" as const,
      args: [id] as const,
    })),
    query: { enabled: ids.length > 0, refetchInterval: 8_000 },
  });

  const entries: MatchEntry[] = useMemo(() => {
    if (!data) return [];
    const out: MatchEntry[] = [];
    data.forEach((res, i) => {
      if (res.status === "success" && res.result) {
        out.push({ id: ids[i], match: toRpsMatch(res.result) });
      }
    });
    // newest first
    return out.reverse();
  }, [data, ids]);

  const refetch = () => {
    refetchNext();
    refetchMatches();
  };

  return { entries, refetch, isLoading: loadingNext || loadingMatches };
}
