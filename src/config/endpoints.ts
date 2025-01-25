require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

export const RPC = process.env.RPC;
export const WS = process.env.WS;
export const gRPC = process.env.gRPC;