// This is how we type an empty object.
export type MintingPrivateState = {
  privateMinting: number;
};

export const createPrivateState = (value: number): MintingPrivateState => {
  return {
    privateMinting: value
  };
};

export const witnesses = {};
