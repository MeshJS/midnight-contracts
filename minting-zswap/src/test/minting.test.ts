import { MintingSimulator } from "./simulators/minting-simulator";
import { describe, it, expect } from "vitest";
import * as utils from "./utils/utils";
import { CoinPublicKey } from "@midnight-ntwrk/compact-runtime";

// Users private information
const key1 = 0;
const key2 = 1;

// Callers
export const p1 = utils.toHexPadded("player1");
export const p2 = utils.toHexPadded("player2");

function createSimulator() {
  const simulator = MintingSimulator.deployContract(key1);
  simulator.createPrivateState("p2", key2);
  return simulator;
}

let caller: CoinPublicKey;

describe("Minting smart contract", () => {
  it("properly initializes ledger state and private state", () => {
    const simulator = createSimulator();
    const initialLedgerState = simulator.as("p1").getLedger();
    expect(initialLedgerState.counter).toEqual(0n);
    const initialPrivateState = simulator.as("p1").getPrivateState();
    expect(initialPrivateState).toEqual({ privateMinting: key1 });
  });

  it("lets you mint", () => {
    const simulator = createSimulator();
    const initialPrivateState = simulator.as("p1").getPrivateState();

    simulator.as("p1").mint(utils.coin(100000000));
    // the private ledger state shouldn't change
    expect(initialPrivateState).toEqual(simulator.as("p1").getPrivateState());
    // And all the correct things should have been updated in the public ledger state
    const ledgerState = simulator.as("p1").getLedger();
    expect(ledgerState.counter).toEqual(1n);
  });

  it("lets you mint and burn", () => {
    const simulator = createSimulator();
    const initialPrivateState = simulator.as("p1").getPrivateState();
    simulator.as("p1").mint(utils.coin(100000000));
    simulator.as("p1").burn(100000000n);
    // the private ledger state shouldn't change
    expect(initialPrivateState).toEqual(simulator.as("p1").getPrivateState());
    // And all the correct things should have been updated in the public ledger state
    const ledgerState = simulator.as("p1").getLedger();
    expect(ledgerState.counter).toEqual(1n);
  });

  it("lets you mint and burn and mint again", () => {
    const simulator = createSimulator();
    const initialPrivateState = simulator.as("p1").getPrivateState();
    simulator.as("p1").mint(utils.coin(100000000));
    simulator.as("p1").burn(100000000n);
    simulator.as("p1").mint(utils.coin(100000000));
    // the private ledger state shouldn't change
    expect(initialPrivateState).toEqual(simulator.as("p1").getPrivateState());
    // And all the correct things should have been updated in the public ledger state
    const ledgerState = simulator.as("p1").getLedger();
    expect(ledgerState.counter).toEqual(2n);
  });

  it("lets you mint, burn and withdray with two users", () => {
    const simulator = createSimulator();
    const caller = p2;
    simulator.as("p1").mint(utils.coin(100000000));
    expect(() => simulator.as("p1").burn(100000000n, caller)).toThrow(
      "failed assert: Unauthorized"
    );
    simulator.as("p1").burn(90000000n);
    simulator.as("p1").owner_withdraw(10000000n);
    const ledgerState = simulator.as("p2").getLedger();
    expect(ledgerState.counter).toEqual(1n);
  });
});
