import fetch from 'node-fetch';
import { RPC } from '../src/config/endpoints';

async function getWalletBalances() {
    const response = await fetch(RPC, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'getTokenAccountsByOwner',
            params: [
                'FmpEtzNF1Ubeum85gsVw16yocBxcgssazfHgPUMvVNJp',
                {
                    programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                },
                {
                    encoding: 'jsonParsed',
                },
            ],
            id: 4,
        }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return data;
}

getWalletBalances()
    .then((data) => console.log(data))
    .catch((error) => console.error('Error:', error));