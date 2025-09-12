import { Simulator } from "./simulators/nft-bucket-identity-simulator";
import { describe, it, expect } from "vitest";
import { randomBytes } from "./utils/utils";
import * as utils from "./utils/utils";
import { CoinPublicKey } from "@midnight-ntwrk/compact-runtime";

// Users private information
const key1 = 0;
const key2 = 1;

// Callers
export const p1 = utils.toHexPadded("player1");
export const p2 = utils.toHexPadded("player2");

// Initialization
const name = "";
const symbol = "";
const init = true;

function createSimulator() {
  const simulator = Simulator.deployContract(key1, name, symbol, init);
  simulator.createPrivateState("p2", key2);
  return simulator;
}

let caller: CoinPublicKey;

describe("Smart contract", () => {
  it("properly initializes ledger state and private state", () => {
    const simulator = createSimulator();
    const initialLedgerState = simulator.as("p1").getLedger();
    // expect(initialLedgerState.instance).toEqual(1n);
    
    const initialPrivateState = simulator.as("p1").getPrivateState();
    expect(initialPrivateState).toEqual({ privateValue: key1 });
  });
});
