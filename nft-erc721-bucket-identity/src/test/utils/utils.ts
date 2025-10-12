import type * as Compact from "../../managed/nft-bucket-identity/contract/index.cjs";
import { encodeTokenType } from "@midnight-ntwrk/compact-runtime";
import {nativeToken} from '@midnight-ntwrk/zswap';

import {
  convert_bigint_to_Uint8Array,
  encodeCoinPublicKey,
  encodeContractAddress
} from "@midnight-ntwrk/compact-runtime";

const PREFIX_ADDRESS = "0200";

/**
 * @description Create a Uint8Array with random values of an specific lenght
 * @param len Total desired length of the resulting Uint8Array
 * @returns Uint8Array with random values
 */
export const randomBytes = (length: number): Uint8Array => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
};

/**
 * @description Converts an ASCII string to its hexadecimal representation,
 * left-padded with zeros to a specified length. Useful for generating
 * fixed-size hex strings for encoding.
 * @param str ASCII string to convert.
 * @param len Total desired length of the resulting hex string. Defaults to 64.
 * @returns Hexadecimal string representation of `str`, padded to `length` characters.
 */
export const toHexPadded = (str: string, len = 64) =>
  Buffer.from(str, "ascii").toString("hex").padStart(len, "0");

/**
 * @description Generates ZswapCoinPublicKey from `str` for testing purposes.
 * @param str String to hexify and encode.
 * @returns Encoded `ZswapCoinPublicKey`.
 */
export const encodeToPK = (str: string): Compact.ZswapCoinPublicKey => ({
  bytes: encodeCoinPublicKey(toHexPadded(str))
});

/**
 * @description Generates ContractAddress from `str` for testing purposes.
 *              Prepends 32-byte hex with PREFIX_ADDRESS before encoding.
 * @param str String to hexify and encode.
 * @returns Encoded `ZswapCoinPublicKey`.
 */
export const encodeToAddress = (str: string): Compact.ContractAddress => ({
  bytes: encodeContractAddress(PREFIX_ADDRESS + toHexPadded(str))
});

/**
 * @description Generates an Either object for ZswapCoinPublicKey for testing.
 *              For use when an Either argument is expected.
 * @param str String to hexify and encode.
 * @returns Defined Either object for ZswapCoinPublicKey.
 */
export const createEitherTestUser = (str: string) => ({
  is_left: true,
  left: encodeToPK(str),
  right: encodeToAddress("")
});

/**
 * @description Generates an Either object for ContractAddress for testing.
 *              For use when an Either argument is expected.
 * @param str String to hexify and encode.
 * @returns Defined Either object for ContractAddress.
 */
export const createEitherTestContractAddress = (str: string) => ({
  is_left: false,
  left: encodeToPK(""),
  right: encodeToAddress(str)
});

/**
 * @description Generates an empty Uint8Array of a specific length.
 * @param str String to hexify and encode.
 * @returns Empty Uint8Array of a specific length.
 */
export const zeroUint8Array = (length = 32) =>
  convert_bigint_to_Uint8Array(length, 0n);


/**
 * @description Generates a CoinInfo object for testing purposes.
 * @param value Value of the coin.
 * @returns CoinInfo object.
 */
export const coin = (value: number): Compact.CoinInfo => {
  return {
    nonce: randomBytes(32),
    color: encodeTokenType(nativeToken()),
    value: BigInt(value),
  };
}

