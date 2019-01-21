/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Breakpoints reducer
 * @module reducers/breakpoints
 */

import { isGeneratedId } from "devtools-source-map";
import { isEqual } from "lodash";

import { makeLocationId } from "../utils/breakpoint";

import type { XHRBreakpoint, Breakpoint, SourceLocation } from "../types";
import type { Action, DonePromiseAction } from "../actions/types";

export type BreakpointsMap = { [string]: Breakpoint };
export type XHRBreakpointsList = $ReadOnlyArray<XHRBreakpoint>;

export type BreakpointsState = {
  breakpoints: BreakpointsMap,
  xhrBreakpoints: XHRBreakpointsList
};

export function initialBreakpointsState(
  xhrBreakpoints?: XHRBreakpointsList = []
): BreakpointsState {
  return {
    breakpoints: {},
    xhrBreakpoints: xhrBreakpoints,
    breakpointsDisabled: false
  };
}

function update(
  state: BreakpointsState = initialBreakpointsState(),
  action: Action
): BreakpointsState {
  switch (action.type) {
    case "ADD_BREAKPOINT": {
      return addBreakpoint(state, action);
    }

    case "SYNC_BREAKPOINT": {
      return syncBreakpoint(state, action);
    }

    case "ENABLE_BREAKPOINT": {
      return addBreakpoint(state, action);
    }

    case "DISABLE_BREAKPOINT": {
      return updateBreakpoint(state, action);
    }

    case "DISABLE_ALL_BREAKPOINTS": {
      return updateAllBreakpoints(state, action);
    }

    case "ENABLE_ALL_BREAKPOINTS": {
      return updateAllBreakpoints(state, action);
    }

    case "SET_BREAKPOINT_CONDITION": {
      return updateBreakpoint(state, action);
    }

    case "REMOVE_BREAKPOINT": {
      return removeBreakpoint(state, action);
    }

    case "REMAP_BREAKPOINTS": {
      return remapBreakpoints(state, action);
    }

    case "NAVIGATE": {
      return initialBreakpointsState(state.xhrBreakpoints);
    }

    case "SET_XHR_BREAKPOINT": {
      return addXHRBreakpoint(state, action);
    }

    case "REMOVE_XHR_BREAKPOINT": {
      return removeXHRBreakpoint(state, action);
    }

    case "UPDATE_XHR_BREAKPOINT": {
      return updateXHRBreakpoint(state, action);
    }

    case "ENABLE_XHR_BREAKPOINT": {
      return updateXHRBreakpoint(state, action);
    }

    case "DISABLE_XHR_BREAKPOINT": {
      return updateXHRBreakpoint(state, action);
    }
  }

  return state;
}

function addXHRBreakpoint(state, action) {
  const { xhrBreakpoints } = state;
  const { breakpoint } = action;
  const { path, method } = breakpoint;

  const existingBreakpointIndex = state.xhrBreakpoints.findIndex(
    bp => bp.path === path && bp.method === method
  );

  if (existingBreakpointIndex === -1) {
    return {
      ...state,
      xhrBreakpoints: [...xhrBreakpoints, breakpoint]
    };
  } else if (xhrBreakpoints[existingBreakpointIndex] !== breakpoint) {
    const newXhrBreakpoints = [...xhrBreakpoints];
    newXhrBreakpoints[existingBreakpointIndex] = breakpoint;
    return {
      ...state,
      xhrBreakpoints: newXhrBreakpoints
    };
  }

  return state;
}

function removeXHRBreakpoint(state, action) {
  const { breakpoint } = action;
  const { xhrBreakpoints } = state;

  if (action.status === "start") {
    return state;
  }

  return {
    ...state,
    xhrBreakpoints: xhrBreakpoints.filter(bp => {
      if (bp.method === breakpoint.method && bp.path === breakpoint.path) {
        return false;
      } else {
        return true;
      }
    })
  };
}

function updateXHRBreakpoint(state, action) {
  const { breakpoint, index } = action;
  const { xhrBreakpoints } = state;
  if (action.type === "DISABLE_XHR_BREAKPOINT" || action.type === "ENABLE_XHR_BREAKPOINT") {
    let breakpointExists = false;
    for (var i = 0; i < xhrBreakpoints.length; i++) {
      if (breakpoint.method === xhrBreakpoints[i].method && breakpoint.path === xhrBreakpoints[i].path) {
        breakpointExists = true;
      }
    }
    if (breakpointExists === false) {
      return state;
    }
  }
  const newXhrBreakpoints = [...xhrBreakpoints];
  newXhrBreakpoints[index] = breakpoint;
  return {
    ...state,
    xhrBreakpoints: newXhrBreakpoints
  };
}

function setBreakpoint(state, locationId, breakpoint) {
  return {
    ...state,
    breakpoints: { ...state.breakpoints, [locationId]: breakpoint }
  };
}

function unsetBreakpoint(state, locationId) {
  const breakpoints = { ...state.breakpoints };
  delete breakpoints[locationId];
  return {
    ...state,
    breakpoints: { ...breakpoints }
  };
}

function addBreakpoint(state, action): BreakpointsState {
  if (action.status === "start" && action.breakpoint) {
    const { breakpoint } = action;
    const locationId = makeLocationId(breakpoint.location);
    return setBreakpoint(state, locationId, breakpoint);
  }

  // when the action completes, we can commit the breakpoint
  if (action.status === "done") {
    const { value } = ((action: any): DonePromiseAction);
    return syncBreakpoint(state, value);
  }

  // Remove the optimistic update
  if (action.status === "error" && action.breakpoint) {
    const locationId = makeLocationId(action.breakpoint.location);
    return unsetBreakpoint(state, locationId);
  }

  return state;
}

function syncBreakpoint(state, data): BreakpointsState {
  const { breakpoint, previousLocation } = data;

  if (previousLocation) {
    state = {
      ...state,
      breakpoints: { ...state.breakpoints }
    };
    delete state.breakpoints[makeLocationId(previousLocation)];
  }

  if (!breakpoint) {
    return state;
  }

  const locationId = makeLocationId(breakpoint.location);
  return setBreakpoint(state, locationId, breakpoint);
}

function updateBreakpoint(state, action): BreakpointsState {
  const { breakpoint } = action;
  const locationId = makeLocationId(breakpoint.location);
  return setBreakpoint(state, locationId, breakpoint);
}

function updateAllBreakpoints(state, action): BreakpointsState {
  const { breakpoints } = action;
  state = {
    ...state,
    breakpoints: { ...state.breakpoints }
  };
  breakpoints.forEach(breakpoint => {
    const locationId = makeLocationId(breakpoint.location);
    state.breakpoints[locationId] = breakpoint;
  });
  return state;
}

function remapBreakpoints(state, action): BreakpointsState {
  const breakpoints = action.breakpoints.reduce(
    (updatedBreakpoints, breakpoint) => {
      const locationId = makeLocationId(breakpoint.location);
      return { ...updatedBreakpoints, [locationId]: breakpoint };
    },
    {}
  );

  return { ...state, breakpoints };
}

function removeBreakpoint(state, action): BreakpointsState {
  const { breakpoint } = action;
  const id = makeLocationId(breakpoint.location);
  return unsetBreakpoint(state, id);
}

function isMatchingLocation(location1, location2) {
  return isEqual(location1, location2);
}

// Selectors
// TODO: these functions should be moved out of the reducer

type OuterState = { breakpoints: BreakpointsState };

export function getBreakpointsMap(state: OuterState): BreakpointsMap {
  return state.breakpoints.breakpoints;
}

export function getBreakpointsList(state: OuterState): Breakpoint[] {
  return (Object.values(getBreakpointsMap(state)): any);
}

export function getBreakpointCount(state: OuterState): number {
  return getBreakpointsList(state).length;
}

export function getBreakpoint(
  state: OuterState,
  location: SourceLocation
): ?Breakpoint {
  const breakpoints = getBreakpointsMap(state);
  return breakpoints[makeLocationId(location)];
}

export function getBreakpointsDisabled(state: OuterState): boolean {
  const breakpoints = getBreakpointsList(state);
  return breakpoints.every(breakpoint => breakpoint.disabled);
}

export function getBreakpointsLoading(state: OuterState): boolean {
  const breakpoints = getBreakpointsList(state);
  const isLoading = breakpoints.some(breakpoint => breakpoint.loading);
  return breakpoints.length > 0 && isLoading;
}

export function getBreakpointsForSource(
  state: OuterState,
  sourceId: string,
  line: ?number
): Breakpoint[] {
  if (!sourceId) {
    return [];
  }

  const isGeneratedSource = isGeneratedId(sourceId);
  const breakpoints = getBreakpointsList(state);
  return breakpoints.filter(bp => {
    const location = isGeneratedSource ? bp.generatedLocation : bp.location;
    return location.sourceId === sourceId && (!line || line == location.line);
  });
}

export function getBreakpointForLocation(
  state: OuterState,
  location: SourceLocation | null
): ?Breakpoint {
  if (!location || !location.sourceId) {
    return undefined;
  }

  const isGeneratedSource = isGeneratedId(location.sourceId);
  return getBreakpointsList(state).find(bp => {
    const loc = isGeneratedSource ? bp.generatedLocation : bp.location;
    return isMatchingLocation(loc, location);
  });
}

export function getHiddenBreakpoint(state: OuterState): ?Breakpoint {
  const breakpoints = getBreakpointsList(state);
  return breakpoints.find(bp => bp.hidden);
}

export default update;
