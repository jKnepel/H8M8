import {AppState} from "../../store";
import {createSelector} from "@reduxjs/toolkit";
import {FetchStatus} from "../../helpers";

export const selectIsHydrated = (state: AppState) => state.auth.hydrated;
export const selectIsHydrating = (state: AppState) => state.auth.isHydrating;
export const selectUsername = (state: AppState) => state.auth.username;
export const selectGroups = (state: AppState) => state.auth.groups;
export const selectError = (state: AppState) => state.auth.error;
export const selectIsLoading = (state: AppState) => state.auth.status === FetchStatus.LOADING;

/*
 * This may be somewhat inaccurate, but is sufficient.
 * If we hydrated and have a username (from sign in or hydrate)
 * we can be sure that the user is authenticated.
 */
export const selectIsSignedIn = createSelector([
  selectIsHydrated,
  selectUsername
],
(isHydrated, username) => isHydrated && username);

export const selectIsSignedOut = createSelector([
  selectIsHydrated,
  selectUsername
],
(isHydrated, username) => isHydrated && !username);
