

const MIGRATION = '39azUYFWPz3VHgKCf3VChUwbpURdCHRxjWVowf5jUJjg';
const WSOL = 'So11111111111111111111111111111111111111112';
const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
const ASSOCIATED_TOKEN_PROGRAM_ID = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
const USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const USDT = 'Dn4noZ5jgGfkntzcQSUZ8czkreiZ1ForXYoV2H8Dm7S1';
const RAYDIUM = '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1';
const RAYDIUM_POOL = '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8'
const PUMPFUN = '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P';
const SYS_PROGRAM = '11111111111111111111111111111111'

const CommitmentLevel = {
    FINALIZED: 0,
    CONFIRMED: 1,
    PROCESSED: 2,
    RECENT: 3,
};

export const pumpfunReq = {
    accounts: {},
    slots: {},
    types: {},
    transactions: {
        migration: {
            vote: false,
            failed: false,
            signature: undefined,
            accountInclude: [PUMPFUN],
            accountExclude: [],
            accountRequired: [TOKEN_PROGRAM_ID],
        },
    },
    transactionsStatus: {},
    entry: {},
    blocks: {},
    blocksMeta: {},
    accountsDataSlice: [],
    ping: undefined,
    commitment: CommitmentLevel.CONFIRMED, //for receiving confirmed txn updates
};
