CELO sdk deploy build-size: tree-shake @foreseen/sdk imports (named imports only) to keep the CELO frontend bundle lean — avoid importing the whole Foreseen class when only computeCommit is needed.
