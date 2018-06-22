/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { isOriginalId } from "devtools-source-map";
import { PROMISE } from "../utils/middleware/promise";
import { getGeneratedSource, getSourceFromId } from "../../selectors";
import * as parser from "../../workers/parser";
import { isLoaded } from "../../utils/source";
import { Telemetry } from "devtools-modules";

import defer from "../../utils/defer";
import type { ThunkArgs } from "../types";

import type { Source } from "../../types";

const requests = new Map();

const loadSourceHistogram = "DEVTOOLS_DEBUGGER_LOAD_SOURCE_MS";
const telemetry = new Telemetry();

async function loadSource(source: Source, { sourceMaps, client }) {
  const id = source.id;
  if (isOriginalId(id)) {
    return sourceMaps.getOriginalSourceText(source);
  }

  const response = await client.sourceContents(id);
  return {
    id,
    text: response.source,
    contentType: response.contentType || "text/javascript"
  };
}

/**
 * @memberof actions/sources
 * @static
 */
export function loadSourceText(source: Source) {
  return async ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    const id = source.id;
    // Fetch the source text only once.
    if (requests.has(id)) {
      return requests.get(id);
    }

    if (isLoaded(source)) {
      return Promise.resolve();
    }

    const deferred = defer();
    requests.set(id, deferred.promise);

    // The file is not loaded so we need to load it. This telemetry probe times
    // the loading of the source file.
    telemetry.start(loadSourceHistogram, source);
    try {
      await dispatch({
        type: "LOAD_SOURCE_TEXT",
        sourceId: id,
        [PROMISE]: loadSource(source, { sourceMaps, client })
      });
      telemetry.finish(loadSourceHistogram, source);
    } catch (e) {
      deferred.resolve();
      requests.delete(id);
      return;
    }

    const newSource = getSourceFromId(getState(), source.id);

    if (isOriginalId(newSource.id) && !newSource.isWasm) {
      const generatedSource = getGeneratedSource(getState(), source);
      await dispatch(loadSourceText(generatedSource));
    }

    if (!newSource.isWasm) {
      await parser.setSource(newSource);
    }

    // signal that the action is finished
    deferred.resolve();
    requests.delete(id);

    return source;
  };
}
