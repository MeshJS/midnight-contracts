// This is how we type an empty object.
export type PrivateState = {
  privateValue: number;
};

export const createPrivateState = (value: number): PrivateState => {
  return {
    privateValue: value,
  };
};

export const witnesses = {};
