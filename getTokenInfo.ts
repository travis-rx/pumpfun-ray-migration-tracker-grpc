import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { AccountInfo } from '@solana/web3.js';
import { WSOL } from './src/config/constants';
import { RPC } from './src/config/endpoints';

let mapped_wallets = ["25mYnjJ2MXHZH6NvTTdA63JvjgRVcuiaj6MRiEQNs1Dq",
"8mNw7FBnUZmUeX3mioGytaGQ8YRrbPE7PCS1z6WyusLs"
];

async function updateBalances() {
  const connection = new Connection(RPC);
//   while (true) {
//     for (const mint in wallets_created) {
//       const wallets = wallets_created[mint].wallets;
//       for (let i = 0; i < wallets.length; i++) {
//         const wallet = wallets[i];
//         const walletPublicKey = new PublicKey(wallet);

//         const solBalance = await connection.getBalance(walletPublicKey);
//         const wsolAccounts = await connection.getParsedTokenAccountsByOwner(walletPublicKey, { mint: new PublicKey(WSOL) });
//         const wsolBalance = wsolAccounts.value.reduce((acc, account) => acc + (account.account.data.parsed.info.tokenAmount.uiAmount || 0), 0);
      
//         const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletPublicKey, { mint: new PublicKey(mint) });
//         const tokenBalance = tokenAccounts.value.reduce((acc, account) => acc + (account.account.data.parsed.info.tokenAmount.uiAmount || 0), 0);
//         wallets_created[mint].sol_balances[i] = solBalance / LAMPORTS_PER_SOL;
//         wallets_created[mint].wsol_balances[i] = wsolBalance / LAMPORTS_PER_SOL;
//         wallets_created[mint].token_balances[i] = tokenBalance;
//       }
//     }
//     await new Promise(resolve => setTimeout(resolve, 1000));
//   }

const walletPublicKey = new PublicKey(mapped_wallets[0]);

const wsolAccounts = await connection.getParsedTokenAccountsByOwner(walletPublicKey, { mint: new PublicKey(WSOL) });

console.log(wsolAccounts.value.reduce((acc, account) => acc + (account.account.data.parsed.info.tokenAmount.uiAmount || 0), 0));


}

updateBalances().then(() => console.log("Done")).catch(console.error);