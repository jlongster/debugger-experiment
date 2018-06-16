/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

/**
 * Types reducer
 * @module reducers/types
 */

// @flow

import type { ASTState } from "./ast";
import type { BreakpointsState } from "./breakpoints";
import type { ExpressionState } from "./expressions";
import type { FileSearchState } from "./file-search";
import type { PauseState } from "./pause";
import type { PendingBreakpointsState } from "../selectors";
import type { ProjectTextSearchState } from "./project-text-search";
import type { SourcesState } from "./sources";
import type { UIState } from "./ui";
import type { DebuggeeState } from "./debuggee";

import * as I from "immutable";

export type State = {
  ast: I.RecordOf<ASTState>,
  breakpoints: I.RecordOf<BreakpointsState>,
  debuggeee: I.RecordOf<DebuggeeState>,
  expressions: I.RecordOf<ExpressionState>,
  fileSearch: I.RecordOf<FileSearchState>,
  pause: PauseState,
  pendingBreakpoints: I.RecordOf<PendingBreakpointsState>,
  projectTextSearch: I.RecordOf<ProjectTextSearchState>,
  sources: I.RecordOf<SourcesState>,
  ui: I.RecordOf<UIState>
};

export type SelectedLocation = {
  sourceId: string,
  line?: number,
  column?: number
};

export type PendingSelectedLocation = {
  url: string,
  line?: number,
  column?: number
};

export type { SourcesMap, RelativeSourcesMap } from "./sources";
export type { ActiveSearchType, OrientationType } from "./ui";
export type { BreakpointsMap } from "./breakpoints";
export type { WorkersList } from "./debuggee";
export type { Command } from "./pause";
export type { SourceMetaDataMap } from "./ast";
