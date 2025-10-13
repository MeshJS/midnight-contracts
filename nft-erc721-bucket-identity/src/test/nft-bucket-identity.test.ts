import {
  NonFungibleToken_Certificate,
  NonFungibleToken_Source,
  NonFungibleToken_Impact,
  NonFungibleToken_Location,
  BucketDEFI_CONDITIONS,
  BucketDEFI_STATUS,
  CoinInfo,
  Simulator
} from "./simulators/nft-bucket-identity-simulator";
import { describe, it, expect, beforeEach } from "vitest";
import { randomBytes } from "./utils/utils";
import * as utils from "./utils/utils";
import {
  CoinPublicKey,
  convert_bigint_to_Uint8Array
} from "@midnight-ntwrk/compact-runtime";

// Users private information
const adminMaster_privateKey = randomBytes(32);
const minterAdmin_privateKey = randomBytes(32);
const minter_privateKey = randomBytes(32);
const matcherAdmin_privateKey = randomBytes(32);
const matcher_privateKey = randomBytes(32);
const settlerAdmin_privateKey = randomBytes(32);
const settler_privateKey = randomBytes(32);
const verifierAdmin_privateKey = randomBytes(32);
const verifier_privateKey = randomBytes(32);

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

// Token Metadata
const TOKENID_1: bigint = BigInt(1);
const TOKENID_2: bigint = BigInt(2);
const TOKENID_3: bigint = BigInt(3);
const NON_EXISTENT_TOKEN: bigint = BigInt(0xdead);

//Bucket conditions
const BUCKET1_CONDITIONS: BucketDEFI_CONDITIONS = {
  source: NonFungibleToken_Source.Biomass,
  unitPrice: 10n,
  vintageLimit: 20n,
  impact: NonFungibleToken_Impact.High,
  location: NonFungibleToken_Location.RJ,
  status: BucketDEFI_STATUS.OPEN,
  accumulatedPrice: 0n,
  pot: 100000000n,
  startDate: 0n,
  endDate: 0n
};

const BUCKET2_CONDITIONS: BucketDEFI_CONDITIONS = {
  source: NonFungibleToken_Source.Biomass,
  unitPrice: 10n,
  vintageLimit: 200n,
  impact: NonFungibleToken_Impact.High,
  location: NonFungibleToken_Location.RJ,
  status: BucketDEFI_STATUS.OPEN,
  accumulatedPrice: 0n,
  pot: 100000000n,
  startDate: 0n,
  endDate: 0n
};

// Certificates
const Certificate_1: NonFungibleToken_Certificate = {
  id: "Certificate_1",
  source: NonFungibleToken_Source.Biomass,
  generation: 10000000n,
  vintage: 20n,
  impact: NonFungibleToken_Impact.High,
  location: NonFungibleToken_Location.RJ
};

const Certificate_2: NonFungibleToken_Certificate = {
  id: "Certificate_1",
  source: NonFungibleToken_Source.Biomass,
  generation: 10n,
  vintage: 20n,
  impact: NonFungibleToken_Impact.High,
  location: NonFungibleToken_Location.RJ
};

// Coins
const coin1: CoinInfo = utils.coin(100000000);
const coin2: CoinInfo = utils.coin(100000000);

// Price
const Certificate_1_Price = 100000000n;
const Certificate_2_Price = 10n;

// Initialization
const name = "NAME";
const symbol = "SYMBOL";

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
      expect(initialLedgerState.NonFungibleToken__name).toEqual("NAME");
      expect(initialLedgerState.NonFungibleToken__symbol).toEqual("SYMBOL");
      const initialPrivateState = simulator.as("adminMaster").getPrivateState();
      expect(initialPrivateState).toEqual({
        secretNonce: adminMaster_privateKey
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

    it("Setting User should fail if not verifier", () => {
      expect(() => {
        simulator.as("minterAdmin").setUser(Account_minter.left, minterAdmin);
      }).toThrow();
      expect(() => {
        simulator.as("minter").setUser(Account_minter.left, minter);
      }).toThrow();
      expect(() => {
        simulator.as("matcher").setUser(Account_matcher.left, matcher);
      }).toThrow();
      expect(() => {
        simulator.as("settler").setUser(Account_settler.left, settler);
      }).toThrow();
      simulator.as("verifier").setUser(Account_minter.left, verifier);
    });

    it("Removing User should fail if not verifier", () => {
      expect(() => {
        simulator
          .as("minterAdmin")
          .removeUser(Account_minter.left, minterAdmin);
      }).toThrow();
      expect(() => {
        simulator.as("minter").removeUser(Account_minter.left, minter);
      }).toThrow();
      expect(() => {
        simulator.as("matcher").removeUser(Account_matcher.left, matcher);
      }).toThrow();
      expect(() => {
        simulator.as("settler").removeUser(Account_settler.left, settler);
      }).toThrow();
      simulator.as("verifier").removeUser(Account_minter.left, verifier);
    });

    it("Pause Indentity", () => {
      simulator.as("adminMaster").pauseIdentity(adminMaster);
      expect(() => {
        simulator.as("adminMaster").setUser(Account_minter.left, adminMaster);
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

  describe("Token module testing", () => {
    beforeEach(() => {});

    it("Minting a token and checking status", () => {
      simulator
        .as("minter")
        .mint(
          Account_minter,
          TOKENID_1,
          Certificate_1,
          Certificate_1_Price,
          minter
        );
      expect(() => {
        simulator
          .as("minterAdmin")
          .mint(
            Account_minter,
            TOKENID_1,
            Certificate_1,
            Certificate_1_Price,
            minterAdmin
          );
      }).toThrow();
      expect(() => {
        simulator
          .as("verifier")
          .mint(
            Account_minter,
            TOKENID_1,
            Certificate_1,
            Certificate_1_Price,
            verifier
          );
      }).toThrow();
      expect(() => {
        simulator
          .as("matcher")
          .mint(
            Account_minter,
            TOKENID_1,
            Certificate_1,
            Certificate_1_Price,
            matcher
          );
      }).toThrow();
      expect(() => {
        simulator
          .as("settler")
          .mint(
            Account_minter,
            TOKENID_1,
            Certificate_1,
            Certificate_1_Price,
            settler
          );
      }).toThrow();

      //checking status
      expect(simulator.as("minter").balanceOf(Account_minter)).toBe(1n);
      expect(() => {
        expect(simulator.as("minter").balanceOf(Account_minter)).toBe(2n);
      }).toThrow();
      expect(simulator.as("minter").ownerOf(TOKENID_1)).toStrictEqual(
        Account_minter
      );
      expect(simulator.as("minter").tokenCertificate(TOKENID_1)).toStrictEqual(
        Certificate_1
      );
      // expect(simulator.as("minter").tokenPrice(TOKENID_1)).toBe(11n);
      // expect(() => {
      //   expect(simulator.as("minter").tokenPrice(TOKENID_1)).toBe(10n);
      // }).toThrow();

      // Set a price
      simulator.as("minter").setTokenPrice(TOKENID_1, 20n, minter);
      expect(() => {
        simulator.as("settler").setTokenPrice(TOKENID_1, 20n, settler);
      }).toThrow();
    });

    it("Burning a token and checking status", () => {
      simulator
        .as("minter")
        .mint(
          Account_minter,
          TOKENID_1,
          Certificate_1,
          Certificate_1_Price,
          minter
        );
      expect(() =>
        simulator.as("settler").burn(NON_EXISTENT_TOKEN, settler)
      ).toThrow();
      expect(() => {
        simulator.as("settlerAdmin").burn(TOKENID_1, settlerAdmin);
      }).toThrow();
      expect(() => {
        simulator.as("minter").burn(TOKENID_1, minter);
      }).toThrow();
      expect(() => {
        simulator.as("matcher").burn(TOKENID_1, matcher);
      }).toThrow();
      expect(() => {
        simulator.as("verifier").burn(TOKENID_1, verifier);
      }).toThrow();
      simulator.as("settler").burn(TOKENID_1, settler);

      //checking status
      expect(simulator.as("minter").balanceOf(Account_minter)).toBe(0n);
      expect(() => {
        expect(simulator.as("minter").balanceOf(Account_minter)).toBe(1n);
      }).toThrow();
      expect(() => {
        expect(simulator.as("minter").ownerOf(TOKENID_1)).toStrictEqual(
          Account_minter
        );
      }).toThrow();
      expect(() => {
        expect(
          simulator.as("minter").tokenCertificate(TOKENID_1)
        ).toStrictEqual(Certificate_1);
      }).toThrow();
    });
  });

  describe("Bucket DEFI module testing", () => {
    beforeEach(() => {});

    it("properly initializes ledger state and private state", () => {
      const initialLedgerState = simulator.as("adminMaster").getLedger();
      expect(initialLedgerState.BucketDEFI__zkBucketCounter).toEqual(0n);
      const initialPrivateState = simulator.as("adminMaster").getPrivateState();
      expect(initialPrivateState).toEqual({
        secretNonce: adminMaster_privateKey
      });
    });

    it("Creating a Bucket and add certificate", () => {
      simulator.as("verifier").setUser(Account_minter.left, verifier);

      simulator
        .as("minter")
        .mint(
          Account_minter,
          TOKENID_1,
          Certificate_1,
          Certificate_1_Price,
          minter
        );
        simulator
        .as("minter")
        .mint(
          Account_minter,
          TOKENID_2,
          Certificate_2,
          Certificate_2_Price,
          minter
        );

      const ownerCommitment = simulator
        .as("minter")
        .createBucket(BUCKET1_CONDITIONS, coin1, minter);
      simulator
        .as("minter")
        .addCertificateToBucket(ownerCommitment, TOKENID_1, minter);      

      const ownerCommitment2 = simulator
        .as("minter")
        .createBucket(BUCKET2_CONDITIONS, coin2, minter);
      simulator
        .as("minter")
        .addCertificateToBucket(ownerCommitment2, TOKENID_2, minter);
    });

    it("Creating a Bucket, add certificate and settle", () => {
      simulator.as("verifier").setUser(Account_minter.left, verifier);

      simulator
        .as("minter")
        .mint(
          Account_minter,
          TOKENID_1,
          Certificate_1,
          Certificate_1_Price,
          minter
        );       

      const ownerCommitment = simulator
        .as("minter")
        .createBucket(BUCKET1_CONDITIONS, coin1, minter);
      simulator
        .as("minter")
        .addCertificateToBucket(ownerCommitment, TOKENID_1, minter); 
      
      simulator
        .as("minter")
        .settleBucket(ownerCommitment, minter);
    });

     it("Creating a Bucket, add certificate, settle and claim", () => {
      simulator.as("verifier").setUser(Account_minter.left, verifier);

      simulator
        .as("minter")
        .mint(
          Account_minter,
          TOKENID_1,
          Certificate_1,
          Certificate_1_Price,
          minter
        );       

      const ownerCommitment = simulator
        .as("minter")
        .createBucket(BUCKET1_CONDITIONS, coin1, minter);
      simulator
        .as("minter")
        .addCertificateToBucket(ownerCommitment, TOKENID_1, minter); 
      
      simulator
        .as("minter")
        .settleBucket(ownerCommitment, minter);
      
      simulator
        .as("minter")
        .claimCertificateReward(TOKENID_1, minter);      
    });

    it("Creating a Bucket, add certificate, settle, claim certificate and withdraw leftover", () => {
      simulator.as("verifier").setUser(Account_minter.left, verifier);

      simulator
        .as("minter")
        .mint(
          Account_minter,
          TOKENID_1,
          Certificate_1,
          Certificate_1_Price,
          minter
        );       

      const ownerCommitment = simulator
        .as("minter")
        .createBucket(BUCKET1_CONDITIONS, coin1, minter);
      simulator
        .as("minter")
        .addCertificateToBucket(ownerCommitment, TOKENID_1, minter); 
      
      simulator
        .as("minter")
        .settleBucket(ownerCommitment, minter);
      
      simulator
        .as("minter")
        .claimCertificateReward(TOKENID_1, minter);   
        
      simulator
        .as("minter")
        .withdrawBucketLeftover(ownerCommitment, minter);      
    });

     it("Creating a Bucket, add certificate, settle, claim certificate, withdraw leftover and proof bucket ownership", () => {
      simulator.as("verifier").setUser(Account_minter.left, verifier);

      simulator
        .as("minter")
        .mint(
          Account_minter,
          TOKENID_1,
          Certificate_1,
          Certificate_1_Price,
          minter
        );       

      const ownerCommitment = simulator
        .as("minter")
        .createBucket(BUCKET1_CONDITIONS, coin1, minter);
      simulator
        .as("minter")
        .addCertificateToBucket(ownerCommitment, TOKENID_1, minter); 
      
      simulator
        .as("minter")
        .settleBucket(ownerCommitment, minter);
      
      simulator
        .as("minter")
        .claimCertificateReward(TOKENID_1, minter);   
        
      simulator
        .as("minter")
        .withdrawBucketLeftover(ownerCommitment, minter); 
      
      const challenge = utils.randomBytes(32);
      simulator
        .as("minter")
        .proofBucketOwnership(ownerCommitment, challenge, minter);      
    });

     it("Pause and unpause BucketDEFI", () => {
      simulator.as("adminMaster").pauseBucketDEFI(adminMaster);
      expect(() => {
        simulator.as("minter").createBucket(BUCKET1_CONDITIONS, coin1, minter);
      }).toThrow();
      simulator.as("verifier").setUser(Account_minter.left, verifier);
      simulator.as("adminMaster").unpauseBucketDEFI(adminMaster);
      
      simulator
        .as("minter")
        .mint(
          Account_minter,
          TOKENID_1,
          Certificate_1,
          Certificate_1_Price,
          minter
        );       

      const ownerCommitment = simulator
        .as("minter")
        .createBucket(BUCKET1_CONDITIONS, coin1, minter);
      simulator
        .as("minter")
        .addCertificateToBucket(ownerCommitment, TOKENID_1, minter); 
      
      simulator
        .as("minter")
        .settleBucket(ownerCommitment, minter);
      
      simulator
        .as("minter")
        .claimCertificateReward(TOKENID_1, minter);   
        
      simulator
        .as("minter")
        .withdrawBucketLeftover(ownerCommitment, minter); 
      
      const challenge = utils.randomBytes(32);
      simulator
        .as("minter")
        .proofBucketOwnership(ownerCommitment, challenge, minter);      
    });
  });
});
