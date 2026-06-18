# SDK write client

A write client needs a private key and should run in a trusted environment.

Do not create write clients in browser code. Use wallet connectors for browser
transactions.
CELO write client requires `privateKey` and CELO gas — never instantiate it in browser-side code.
