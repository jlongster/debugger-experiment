import { getClosestExpression } from "./utils/closest";
import { getVariablesInScope } from "./scopes";
import getSymbols from "./getSymbols";
import getOutOfScopeLocations from "./getOutOfScopeLocations";

import { workerUtils } from "devtools-utils";
const { workerHandler } = workerUtils;

self.onmessage = workerHandler({
  getClosestExpression,
  getOutOfScopeLocations,
  getSymbols,
  getVariablesInScope
});
