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
  ledger
} from "../../managed/nft-bucket-identity/contract/index.cjs";
import { type PrivateState, createPrivateState, witnesses } from "../../witnesses.js";
import { createLogger } from "../../logger-utils.js";
import { LogicTestingConfig } from "../../config.js";
import { ContractAddress, encodeTokenType } from '@midnight-ntwrk/onchain-runtime';
import { p1 } from "../nft-bucket-identity.test.js";

const config = new LogicTestingConfig();
export const logger = await createLogger(config.logDir);

export class Simulator {
  readonly contract: Contract<PrivateState>;  
  circuitContext: CircuitContext<PrivateState>;
  userPrivateStates: Record<string, PrivateState>;
  updateUserPrivateState: (newPrivateState: PrivateState) => void;
  contractAddress: ContractAddress;

  constructor(privateState: PrivateState, name: string, symbol: string, init: boolean) {
    this.contract = new Contract<PrivateState>(witnesses);
    this.contractAddress = sampleContractAddress();
    const {
      currentPrivateState,
      currentContractState,
      currentZswapLocalState
    } = this.contract.initialState(
      constructorContext({ privateValue: privateState.privateValue }, p1),
      name,
      symbol,
      init,
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
    this.userPrivateStates = { ['p1']: currentPrivateState };
    this.updateUserPrivateState = (newPrivateState: PrivateState) => {};
  }

  static deployContract(secretKey: number, name: string, symbol: string, init: boolean): Simulator {
    return new Simulator(createPrivateState(secretKey), name, symbol, init);
  }

  createPrivateState(pName: string, secretKey: number): void {
    this.userPrivateStates[pName] = createPrivateState(secretKey);
  }

  private buildTurnContext(currentPrivateState: PrivateState): CircuitContext<PrivateState> {
    return {
      ...this.circuitContext,
      currentPrivateState,
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
      throw new Error(`No private state found for user '${name}'. Did you register it?`);
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

  updateStateAndGetLedger<T>(circuitResults: CircuitResults<PrivateState, T>): Ledger {
    this.circuitContext = circuitResults.context;     
    this.updateUserPrivateState(circuitResults.context.currentPrivateState);
    return this.getLedger();
  }   

  public name(message: string, sender?: CoinPublicKey): Ledger {
    // Update the current context to be the result of executing the circuit.
    const circuitResults = this.contract.impureCircuits.name(
      {
        ...this.circuitContext,
        currentZswapLocalState: sender
          ? emptyZswapLocalState(sender)
          : this.circuitContext.currentZswapLocalState,
      }
    );
    return this.updateStateAndGetLedger(circuitResults);
  }
}
