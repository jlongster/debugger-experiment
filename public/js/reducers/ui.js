// @flow
const I = require("immutable");
const makeRecord = require("../utils/makeRecord");
const C = require("../constants");

import type { Action } from "../actions/types";
import type { Record } from "../utils/makeRecord";

type SidebarState = {
  collapsed: boolean,
  width: number,
  prevWidth: number,
};

export type SidebarsState = {
  left: I.Map<string, SidebarState>,
  right: I.Map<string, SidebarState>,
};

const State = makeRecord(({
  left: I.Map({
    collapsed: false,
    width: 300,
    prevWidth: 0
  }),
  right: I.Map({
    collapsed: false,
    width: 300,
    prevWidth: 0
  }),
} : SidebarsState));

function update(state = State(), action: Action) : Record<SidebarsState> {
  switch (action.type) {
    case C.COLLAPSE_SIDEBAR: {
      let width = state.getIn([action.side, "width"]),
        prevWidth = state.getIn([action.side, "prevWidth"]);
      return state.mergeIn([action.side], {
        collapsed: action.collapsed,
        width: action.collapsed ? 0 : prevWidth,
        prevWidth: action.collapsed ? width : 0,
      });
    }
    case C.RESIZE_SIDEBAR: {
      return state.mergeIn([action.side], {
        width: action.width,
      });
    }
  }

  return state;
}
// Selectors

type OuterState = { ui: Record<SidebarsState> };

function getSidebarDimensions(state: OuterState) {
  return state.ui;
}

function getSidebarCollapsed(state: OuterState, side: string) {
  return state.ui.getIn([side, "collapsed"]);
}

function getSidebarWidth(state: OuterState, side: string) {
  return state.ui.getIn([side, "width"]);
}

module.exports = {
  State,
  update,
  getSidebarDimensions,
  getSidebarCollapsed,
  getSidebarWidth
};
