import { Simulator } from "./simulators/nft-bucket-identity-simulator";
import { describe, it, expect, beforeEach } from "vitest";
import { randomBytes } from "./utils/utils";
import * as utils from "./utils/utils";
import {
  CoinPublicKey,
  convert_bigint_to_Uint8Array
} from "@midnight-ntwrk/compact-runtime";

// Users private information
const adminMaster_privateKey = 0;
const minterAdmin_privateKey = 1;
const minter_privateKey = 2;
const matcherAdmin_privateKey = 3;
const matcher_privateKey = 4;
const settlerAdmin_privateKey = 5;
const settler_privateKey = 6;
const verifierAdmin_privateKey = 7;
const verifier_privateKey = 8;


// Callers
export const adminMaster = utils.toHexPadded("adminMaster");
export const minterAdmin = utils.toHexPadded("minterAdmin");
export const minter = utils.toHexPadded("minter");
export const matcherAdmin = utils.toHexPadded("matcherAdmin");
export const matcher = utils.toHexPadded("matcher");
export const settlerAdmin = utils.toHexPadded("settlerAdmin");
export const settler = utils.toHexPadded("settler");
export const verifierAdmin = utils.toHexPadded("verifierAdmin");
export const verifier = utils.toHexPadded("verifier");

// Encoded PK/Addresses Accounts
const Account_adminMaster = utils.createEitherTestUser("adminMaster");
const Account_adminMaster2 = utils.createEitherTestUser("adminMaster2");
const Account_minterAdmin = utils.createEitherTestUser("minterAdmin");
const Account_minter = utils.createEitherTestUser("minter");
const Account_matcherAdmin = utils.createEitherTestUser("matcherAdmin");
const Account_matcher = utils.createEitherTestUser("matcher");
const Account_settlerAdmin = utils.createEitherTestUser("settlerAdmin");
const Account_settler = utils.createEitherTestUser("settler");
const Account_verifierAdmin = utils.createEitherTestUser("verifierAdmin");
const Account_verifier = utils.createEitherTestUser("verifier");

// Roles
const adminMaster_ROLE = utils.zeroUint8Array();
const minterAdmin_ROLE = convert_bigint_to_Uint8Array(32, 1n);
const minter_ROLE = convert_bigint_to_Uint8Array(32, 2n);
const matcherAdmin_ROLE = convert_bigint_to_Uint8Array(32, 3n);
const matcher_ROLE = convert_bigint_to_Uint8Array(32, 4n);
const settlerAdmin_ROLE = convert_bigint_to_Uint8Array(32, 5n);
const settler_ROLE = convert_bigint_to_Uint8Array(32, 6n);
const verifierAdmin_ROLE = convert_bigint_to_Uint8Array(32, 7n);
const verifier_ROLE = convert_bigint_to_Uint8Array(32, 8n);

// Initialization
const name = "";
const symbol = "";

function createSimulator() {
  const simulator = Simulator.deployContract(
    adminMaster_privateKey,
    name,
    symbol
  );

  simulator.createPrivateState("adminMaster", adminMaster_privateKey);
  simulator.createPrivateState("minterAdmin", minterAdmin_privateKey);
  simulator.createPrivateState("minter", minter_privateKey);
  simulator.createPrivateState("matcherAdmin", matcherAdmin_privateKey);
  simulator.createPrivateState("matcher", matcher_privateKey);
  simulator.createPrivateState("settlerAdmin", settlerAdmin_privateKey);
  simulator.createPrivateState("settler", settler_privateKey);
  simulator.createPrivateState("verifierAdmin", verifierAdmin_privateKey);
  simulator.createPrivateState("verifier", verifier_privateKey);

  simulator
    .as("adminMaster")
    .grantRole(minterAdmin_ROLE, Account_minterAdmin, adminMaster);
  simulator
    .as("adminMaster")
    .grantRole(matcherAdmin_ROLE, Account_matcherAdmin, adminMaster);
  simulator
    .as("adminMaster")
    .grantRole(settlerAdmin_ROLE, Account_settlerAdmin, adminMaster);
  simulator
    .as("adminMaster")
    .grantRole(verifierAdmin_ROLE, Account_verifierAdmin, adminMaster);

  simulator
    .as("minterAdmin")
    .grantRole(minter_ROLE, Account_minter, minterAdmin);
  simulator
    .as("matcherAdmin")
    .grantRole(matcher_ROLE, Account_matcher, matcherAdmin);
  simulator
    .as("settlerAdmin")
    .grantRole(settler_ROLE, Account_settler, settlerAdmin);
  simulator
    .as("verifierAdmin")
    .grantRole(verifier_ROLE, Account_verifier, verifierAdmin);

  return simulator;
}

let simulator: Simulator;

describe("Smart contract Testing", () => {
  beforeEach(() => {
    simulator = createSimulator();
  });

  describe("Access Control module testing", () => {
    beforeEach(() => {});

    it("properly initializes ledger state and private state", () => {
      const initialLedgerState = simulator.as("adminMaster").getLedger();
      const initialPrivateState = simulator.as("adminMaster").getPrivateState();
      expect(initialPrivateState).toEqual({
        privateValue: adminMaster_privateKey
      });
    });

    it("Confirm the roles using assertOnlyRole", () => {
      simulator.as("adminMaster").assertOnlyRole(adminMaster_ROLE, adminMaster);
      simulator.as("minterAdmin").assertOnlyRole(adminMaster_ROLE, adminMaster);
      simulator.as("minter").assertOnlyRole(adminMaster_ROLE, adminMaster);
      simulator
        .as("matcherAdmin")
        .assertOnlyRole(adminMaster_ROLE, adminMaster);
      simulator.as("matcher").assertOnlyRole(adminMaster_ROLE, adminMaster);
      simulator
        .as("settlerAdmin")
        .assertOnlyRole(adminMaster_ROLE, adminMaster);
      simulator.as("settler").assertOnlyRole(adminMaster_ROLE, adminMaster);
    });

    it("Setting Roles Admins should fail if not AdminMaster", () => {
      expect(() => {
        simulator
          .as("minterAdmin")
          .setRoleAdmin(minter_ROLE, minterAdmin_ROLE, minterAdmin);
      }).toThrow();
      expect(() => {
        simulator
          .as("minter")
          .setRoleAdmin(minter_ROLE, minterAdmin_ROLE, minterAdmin);
      }).toThrow();
      expect(() => {
        simulator
          .as("matcherAdmin")
          .setRoleAdmin(matcher_ROLE, matcherAdmin_ROLE, matcherAdmin);
      }).toThrow();
      expect(() => {
        simulator
          .as("matcher")
          .setRoleAdmin(matcher_ROLE, matcherAdmin_ROLE, matcherAdmin);
      }).toThrow();
      expect(() => {
        simulator
          .as("settlerAdmin")
          .setRoleAdmin(settler_ROLE, settlerAdmin_ROLE, settlerAdmin);
      }).toThrow();
      expect(() => {
        simulator
          .as("settler")
          .setRoleAdmin(settler_ROLE, settlerAdmin_ROLE, settlerAdmin);
      }).toThrow();
    });

    it("Setting Roles should fail if not correct Admin", () => {
      expect(() => {
        simulator
          .as("minterAdmin")
          .grantRole(settler_ROLE, Account_settler, minterAdmin);
      }).toThrow();
      expect(() => {
        simulator
          .as("matcherAdmin")
          .grantRole(minter_ROLE, Account_minter, matcherAdmin);
      }).toThrow();
      expect(() => {
        simulator
          .as("settlerAdmin")
          .grantRole(matcher_ROLE, Account_matcher, settlerAdmin);
      }).toThrow();    
    });

    it("Creating a new Admin Master", () => {
      simulator
        .as("adminMaster")
        .grantRole(adminMaster_ROLE, Account_adminMaster2, adminMaster);
      expect(() => {
        simulator
          .as("minterAdmin")
          .grantRole(adminMaster_ROLE, Account_adminMaster2, minterAdmin);
      }).toThrow();
    });

    it("Pause Access Control", () => {
      simulator.as("adminMaster").pauseAccessControl(adminMaster);
      expect(() => {
        simulator
          .as("adminMaster")
          .setRoleAdmin(minter_ROLE, minterAdmin_ROLE, adminMaster);
      }).toThrow();
      simulator.as("adminMaster").unpauseAccessControl(adminMaster);
      expect(() => {
        simulator.as("adminMaster").unpauseAccessControl(adminMaster);
      }).toThrow();
      expect(() => {
        simulator.as("minterAdmin").pauseAccessControl(minterAdmin);
      }).toThrow();
    });
  });

  describe("Identity module testing", () => {
    beforeEach(() => {});

    it("Pause Indentity", () => {
      simulator.as("adminMaster").pauseIdentity(adminMaster);
      expect(() => {
        simulator
          .as("adminMaster")
          .setUser(Account_minter.left, adminMaster);
      }).toThrow();
      simulator.as("adminMaster").unpauseIdentity(adminMaster);
      expect(() => {
        simulator.as("adminMaster").unpauseIdentity(adminMaster);
      }).toThrow();
      expect(() => {
        simulator.as("minterAdmin").pauseIdentity(minterAdmin);
      }).toThrow();
    });
  });
});
