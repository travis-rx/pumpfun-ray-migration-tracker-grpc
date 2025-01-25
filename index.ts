import Client, {
    CommitmentLevel,
    SubscribeRequestAccountsDataSlice,
    SubscribeRequestFilterAccounts,
    SubscribeRequestFilterBlocks,
    SubscribeRequestFilterBlocksMeta,
    SubscribeRequestFilterEntry,
    SubscribeRequestFilterSlots,
    SubscribeRequestFilterTransactions,
  } from "@triton-one/yellowstone-grpc";
import { AccountInfo } from "@solana/web3.js";
import { SubscribeRequestPing } from "@triton-one/yellowstone-grpc/dist/grpc/geyser";
import { LAMPORTS_PER_SOL, Connection, PublicKey, VersionedTransactionResponse } from "@solana/web3.js";
import { Idl } from "@project-serum/anchor";
import { SolanaParser } from "@shyft-to/solana-transaction-parser";
import { TransactionFormatter } from "./utils/transaction-formatter";
import pumpFunIdl from "./src/config/pumpfun/idl.json";
import { SolanaEventParser } from "./utils/event-parser";
import { bnLayoutFormatter } from "./utils/bn-layout-formatter";
import { transactionOutput } from "./utils/transactionOutput";
import { getBondingCurveAddress } from "./utils/getBonding";

import { filterCreateATA } from "./utils/assocTxOutput";
import { decodeTransact } from "./utils/decodeTransaction";
import { getTokenInfo } from "./src/config/pumpfun/getTokenInfo";
// import { SubscribeRequest } from "./src/streams/interface";
import { client } from "./src/streams/client";
import { pumpfunReq } from "./src/streams/requests";
import { displayTable } from "./utils/displayTable";
import { RPC } from "./src/config/endpoints";

interface SubscribeRequest {
    accounts: { [key: string]: SubscribeRequestFilterAccounts };
    slots: { [key: string]: SubscribeRequestFilterSlots };
    transactions: { [key: string]: SubscribeRequestFilterTransactions };
    transactionsStatus: { [key: string]: SubscribeRequestFilterTransactions };
    blocks: { [key: string]: SubscribeRequestFilterBlocks };
    blocksMeta: { [key: string]: SubscribeRequestFilterBlocksMeta };
    entry: { [key: string]: SubscribeRequestFilterEntry };
    commitment?: CommitmentLevel | undefined;
    accountsDataSlice: SubscribeRequestAccountsDataSlice[];
    ping?: SubscribeRequestPing | undefined;
  }
  
const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
const WSOL = 'So11111111111111111111111111111111111111112';
const PUMPFUN_PROGRAM = '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P'

const exclude_programs = [TOKEN_PROGRAM_ID, WSOL, PUMPFUN_PROGRAM]

const TXN_FORMATTER = new TransactionFormatter();
const PUMP_FUN_PROGRAM_ID = new PublicKey(
  "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P",
);

const PUMP_FUN_IX_PARSER = new SolanaParser([]);
PUMP_FUN_IX_PARSER.addParserFromIdl(
  PUMP_FUN_PROGRAM_ID.toBase58(),
  pumpFunIdl as Idl,
);

const PUMP_FUN_EVENT_PARSER = new SolanaEventParser([], console);
PUMP_FUN_EVENT_PARSER.addParserFromIdl(
  PUMP_FUN_PROGRAM_ID.toBase58(),
  pumpFunIdl as Idl,
);


export let wallets_created: { [key: string]: { token_info: { token_name?: string, token_symbol?: string }, status: string, wallets: string[], sol_balances: number[], wsol_balances: number[], token_balances: number[], last_updated: number } } = {};

let stream_tokens_started: boolean = false;
let currentMintStream: any = null;
let lastClearTime = 0;

let mints = [];

async function clearConsole(time: number) {
    if (time - lastClearTime > 1000) {
        console.clear();
        await new Promise(resolve => setTimeout(resolve, 50));
        lastClearTime = Date.now();
        displayTable(wallets_created);
    }
}

async function subscribePumpfun(client: Client, args: SubscribeRequest) {
  // Subscribe for events
  const stream = await client.subscribe();

  // Create `error` / `end` handler
  const streamClosed = new Promise<void>((resolve, reject) => {
    stream.on("error", (error) => {
      console.log("ERROR", error);
      reject(error);
      stream.end();
    });
    stream.on("end", () => {
      resolve();
    });
    stream.on("close", () => {
      resolve();
    });
  });

  // Handle updates
  stream.on("data", async (data) => {
    if(!data) return;

    if (data?.transaction) {
      const txn = TXN_FORMATTER.formTransactionFromJson(
        data.transaction,
        Date.now(),
      );

      const parsedTxn = decodePumpFunTxn(txn);
      if (!parsedTxn) return;
      const tOutput = transactionOutput(parsedTxn)
      if (!tOutput) return;
      const balance = await getBondingCurveAddress(tOutput.bondingCurve);
      if(!balance) return;
      const progress = ((Number(balance)/84 )* 100);

      if(Number(progress) < 97){

        return

      }

      if(exclude_programs.includes(tOutput.mint)){

        return
      }

      if(!mints.includes(tOutput.mint)){
        mints.push(tOutput.mint);
        trackForCreateATA(tOutput.mint);
      }

      if (mints.length === 30) {
        mints.shift();
      }

    }
  });


  // Send subscribe request
  await new Promise<void>((resolve, reject) => {
    stream.write(args, (err: any) => {
      if (err === null || err === undefined) {
        resolve();
      } else {
        reject(err);
      }
    });
  }).catch((reason) => {
    console.error(reason);
    throw reason;
  });

  await streamClosed;
}


export async function trackForCreateATA(mint: string) {
    try {
        const tokenInfo = await getTokenInfo(mint);
        if (!tokenInfo) return;

        const token_name = tokenInfo.name || 'Unknown';
        const token_symbol = tokenInfo.symbol || 'Unknown';

        if (!wallets_created[mint]) {
            wallets_created[mint] = { token_info: { token_name, token_symbol }, status: 'migrating', wallets: [], sol_balances: [], wsol_balances: [], token_balances: [], last_updated: Date.now() };
        }

        console.log("Migrating:", mint, '|', token_name, '|', token_symbol);

        const mintTokenReq = {
            accounts: {},
            slots: {},
            types: {},
            transactions: {
                create: {
                    vote: false,
                    failed: false,
                    signature: undefined,
                    accountInclude: [mint],
                    accountExclude: [],
                    accountRequired: [],
                },
            },
            transactionsStatus: {},
            entry: {},
            blocks: {},
            blocksMeta: {},
            accountsDataSlice: [],
            ping: undefined,
            commitment: CommitmentLevel.PROCESSED,
        };

        subscribeMints(client, mintTokenReq, streamMintTxns);

        if (!stream_tokens_started) {
            stream_tokens_started = true;
        }
    } catch (error) {
        console.log(error);
    }
}

async function streamMintTxns(client: Client, args: SubscribeRequest) {
    if (currentMintStream) {
        currentMintStream.end();
    }

    currentMintStream = await client.subscribe();
    const streamClosed = new Promise<void>((resolve, reject) => {
        currentMintStream.on("error", (error) => {
            console.log("ERROR", error);
            reject(error);
            currentMintStream.end();
        });
        currentMintStream.on("end", resolve);
        currentMintStream.on("close", resolve);
    });

    currentMintStream.on("data", async (data) => {
        if (!data.transaction) return;

        try {
            const result = await filterCreateATA(data);
            if (!result) return;

            const mint = result.mint.toString();
            const signer = result.signer;
            const sol_balance = result.sol_balance / LAMPORTS_PER_SOL;
            const wsol_balance = result.wsol_balance / LAMPORTS_PER_SOL;
            const token_balance = result.token_balance / 10 ** 6;

            if (!wallets_created[mint]) {
                const tokenInfo = await getTokenInfo(mint);
                if (!tokenInfo) return;

                const token_name = tokenInfo.name || 'Unknown';
                const token_symbol = tokenInfo.symbol || 'Unknown';

                wallets_created[mint] = { token_info: { token_name, token_symbol }, status: 'migrating', wallets: [], sol_balances: [], wsol_balances: [], token_balances: [], last_updated: Date.now() };
            }

            if (!wallets_created[mint].wallets.includes(signer)) {
                wallets_created[mint].wallets.push(signer);
                wallets_created[mint].sol_balances.push(sol_balance);
                wallets_created[mint].wsol_balances.push(wsol_balance);
                wallets_created[mint].token_balances.push(token_balance);
            } else {
                const signer_index = wallets_created[mint].wallets.indexOf(signer);
                wallets_created[mint].sol_balances[signer_index] = sol_balance;
                wallets_created[mint].wsol_balances[signer_index] = wsol_balance;
                wallets_created[mint].token_balances[signer_index] = token_balance;
            }

            wallets_created[mint].last_updated = Date.now();

            const keys = Object.keys(wallets_created);
            for (const key of keys) {
                if (Date.now() - wallets_created[key].last_updated > 180000) { // 3 mins
                    delete wallets_created[key];
                }
            }

            const fs = require('fs');
            const path = require('path');
            const filePath = path.resolve(__dirname, 'walletsCreated.json');
            fs.writeFileSync(filePath, JSON.stringify(wallets_created, null, 2));

            clearConsole(Date.now());
        } catch (error) {
            console.log(error);
        }
    });

    await new Promise<void>((resolve, reject) => {
        currentMintStream.write(args, (err: any) => {
            if (!err) resolve();
            else reject(err);
        });
    }).catch(console.error);

    await streamClosed;
}

async function subscribeMints(client: Client, args: SubscribeRequest, handler: (client: Client, args: SubscribeRequest) => Promise<void>) {
    while (true) {
        try {
            await handler(client, args);
        } catch (error) {
            console.error("Stream error, restarting in 1 second...", error);
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }
}

let isUpdating = false;

setInterval(() => {
  if (isUpdating) return;

  isUpdating = true;

  async function updateWalletBalances() {
    const connection = new Connection(RPC);

    for (const mint in wallets_created) {
      const wallets = wallets_created[mint].wallets;

      for (let i = 0; i < wallets.length; i++) {
        const wallet = wallets[i];
        const walletPublicKey = new PublicKey(wallet);

        // Get SOL balance
        let solBalance = 0;
        try {
          solBalance = await connection.getBalance(walletPublicKey);
        } catch (error) {
        let tokenAccounts;
        try {
          tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletPublicKey, { mint: new PublicKey(mint) });
        } catch (error) {
        let wsolAccounts;
        try {
          wsolAccounts = await connection.getParsedTokenAccountsByOwner(walletPublicKey, { mint: new PublicKey(WSOL) });
        } catch (error) {
          console.error(`Error fetching WSOL accounts for ${wallet}:`, error);
          continue;
        }
          continue;
        }
          continue;
        }
        wallets_created[mint].wsol_balances[i] = solBalance / LAMPORTS_PER_SOL;

        // Get token balance
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletPublicKey, { mint: new PublicKey(mint) });
        const tokenBalance = tokenAccounts.value.reduce((acc, account) => {
          return acc + (account.account.data.parsed.info.tokenAmount.uiAmount || 0);
        }, 0);
        const wsolAccounts = await connection.getParsedTokenAccountsByOwner(walletPublicKey, { mint: new PublicKey(WSOL) });

        const wsolBalance = wsolAccounts.value.reduce((acc, account) => acc + (account.account.data.parsed.info.tokenAmount.uiAmount || 0), 0);

        if (tokenBalance !== 0) {
          wallets_created[mint].token_balances[i] = tokenBalance;
        }
        if (solBalance !== 0) {
          wallets_created[mint].wsol_balances[i] = solBalance / LAMPORTS_PER_SOL;
        }
        if (wsolBalance !== 0) {
          wallets_created[mint].sol_balances[i] = wsolBalance;
        }
      }
    }
  }

  updateWalletBalances().finally(() => {
    isUpdating = false;
  });

}, 1000);

subscribePumpfun(client, pumpfunReq);

function decodePumpFunTxn(tx: VersionedTransactionResponse) {
    if (tx.meta?.err) return;
  
    const paredIxs = PUMP_FUN_IX_PARSER.parseTransactionData(
      tx.transaction.message,
      tx.meta.loadedAddresses,
    );
  
    const pumpFunIxs = paredIxs.filter((ix) =>
      ix.programId.equals(PUMP_FUN_PROGRAM_ID),
    );
  
    if (pumpFunIxs.length === 0) return;
    const events = PUMP_FUN_EVENT_PARSER.parseEvent(tx);
    const result = { instructions: pumpFunIxs, events };
    bnLayoutFormatter(result);
    return result;
  }