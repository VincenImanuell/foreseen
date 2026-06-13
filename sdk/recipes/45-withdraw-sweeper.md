# Withdraw sweeper

Backend agents can call `pendingWithdrawals` after each settled match and then
`withdraw` when the balance is non-zero.

This keeps refunds and winnings from accumulating unnoticed.
