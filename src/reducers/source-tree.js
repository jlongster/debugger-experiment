// @flow
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Source tree reducer
 * @module reducers/source-tree
 */
import makeRecord from "../utils/makeRecord";

import type { SourceTreeAction } from "../actions/types";
import type { Record } from "../utils/makeRecord";

export type SourceTreeState = {
  expanded: set
};

function InitialState(): Record<SourceTreeState> {
  return makeRecord({
    expanded: new Set()
  })();
}

export default function update(
  state: Record<SourceTreeState> = InitialState(),
  action: SourceTreeAction
): Record<SourceTreeState> {
  switch (action.type) {
    case "SET_EXPANDED_STATE":
      console.log(action.expanded);
      return state.update("expanded", value => action.expanded);
  }
  return state;
}

type OuterState = {
  sourceTree: Record<SourceTreeState>
};

export function getExpandedState(state: OuterState) {
  console.warn("streducer => ", state.sourceTree.get("expanded"));
  return state.sourceTree.get("expanded");
}
