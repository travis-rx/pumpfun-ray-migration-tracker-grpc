const { PublicKey } = require('@solana/web3.js');

const {
  ASSOCIATED_TOKEN_PROGRAM_ID,
} = require("@solana/spl-token");

const PUMP_FUN_PROGRAM = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P");
const PUMP_FUN_ACCOUNT = new PublicKey("Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1")

async function getBondingCurve(mint){

    try{
        const mint_account =  new PublicKey(mint).toBytes()
  
        const [bondingCurve] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("bonding-curve"),  
            mint_account
          ],  PUMP_FUN_PROGRAM);
        
        const [associatedBondingCurve] = PublicKey.findProgramAddressSync(
          [
            bondingCurve.toBuffer(), 
            PUMP_FUN_ACCOUNT.toBuffer(),
            mint_account, 
          ], 
          ASSOCIATED_TOKEN_PROGRAM_ID);
    
          const bondingAddress = bondingCurve.toBase58()
        
          return bondingAddress
    }catch(error){
        console.log(error);
    }


}

module.exports = getBondingCurve