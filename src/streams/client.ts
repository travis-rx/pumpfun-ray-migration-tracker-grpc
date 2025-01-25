import Client from "@triton-one/yellowstone-grpc";
import { gRPC } from "../config/endpoints";

console.log(gRPC);
export const client = new Client(
    gRPC,
    'gRPC TOKEN',
    undefined,
);