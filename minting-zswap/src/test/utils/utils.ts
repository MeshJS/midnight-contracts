import { encodeTokenType } from "@midnight-ntwrk/compact-runtime";
import {
  type CoinInfo,
} from "../../managed/minting-zswap/contract/index.cjs";
import {nativeToken} from '@midnight-ntwrk/zswap';

export const randomBytes = (length: number): Uint8Array => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
};

export const toHexPadded = (str: string, len = 64): string =>
  Buffer.from(str, "ascii").toString("hex").padStart(len, "0");

export const randomSk = (): Uint8Array => crypto.getRandomValues(Buffer.alloc(32));

export const coin = (value: number): CoinInfo => {
  return {
    nonce: randomSk(),
    color: encodeTokenType(nativeToken()),
    value: BigInt(value),
  };
}