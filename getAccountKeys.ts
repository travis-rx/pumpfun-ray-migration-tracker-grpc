import { Connection, PublicKey } from '@solana/web3.js';
import { RPC } from './src/config/endpoints';

async function getAccountKeys(signature: string) {
    const connection = new Connection(RPC, { commitment: 'confirmed'});
    const transaction = await connection.getTransaction(signature, {maxSupportedTransactionVersion:0});

    transaction.meta.innerInstructions.forEach(innerInstruction => {
        innerInstruction.instructions.forEach(instruction => {
            const programId = transaction.transaction.message.staticAccountKeys[instruction.programIdIndex].toBase58();
            const accountKeys = instruction.accounts
                .map(index => transaction.transaction.message.staticAccountKeys[index])
                .filter(key => key !== undefined)
                .map(key => key.toBase58());
            const data = instruction.data ? Buffer.from(instruction.data).toString('base64') : '';

            console.log('Program ID:', programId);
            console.log('Account Keys:', accountKeys);
            console.log('Data:', data);
        });
    });
    console.log("Po BAL",transaction.meta.postTokenBalances);

    if (!transaction) {
        throw new Error('Transaction not found');
    }

    if (transaction.meta && transaction) {

    const compiledInstructions = transaction.transaction.message.compiledInstructions.map(instruction => {
        
        const programId = transaction.transaction.message.staticAccountKeys[instruction.programIdIndex].toBase58()
        const accountKeys = instruction.accountKeyIndexes
            .map(index => transaction.transaction.message.staticAccountKeys[index])
            .filter(key => key !== undefined)
            .map(key => key.toBase58());
        const data = instruction.data ? instruction.data.toString() : '';

        console.log(data);

        // console.log('Program ID:', programId);
        // console.log('Account Keys:', accountKeys);
        // console.log('Data:', data);
        
    });
    } else {
        console.log('No inner instructions found');
    }

    const accountKeys = transaction.transaction.message.staticAccountKeys.map((key: PublicKey) => key.toBase58());

    console.log(accountKeys);}

// Example usage
const signature = '3qYWoqi2S87BXeYzNUUsgqCChVomwh1AfYXzesJgmAj2E6NTka81ttzQD4fUCu43hR7T8syvBLKEcuSQpuzXB9dm';
getAccountKeys(signature)
    .then(accountKeys => console.log(accountKeys))
    .catch(error => console.error(error));