// @flow

export type SearchModifiers = {
  caseSensitive: boolean,
  wholeWord: boolean,
  regexMatch: boolean
};

export type Mode =
  | String
  | {
      name: string,
      typescript?: boolean,
      base?: {
        name: string,
        typescript: boolean
      }
    };

export type {
  Breakpoint,
  PendingBreakpoint,
  Expression,
  Frame,
  Grip,
  LoadedObject,
  Location,
  Source,
  Pause,
  Why
} from "debugger-html";
