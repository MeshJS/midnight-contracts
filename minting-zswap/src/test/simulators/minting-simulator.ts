import {
  type CircuitContext,
  type CoinPublicKey,
  CircuitResults,
  QueryContext,
  emptyZswapLocalState,
  sampleContractAddress,
  constructorContext,
} from "@midnight-ntwrk/compact-runtime";
import {
  Contract,
  type Ledger,
  type CoinInfo,
  ledger
} from "../../managed/minting-zswap/contract/index.cjs";
import {
  type MintingPrivateState,
  createPrivateState,
  witnesses
} from "../../witnesses.js";
import { createLogger } from "../../logger-utils.js";
import { LogicTestingConfig } from "../../config.js";
import { ContractAddress } from "@midnight-ntwrk/onchain-runtime";
import { p1 } from "../minting.test.js";
import { randomSk } from "../utils/utils.js";

const config = new LogicTestingConfig();
export const logger = await createLogger(config.logDir);

export class MintingSimulator {
  readonly contract: Contract<MintingPrivateState>;
  circuitContext: CircuitContext<MintingPrivateState>;
  userPrivateStates: Record<string, MintingPrivateState>;
  updateUserPrivateState: (newPrivateState: MintingPrivateState) => void;
  contractAddress: ContractAddress;

  constructor(privateState: MintingPrivateState) {
    this.contract = new Contract<MintingPrivateState>(witnesses);
    this.contractAddress = sampleContractAddress();
    const {
      currentPrivateState,
      currentContractState,
      currentZswapLocalState
    } = this.contract.initialState(
      constructorContext(privateState, p1),
      randomSk()
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
    this.userPrivateStates = { ["p1"]: currentPrivateState };
    this.updateUserPrivateState = (newPrivateState: MintingPrivateState) => {};
  }

  static deployContract(value: number): MintingSimulator {
    return new MintingSimulator(createPrivateState(value));
  }

  createPrivateState(pName: string, value: number): void {
    this.userPrivateStates[pName] = createPrivateState(value);
  }

  private buildTurnContext(
    currentPrivateState: MintingPrivateState
  ): CircuitContext<MintingPrivateState> {
    return {
      ...this.circuitContext,
      currentPrivateState
    };
  }

  private updateUserPrivateStateByName =
    (name: string) =>
    (newPrivateState: MintingPrivateState): void => {
      this.userPrivateStates[name] = newPrivateState;
    };

  as(name: string): MintingSimulator {
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

  public getPrivateState(): MintingPrivateState {
    return this.circuitContext.currentPrivateState;
  }

  updateStateAndGetLedger<T>(
    circuitResults: CircuitResults<MintingPrivateState, T>
  ): Ledger {
    this.circuitContext = circuitResults.context;
    this.updateUserPrivateState(circuitResults.context.currentPrivateState);
    return this.getLedger();
  }

  public mint(coin: CoinInfo, sender?: CoinPublicKey): Ledger {
    // Update the current context to be the result of executing the circuit.
    const circuitResults = this.contract.impureCircuits.mint(
      {
        ...this.circuitContext,
        currentZswapLocalState: sender
          ? emptyZswapLocalState(sender)
          : this.circuitContext.currentZswapLocalState
      },
      coin
    );
    return this.updateStateAndGetLedger(circuitResults);
  }

  public burn(value: bigint, sender?: CoinPublicKey): Ledger {
    const circuitResults = this.contract.impureCircuits.burn(
      {
        ...this.circuitContext,
        currentZswapLocalState: sender
          ? emptyZswapLocalState(sender)
          : this.circuitContext.currentZswapLocalState
      },
      value
    );
    return this.updateStateAndGetLedger(circuitResults);
  }

  public owner_withdraw(value: bigint, sender?: CoinPublicKey): Ledger {
    const circuitResults = this.contract.impureCircuits.owner_withdraw(
      {
        ...this.circuitContext,
        currentZswapLocalState: sender
          ? emptyZswapLocalState(sender)
          : this.circuitContext.currentZswapLocalState
      },
      value
    );
    return this.updateStateAndGetLedger(circuitResults);
  }
}
