import { Ledger } from "./managed/nft-bucket-identity/contract/index.cjs";
import { WitnessContext } from "@midnight-ntwrk/compact-runtime";

// This is how we type an empty object.
export type PrivateState = {
  secretNonce: Uint8Array;
};

export const createPrivateState = (secretNonce: Uint8Array): PrivateState => {
  return {
    secretNonce
  };
};

export const witnesses = {
  wit_secretNonce: ({
    privateState,
  }: WitnessContext<Ledger, PrivateState>): [
    PrivateState,
    Uint8Array,
  ] => [privateState, privateState.secretNonce],
};
