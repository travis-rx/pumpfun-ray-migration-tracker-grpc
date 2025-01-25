import axios from 'axios';

interface TokenInfo {

    name: string;
    symbol: string;
    usd_market_cap: number;
}

export async function getTokenInfo(mint) {

        try {
                const response = await fetch('https://mainnet.helius-rpc.com/?api-key=5a8212ed-1a70-42f4-941a-08bc3fc74eff', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "jsonrpc": "2.0",
                        "id": "text",
                        "method": "getAsset",
                        "params": { id: mint}
                    }),
                });
                const data = await response.json();

                return {

                    name: data.result.content.metadata.name,
                    symbol: data.result.content.metadata.symbol
                }
    

        } catch (error) {
            console.error('Error fetching coin data:', error.message);

        }
    
    return { name: 'Unknown', symbol: 'Unknown' };
}