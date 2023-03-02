export enum FetchStatus {
  IDLE = "idle",
  LOADING = "loading",
  SUCCEEDED = "succeeded",
  FAILED = "failed",
}

export interface FetchState {
  status: FetchStatus;
  error: object | null;
}

export const getStateFromStorage = (storageKey) => {
  const state = localStorage.getItem(storageKey);

  if (state) return JSON.parse(state);
  else return null;
};
