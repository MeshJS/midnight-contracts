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
  Either
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
        { privateValue: privateState.privateValue },
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
    secretKey: number,
    name: string,
    symbol: string
  ): Simulator {
    return new Simulator(createPrivateState(secretKey), name, symbol);
  }

  createPrivateState(pName: string, secretKey: number): void {
    this.userPrivateStates[pName] = createPrivateState(secretKey);
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
}
