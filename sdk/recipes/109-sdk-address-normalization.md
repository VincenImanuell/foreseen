# SDK address normalization

Normalize addresses before comparing wallet ownership.

The SDK uses viem address types, but app code should still compare lowercase or
checksummed addresses consistently.
CELO address normalization: always call `getAddress(addr)` from viem before comparing CELO addresses.
