import { decodeTransact } from "./decodeTransaction";

export function filterCreateATA(data){

    const dataTx = data?data?.transaction?.transaction:null;
    const signature = decodeTransact(dataTx?.signature);
    const message = dataTx?.transaction?.message;

    // console.log("Signature:", signature);

    const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
    const ASSOCIATED_TOKEN_PROGRAM_ID = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
    const USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
    const USDT = 'Dn4noZ5jgGfkntzcQSUZ8czkreiZ1ForXYoV2H8Dm7S1';
    const RAYDIUM = '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1';
    const PUMPFUN = '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P';
    const WSOL = 'So11111111111111111111111111111111111111112';

    // console.log("Signature:", signature);

    const header = message?.header;
    const accountKeys = message?.accountKeys.map((t)=>{
        return decodeTransact(t);
    });

    if (accountKeys.length > 12 || !accountKeys.includes(TOKEN_PROGRAM_ID) || !accountKeys.includes(ASSOCIATED_TOKEN_PROGRAM_ID) || accountKeys.includes(USDC) || accountKeys.includes(USDT) || accountKeys.includes(RAYDIUM) || accountKeys.includes(PUMPFUN) || accountKeys.includes(WSOL)) {
        return null;
    }
    
    const recentBlockhash = decodeTransact(message?.recentBlockhash);

    // console.log("Inst Count:", message.instructions.length)
    const meta = dataTx?.meta;
    const logMessages = meta?.logMessages;

    // console.log("Post balances:", meta?.postTokenBalances);

        if (logMessages.some(log => log === 'Program log: Create') && logMessages.every(log => log !== 'Program log: Instruction: Transfer' && log !== 'Program log: Instruction: TransferChecked' && log !== 'Program log: Instruction: CloseAccount' )) {

            const create_ata = {
                signature: signature,
                mint: meta?.postTokenBalances[0].mint,
                signer: meta?.postTokenBalances[0].owner,
                sol_balance: meta?.postBalances[0],
                wsol_balance: 0,
                token_balance: 0
            }

            return create_ata;

        }else{
            return null;
        }
}
