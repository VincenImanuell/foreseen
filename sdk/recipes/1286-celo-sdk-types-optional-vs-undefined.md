CELO sdk types optional-vs-undefined: hasCommitted(commit?: Hex) accepts undefined explicitly because wagmi's useReadContract data starts undefined before the first CELO RPC response lands.
