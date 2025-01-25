import { decodeTransact } from "./decodeTransaction";

export function tOutPut(data){

    const dataTx = data?data?.transaction?.transaction:null;
    const signature = decodeTransact(dataTx?.signature);
    const message = dataTx?.transaction?.message;

    if(message.instructions.length !== 5 || message.instructions.length === 2){ return null; }

    const header = message?.header;
    const accountKeys = message?.accountKeys.map((t)=>{
        return decodeTransact(t);
    });
    const recentBlockhash = decodeTransact(message?.recentBlockhash);

    // console.log("Inst Count:", message.instructions.length)
    const meta = dataTx?.meta;
    const logMessages = meta?.logMessages;

    return {
        signature,
        Data: {
            header,
            accountKeys,
            logMessages,

        }
    };
}

export function transactionOutput(txn){
    const type = txn.instructions[0].name === "sell"?"SELL":"BUY";
    const events = txn.events[0]?.data? txn.events[0].data : null;
    if(!events) return null;
    const bondingCurve = txn.instructions[0].accounts[3].pubkey;
    const mint = events?.mint;
    const solAmount = events?.solAmount/1000000000
    const tokenAmount = events?.tokenAmount;
    const user = events?.user
    return{
        type,
        mint,
        solAmount,
        tokenAmount,
        user,
        bondingCurve
    }
}