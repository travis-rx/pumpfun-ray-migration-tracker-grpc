import { RPC } from './src/config/endpoints';
const { Connection, clusterApiUrl, PublicKey } = require('@solana/web3.js');
const { Token, TOKEN_PROGRAM_ID } = require('@solana/spl-token');

async function getTokenBalances(connection, walletAddress) {
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
    walletAddress,
    { programId: TOKEN_PROGRAM_ID }
  );

  const balances = {};

  tokenAccounts.value.forEach((accountInfo) => {
    const accountData = accountInfo.account.data.parsed.info;
    const tokenMint = accountData.mint;
    const balance = accountData.tokenAmount.uiAmount;
    balances[tokenMint] = balance;
  });

  return balances;
}

const connection = new Connection(RPC, { commitment: 'confirmed' });
const walletAddresses = [
    new PublicKey('2jGGkjmvymnSgP1NnZ7Ui8e4HHL5t7pgBQB2aeJWGUVL'),
    new PublicKey('25mYnjJ2MXHZH6NvTTdA63JvjgRVcuiaj6MRiEQNs1Dq')
    // Add more wallet addresses as needed
  ];

walletAddresses.forEach(async (walletAddress) => {
  const balances = await getTokenBalances(connection, walletAddress);

  console.log(`Balances for wallet ${walletAddress.toBase58()}:`);
  console.log(balances);

  // Subscribe to account changes for updates
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
    walletAddress,
    { programId: TOKEN_PROGRAM_ID }
  );

  tokenAccounts.value.forEach((accountInfo) => {
    const tokenAccountAddress = accountInfo.pubkey;

    connection.onAccountChange(tokenAccountAddress, (accountInfo, context) => {

    if(!accountInfo.data.parsed.info){

        console.log("Info not avail", accountInfo.data.parsed);

        return

    }

      const accountData = accountInfo?.data.parsed.info;
      const tokenMint = accountData.mint;
      const balance = accountData.tokenAmount.uiAmount;
      console.log(
        `Updated balance for token mint ${tokenMint}: ${balance}`
      );
    });
  });
});
