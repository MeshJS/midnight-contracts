import { Simulator } from "./simulators/nft-bucket-identity-simulator";
import { describe, it, expect, beforeEach } from "vitest";
import { randomBytes } from "./utils/utils";
import * as utils from "./utils/utils";
import {
  CoinPublicKey,
  convert_bigint_to_Uint8Array
} from "@midnight-ntwrk/compact-runtime";

// Users private information
const adminMaster1_privateKey = 0;
const minterAdmin_privateKey = 1;
const minter_privateKey = 2;
const matcherAdmin_privateKey = 3;
const matcher_privateKey = 4;
const settlerAdmin_privateKey = 5;
const settler_privateKey = 6;

// Callers
export const adminMaster1 = utils.toHexPadded("adminMaster1");
export const minterAdmin = utils.toHexPadded("minterAdmin");
export const minter = utils.toHexPadded("minter");
export const matcherAdmin = utils.toHexPadded("matcherAdmin");
export const matcher = utils.toHexPadded("matcher");
export const settlerAdmin = utils.toHexPadded("settlerAdmin");
export const settler = utils.toHexPadded("settler");

// Encoded PK/Addresses Accounts
const Z_adminMaster1 = utils.createEitherTestUser("adminMaster1");
const Z_minterAdmin = utils.createEitherTestUser("minterAdmin");
const Z_minter = utils.createEitherTestUser("minter");
const Z_matcherAdmin = utils.createEitherTestUser("matcherAdmin");
const Z_matcher = utils.createEitherTestUser("matcher");
const Z_settlerAdmin = utils.createEitherTestUser("settlerAdmin");
const Z_settler = utils.createEitherTestUser("settler");

// Roles
const adminMaster1_ROLE = utils.zeroUint8Array();
const minterAdmin_ROLE = utils.createRole("minterAdmin");
const minter_ROLE = utils.createRole("minter");
const matcherAdmin_ROLE = utils.createRole("matcherAdmin");
const matcher_ROLE = utils.createRole("matcher");
const settlerAdmin_ROLE = utils.createRole("settlerAdmin");
const settler_ROLE = utils.createRole("settler");

// Initialization
const name = "";
const symbol = "";

function createSimulator() {
  const simulator = Simulator.deployContract(
    adminMaster1_privateKey,
    name,
    symbol
  );

  simulator.createPrivateState("adminMaster1", adminMaster1_privateKey);
  simulator.createPrivateState("minterAdmin", minterAdmin_privateKey);
  simulator.createPrivateState("minter", minter_privateKey);
  simulator.createPrivateState("matcherAdmin", matcherAdmin_privateKey);
  simulator.createPrivateState("matcher", matcher_privateKey);
  simulator.createPrivateState("settlerAdmin", settlerAdmin_privateKey);
  simulator.createPrivateState("settler", settler_privateKey);

  simulator.as("adminMaster1").setRoleAdmin(minter_ROLE, minterAdmin_ROLE, adminMaster1);
  simulator.as("adminMaster1").setRoleAdmin(matcher_ROLE, matcherAdmin_ROLE, adminMaster1);
  simulator.as("adminMaster1").setRoleAdmin(settler_ROLE, settlerAdmin_ROLE, adminMaster1);

  simulator.as("adminMaster1").grantRole(minterAdmin_ROLE, Z_minterAdmin, adminMaster1);
  simulator.as("adminMaster1").grantRole(matcherAdmin_ROLE, Z_matcherAdmin, adminMaster1);
  simulator.as("adminMaster1").grantRole(settlerAdmin_ROLE, Z_settlerAdmin, adminMaster1);

  simulator.as("minterAdmin").grantRole(minter_ROLE, Z_minter, minterAdmin);
  simulator.as("matcherAdmin").grantRole(matcher_ROLE, Z_matcher, matcherAdmin);
  simulator.as("settlerAdmin").grantRole(settler_ROLE, Z_settler, settlerAdmin);

  return simulator;
}

let simulator: Simulator;
let caller: CoinPublicKey;

describe("Smart contract Testing", () => {
  beforeEach(() => {
    simulator = createSimulator();
  });

  describe("Initial State", () => {
    beforeEach(() => {});

    it("properly initializes ledger state and private state", () => {
      const initialLedgerState = simulator.as("adminMaster1").getLedger();
      expect(initialLedgerState.counter).toEqual(0n);

      const initialPrivateState = simulator
        .as("adminMaster1")
        .getPrivateState();
      expect(initialPrivateState).toEqual({
        privateValue: adminMaster1_privateKey
      });
    });

    it("execute a circuit counter as Admin Master", () => {
      const initialLedgerState = simulator.as("adminMaster1").incrementCounter(adminMaster1_ROLE, adminMaster1);
      expect(initialLedgerState.counter).toEqual(1n);
    });

    it("execute a circuit counter as minter Admin", () => {    
      const initialLedgerState = simulator.as("minter").incrementCounter(minter_ROLE, minter);
      expect(initialLedgerState.counter).toEqual(1n); 
    });
  });
});
