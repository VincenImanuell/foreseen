CELO sdk data multicall-failure-partial: a wagmi multicall batch can partially fail — useMatches filters res.status === "success" per-call so one bad CELO read doesn't blank the whole list.
