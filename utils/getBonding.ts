import { Connection, PublicKey } from "@solana/web3.js";
import { RPC } from "../src/config/endpoints";

const connection = new Connection(RPC,'confirmed');

let lastChecked = 0;

export async function getBondingCurveAddress(bondingCurve){

  if(Date.now() - lastChecked < 50){
    return null;
  }

  try {

    let solBalance;
      const address = new PublicKey(bondingCurve)
      const systemOwner = await connection.getAccountInfo(address);
     solBalance = systemOwner.lamports;
     lastChecked = Date.now();
    return Number(solBalance/1000000000);

  }catch(e){
    console.log("Error in getBondingCurveAddress of:",new PublicKey(bondingCurve) );
    return null;
  }
}