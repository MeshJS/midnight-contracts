import {
  type CircuitContext,
  type CoinPublicKey,
  CircuitResults,
  QueryContext,
  emptyZswapLocalState,
  sampleContractAddress,
  constructorContext,
  convert_bigint_to_Uint8Array
} from "@midnight-ntwrk/compact-runtime";
import {
  Contract,
  type Ledger,
  ledger,
  ContractAddress as ContractAddress_,
  ZswapCoinPublicKey as ZswapCoinPublicKey_,
  Either,
  CoinInfo,
  type NonFungibleToken_Certificate,
  NonFungibleToken_Source,
  NonFungibleToken_Impact,
  NonFungibleToken_Location,
  BucketDEFI_CONDITIONS,
  BucketDEFI_STATUS
} from "../../managed/nft-bucket-identity/contract/index.cjs";
import {
  type PrivateState,
  createPrivateState,
  witnesses
} from "../../witnesses.js";
import { createLogger } from "../../logger-utils.js";
import { LogicTestingConfig } from "../../config.js";
import {
  ContractAddress,
  encodeTokenType
} from "@midnight-ntwrk/onchain-runtime";
import { adminMaster } from "../nft-bucket-identity.test.js";

export {
  type NonFungibleToken_Certificate,
  NonFungibleToken_Source,
  NonFungibleToken_Impact,
  NonFungibleToken_Location,
  type BucketDEFI_CONDITIONS,
  BucketDEFI_STATUS,
  type CoinInfo
};

const config = new LogicTestingConfig();
export const logger = await createLogger(config.logDir);

export class Simulator {
  readonly contract: Contract<PrivateState>;
  circuitContext: CircuitContext<PrivateState>;
  userPrivateStates: Record<string, PrivateState>;
  updateUserPrivateState: (newPrivateState: PrivateState) => void;
  contractAddress: ContractAddress;

  constructor(privateState: PrivateState, name: string, symbol: string) {
    this.contract = new Contract<PrivateState>(witnesses);
    this.contractAddress = sampleContractAddress();
    const {
      currentPrivateState,
      currentContractState,
      currentZswapLocalState
    } = this.contract.initialState(
      constructorContext(
        { secretNonce: privateState.secretNonce },
        adminMaster
      ),
      name,
      symbol
    );
    this.circuitContext = {
      currentPrivateState,
      currentZswapLocalState,
      originalState: currentContractState,
      transactionContext: new QueryContext(
        currentContractState.data,
        this.contractAddress
      )
    };
    this.userPrivateStates = { ["adminMaster"]: currentPrivateState };
    this.updateUserPrivateState = (newPrivateState: PrivateState) => {};
  }

  static deployContract(
    secretNonce: Uint8Array,
    name: string,
    symbol: string
  ): Simulator {
    return new Simulator(createPrivateState(secretNonce), name, symbol);
  }

  createPrivateState(pName: string, secretNonce: Uint8Array): void {
    this.userPrivateStates[pName] = createPrivateState(secretNonce);
  }

  private buildTurnContext(
    currentPrivateState: PrivateState
  ): CircuitContext<PrivateState> {
    return {
      ...this.circuitContext,
      currentPrivateState
    };
  }

  private updateUserPrivateStateByName =
    (name: string) =>
    (newPrivateState: PrivateState): void => {
      this.userPrivateStates[name] = newPrivateState;
    };

  as(name: string): Simulator {
    const ps = this.userPrivateStates[name];
    if (!ps) {
      throw new Error(
        `No private state found for user '${name}'. Did you register it?`
      );
    }
    this.circuitContext = this.buildTurnContext(ps);
    this.updateUserPrivateState = this.updateUserPrivateStateByName(name);
    return this;
  }

  public getLedger(): Ledger {
    return ledger(this.circuitContext.transactionContext.state);
  }

  public getPrivateState(): PrivateState {
    return this.circuitContext.currentPrivateState;
  }

  updateStateAndGetLedger<T>(
    circuitResults: CircuitResults<PrivateState, T>
  ): Ledger {
    logger.info("");
    logger.info("");
    logger.info("");
    logger.info("");
    logger.info("");
    logger.info("");
    logger.info("");
    logger.info("");
    logger.info("");
    logger.info({
      section: "Circuit Context",
      currentPrivateState: circuitResults.context.currentPrivateState,
      currentZswapLocalState: circuitResults.context.currentZswapLocalState,
      originalState: circuitResults.context.originalState,
      transactionContext_address:
        circuitResults.context.transactionContext.address,
      transactionContext_block: circuitResults.context.transactionContext.block,
      transactionContext_comIndicies:
        circuitResults.context.transactionContext.comIndicies,
      transactionContext_effects:
        circuitResults.context.transactionContext.effects,
      transactionContext_state: circuitResults.context.transactionContext.state
    });
    logger.info({
      section: "Circuit Proof Data",
      input: circuitResults.proofData.input,
      output: circuitResults.proofData.output,
      privateTranscriptOutputs:
        circuitResults.proofData.privateTranscriptOutputs,
      publicTranscript: circuitResults.proofData.publicTranscript
    });
    logger.info({
      section: "Circuit result",
      result: circuitResults.result
    });

    this.circuitContext = circuitResults.context;
    this.updateUserPrivateState(circuitResults.context.currentPrivateState);
    return this.getLedger();
  }

  public assertOnlyRole(roleId: Uint8Array, caller?: CoinPublicKey): Ledger {
    // Update the current context to be the result of executing the circuit.
    const circuitResults = this.contract.impureCircuits.assertOnlyRole(
      {
        ...this.circuitContext,
        currentZswapLocalState: caller
          ? emptyZswapLocalState(caller)
          : this.circuitContext.currentZswapLocalState
      },
      roleId
    );
    return this.updateStateAndGetLedger(circuitResults);
  }

  public grantRole(
    roleId: Uint8Array,
    account: Either<ZswapCoinPublicKey_, ContractAddress_>,
    caller?: CoinPublicKey
  ): Ledger {
    // Update the current context to be the result of executing the circuit.
    const circuitResults = this.contract.impureCircuits.grantRole(
      {
        ...this.circuitContext,
        currentZswapLocalState: caller
          ? emptyZswapLocalState(caller)
          : this.circuitContext.currentZswapLocalState
      },
      roleId,
      account
    );
    return this.updateStateAndGetLedger(circuitResults);
  }

  public setRoleAdmin(
    roleId: Uint8Array,
    adminRole: Uint8Array,
    caller?: CoinPublicKey
  ): Ledger {
    // Update the current context to be the result of executing the circuit.
    const circuitResults = this.contract.impureCircuits.setRoleAdmin(
      {
        ...this.circuitContext,
        currentZswapLocalState: caller
          ? emptyZswapLocalState(caller)
          : this.circuitContext.currentZswapLocalState
      },
      roleId,
      adminRole
    );
    return this.updateStateAndGetLedger(circuitResults);
  }

  public pauseAccessControl(caller?: CoinPublicKey): Ledger {
    // Update the current context to be the result of executing the circuit.
    const circuitResults = this.contract.impureCircuits.pauseAccessControl({
      ...this.circuitContext,
      currentZswapLocalState: caller
        ? emptyZswapLocalState(caller)
        : this.circuitContext.currentZswapLocalState
    });
    return this.updateStateAndGetLedger(circuitResults);
  }

  public unpauseAccessControl(caller?: CoinPublicKey): Ledger {
    // Update the current context to be the result of executing the circuit.
    const circuitResults = this.contract.impureCircuits.unpauseAccessControl({
      ...this.circuitContext,
      currentZswapLocalState: caller
        ? emptyZswapLocalState(caller)
        : this.circuitContext.currentZswapLocalState
    });
    return this.updateStateAndGetLedger(circuitResults);
  }

  public assertOwnVerification(caller?: CoinPublicKey): Ledger {
    // Update the current context to be the result of executing the circuit.
    const circuitResults = this.contract.impureCircuits.assertOwnVerification({
      ...this.circuitContext,
      currentZswapLocalState: caller
        ? emptyZswapLocalState(caller)
        : this.circuitContext.currentZswapLocalState
    });
    return this.updateStateAndGetLedger(circuitResults);
  }

  public setUser(user: ZswapCoinPublicKey_, caller?: CoinPublicKey): Ledger {
    // Update the current context to be the result of executing the circuit.
    const circuitResults = this.contract.impureCircuits.setUser(
      {
        ...this.circuitContext,
        currentZswapLocalState: caller
          ? emptyZswapLocalState(caller)
          : this.circuitContext.currentZswapLocalState
      },
      user
    );
    return this.updateStateAndGetLedger(circuitResults);
  }

  public removeUser(user: ZswapCoinPublicKey_, caller?: CoinPublicKey): Ledger {
    // Update the current context to be the result of executing the circuit.
    const circuitResults = this.contract.impureCircuits.removeUser(
      {
        ...this.circuitContext,
        currentZswapLocalState: caller
          ? emptyZswapLocalState(caller)
          : this.circuitContext.currentZswapLocalState
      },
      user
    );
    return this.updateStateAndGetLedger(circuitResults);
  }

  public pauseIdentity(caller?: CoinPublicKey): Ledger {
    // Update the current context to be the result of executing the circuit.
    const circuitResults = this.contract.impureCircuits.pauseIdentity({
      ...this.circuitContext,
      currentZswapLocalState: caller
        ? emptyZswapLocalState(caller)
        : this.circuitContext.currentZswapLocalState
    });
    return this.updateStateAndGetLedger(circuitResults);
  }

  public unpauseIdentity(caller?: CoinPublicKey): Ledger {
    // Update the current context to be the result of executing the circuit.
    const circuitResults = this.contract.impureCircuits.unpauseIdentity({
      ...this.circuitContext,
      currentZswapLocalState: caller
        ? emptyZswapLocalState(caller)
        : this.circuitContext.currentZswapLocalState
    });
    return this.updateStateAndGetLedger(circuitResults);
  }

  public mint(
    to: Either<ZswapCoinPublicKey_, ContractAddress_>,
    tokenId: bigint,
    tokenCertificate: NonFungibleToken_Certificate,
    price: bigint,
    caller?: CoinPublicKey
  ): Ledger {
    // Update the current context to be the result of executing the circuit.
    const circuitResults = this.contract.impureCircuits.mint(
      {
        ...this.circuitContext,
        currentZswapLocalState: caller
          ? emptyZswapLocalState(caller)
          : this.circuitContext.currentZswapLocalState
      },
      to,
      tokenId,
      tokenCertificate,
      price
    );
    return this.updateStateAndGetLedger(circuitResults);
  }

  public setTokenPrice(
    tokenId: bigint,
    price: bigint,
    caller?: CoinPublicKey
  ): Ledger {
    // Update the current context to be the result of executing the circuit.
    const circuitResults = this.contract.impureCircuits.setTokenPrice(
      {
        ...this.circuitContext,
        currentZswapLocalState: caller
          ? emptyZswapLocalState(caller)
          : this.circuitContext.currentZswapLocalState
      },
      tokenId,
      price
    );
    return this.updateStateAndGetLedger(circuitResults);
  }

  public burn(tokenId: bigint, caller?: CoinPublicKey): Ledger {
    // Update the current context to be the result of executing the circuit.
    const circuitResults = this.contract.impureCircuits.burn(
      {
        ...this.circuitContext,
        currentZswapLocalState: caller
          ? emptyZswapLocalState(caller)
          : this.circuitContext.currentZswapLocalState
      },
      tokenId
    );
    return this.updateStateAndGetLedger(circuitResults);
  }

  public balanceOf(
    owner: Either<ZswapCoinPublicKey_, ContractAddress_>,
    caller?: CoinPublicKey
  ): bigint {
    // Update the current context to be the result of executing the circuit.
    const circuitResults = this.contract.impureCircuits.balanceOf(
      {
        ...this.circuitContext,
        currentZswapLocalState: caller
          ? emptyZswapLocalState(caller)
          : this.circuitContext.currentZswapLocalState
      },
      owner
    );
    return circuitResults.result;
  }

  public ownerOf(
    tokenId: bigint,
    caller?: CoinPublicKey
  ): Either<ZswapCoinPublicKey_, ContractAddress_> {
    // Update the current context to be the result of executing the circuit.
    const circuitResults = this.contract.impureCircuits.ownerOf(
      {
        ...this.circuitContext,
        currentZswapLocalState: caller
          ? emptyZswapLocalState(caller)
          : this.circuitContext.currentZswapLocalState
      },
      tokenId
    );
    return circuitResults.result;
  }

  public tokenCertificate(
    tokenId: bigint,
    caller?: CoinPublicKey
  ): NonFungibleToken_Certificate {
    // Update the current context to be the result of executing the circuit.
    const circuitResults = this.contract.impureCircuits.tokenCertificate(
      {
        ...this.circuitContext,
        currentZswapLocalState: caller
          ? emptyZswapLocalState(caller)
          : this.circuitContext.currentZswapLocalState
      },
      tokenId
    );
    return circuitResults.result;
  }

  public tokenPrice(tokenId: bigint, caller?: CoinPublicKey): bigint {
    // Update the current context to be the result of executing the circuit.
    const circuitResults = this.contract.impureCircuits.tokenPrice(
      {
        ...this.circuitContext,
        currentZswapLocalState: caller
          ? emptyZswapLocalState(caller)
          : this.circuitContext.currentZswapLocalState
      },
      tokenId
    );
    return circuitResults.result;
  }

  public createBucket(
    conditions: BucketDEFI_CONDITIONS,
    coin: CoinInfo,
    caller?: CoinPublicKey
  ): Uint8Array {
    // Update the current context to be the result of executing the circuit.
    const circuitResults = this.contract.impureCircuits.createBucket(
      {
        ...this.circuitContext,
        currentZswapLocalState: caller
          ? emptyZswapLocalState(caller)
          : this.circuitContext.currentZswapLocalState
      },
      conditions,
      coin
    );
    this.updateStateAndGetLedger(circuitResults);
    return circuitResults.result;
  }

  public addCertificateToBucket(
    ownerCommitment: Uint8Array,
    tokenId: bigint,
    caller?: CoinPublicKey
  ): Ledger {
    // Update the current context to be the result of executing the circuit.
    const circuitResults = this.contract.impureCircuits.addCertificateToBucket(
      {
        ...this.circuitContext,
        currentZswapLocalState: caller
          ? emptyZswapLocalState(caller)
          : this.circuitContext.currentZswapLocalState
      },
      ownerCommitment,
      tokenId
    );
    return this.updateStateAndGetLedger(circuitResults);
  }

  public settleBucket(
    ownerCommitment: Uint8Array,
    caller?: CoinPublicKey
  ): Ledger {
    // Update the current context to be the result of executing the circuit.
    const circuitResults = this.contract.impureCircuits.settleBucket(
      {
        ...this.circuitContext,
        currentZswapLocalState: caller
          ? emptyZswapLocalState(caller)
          : this.circuitContext.currentZswapLocalState
      },
      ownerCommitment
    );
    return this.updateStateAndGetLedger(circuitResults);
  }

  public claimCertificateReward(
    tokenId: bigint,
    caller?: CoinPublicKey
  ): Ledger {
    // Update the current context to be the result of executing the circuit.
    const circuitResults = this.contract.impureCircuits.claimCertificateReward(
      {
        ...this.circuitContext,
        currentZswapLocalState: caller
          ? emptyZswapLocalState(caller)
          : this.circuitContext.currentZswapLocalState
      },
      tokenId
    );
    return this.updateStateAndGetLedger(circuitResults);
  }

  public withdrawBucketLeftover(
    ownerCommitment: Uint8Array,
    caller?: CoinPublicKey
  ): Ledger {
    // Update the current context to be the result of executing the circuit.
    const circuitResults = this.contract.impureCircuits.withdrawBucketLeftover(
      {
        ...this.circuitContext,
        currentZswapLocalState: caller
          ? emptyZswapLocalState(caller)
          : this.circuitContext.currentZswapLocalState
      },
      ownerCommitment
    );
    return this.updateStateAndGetLedger(circuitResults);
  }

  public proofBucketOwnership(
    ownerCommitment: Uint8Array,
    challenge: Uint8Array,
    caller?: CoinPublicKey
  ): Ledger {
    // Update the current context to be the result of executing the circuit.
    const circuitResults = this.contract.impureCircuits.proofBucketOwnership(
      {
        ...this.circuitContext,
        currentZswapLocalState: caller
          ? emptyZswapLocalState(caller)
          : this.circuitContext.currentZswapLocalState
      },
      ownerCommitment,
      challenge
    );
    return this.updateStateAndGetLedger(circuitResults);
  }

  public pauseBucketDEFI(caller?: CoinPublicKey): Ledger {
    // Update the current context to be the result of executing the circuit.
    const circuitResults = this.contract.impureCircuits.pauseBucketDEFI({
      ...this.circuitContext,
      currentZswapLocalState: caller
        ? emptyZswapLocalState(caller)
        : this.circuitContext.currentZswapLocalState
    });
    return this.updateStateAndGetLedger(circuitResults);
  }

  public unpauseBucketDEFI(caller?: CoinPublicKey): Ledger {
    // Update the current context to be the result of executing the circuit.
    const circuitResults = this.contract.impureCircuits.unpauseBucketDEFI({
      ...this.circuitContext,
      currentZswapLocalState: caller
        ? emptyZswapLocalState(caller)
        : this.circuitContext.currentZswapLocalState
    });
    return this.updateStateAndGetLedger(circuitResults);
  }
}
