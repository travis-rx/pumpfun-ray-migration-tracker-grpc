const dotenv = require("dotenv");
const idl = require("./pumpfun/idl.json");
const { TransactionInstruction, Keypair ,Connection, LAMPORTS_PER_SOL, PublicKey, SYSVAR_RENT_PUBKEY, SystemProgram, Transaction,clusterApiUrl } = require("@solana/web3.js");
const anchor = require("@coral-xyz/anchor");
const { Program } = require("@coral-xyz/anchor");
const { BN } = require("@coral-xyz/anchor");
const NodeWallet = require("@coral-xyz/anchor/dist/cjs/nodewallet").default;
const { parseSignatures } = require("../utils");
const RPC = process.env.Rpc;

process.removeAllListeners('warning');
dotenv.config();

const { programID } = require("./pumpfun/config");

async function getPumpPool(tokenAddress) {

    const private_key = "179,64,253,118,106,93,158,179,62,24,232,227,206,245,213,172,161,155,86,247,223,164,219,170,250,155,177,107,65,175,228,185,173,184,123,24,200,244,3,7,11,74,207,115,37,26,192,100,83,205,202,221,210,207,121,121,178,9,6,73,156,228,182,237"

    const privateKeyArray = private_key.split(',').map(Number);
    const decodedKey = new Uint8Array(privateKeyArray);
    const signerKeypair = Keypair.fromSecretKey(decodedKey);
    
    try {

    let neededInstruction = null;

while (neededInstruction === null) {

    try {
        const data = await RPC.getConfirmedSignaturesForAddress2(new PublicKey(tokenAddress), { limit: 5 });
        const confirmed_sigs = data.filter(e => !e.err).map(e => e.signature);
        const parsed_sigs = await parseSignatures(RPC, confirmed_sigs);

        for (var i = 0; i < parsed_sigs.length; i++) {
            const sig = parsed_sigs[i];

            if (!sig) {
                continue;
            }

            const instructions = sig.transaction.message.instructions;
            for (let ix of instructions) {
                try {
                    const hasNeededProgramId = (ix.programId.toBase58() === programID);
                    const hasNeededAccounts = ix.accounts.length === 12;

                    if (hasNeededProgramId && hasNeededAccounts) {
                        neededInstruction = ix;
                        break; // Exit the loop once a valid instruction is found
                    }
                } catch (e) {
                    continue;
                }
            }

            if (neededInstruction) {
                break; 
            }
        }


    } catch (e) {
        console.error('Error fetching signatures:', e);
    }
}

        const program = new Program(idl, programID, new anchor.AnchorProvider(RPC, new NodeWallet(signerKeypair), anchor.AnchorProvider.defaultOptions()));

        const accounts = neededInstruction.accounts;
        
        const bondingCurve = accounts[3];
        const mint = accounts[2];

        const bondingAddress = bondingCurve.toBase58();

        const bondingCurveData = await program.account.bondingCurve.fetch(bondingCurve);

        const mintData = await RPC.getParsedAccountInfo(mint);

        const decimals = mintData.value.data.parsed.info.decimals;

        const virtualTokenReserves = bondingCurveData.virtualTokenReserves.toNumber();
        const virtualSolReserves = bondingCurveData.virtualSolReserves.toNumber();
    
        const adjustedVirtualTokenReserves = virtualTokenReserves / (10**decimals);
        const adjustedVirtualSolReserves = virtualSolReserves / LAMPORTS_PER_SOL;
    
        const virtualTokenPrice = adjustedVirtualSolReserves / adjustedVirtualTokenReserves;

        return virtualTokenPrice


    } catch (e) {
        console.log(e);
        console.log('an error has occurred');
    }
}


module.exports = { getPumpPool };