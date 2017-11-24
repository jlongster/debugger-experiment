/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import {
  getSources,
  getSelectedSource,
  getSourceInSources
} from "../reducers/sources";
import { getFrames } from "../reducers/pause";
import { annotateFrame } from "../utils/frame";
import { isOriginalId } from "devtools-source-map";
import { get } from "lodash";
import type { Frame, Source } from "debugger-html";
import type { SourcesMap } from "../reducers/sources";

function getLocation(frame, isGeneratedSource) {
  return isGeneratedSource
    ? frame.generatedLocation || frame.location
    : frame.location;
}

function getSourceForFrame(sources, frame) {
  return getSourceInSources(sources, frame.location.sourceId);
}

function appendSource(sources, frame, selectedSource) {
  const isGeneratedSource = !isOriginalId(selectedSource.get("id"));
  return {
    ...frame,
    location: getLocation(frame, isGeneratedSource),
    source: getSourceForFrame(sources, frame).toJS()
  };
}

export function getAndProcessFrames(
  frames: Frame[],
  sources: SourcesMap,
  selectedSource: Source
) {
  if (!frames) {
    return null;
  }

  return frames
    .filter(frame => getSourceForFrame(sources, frame))
    .map(frame => appendSource(sources, frame, selectedSource))
    .filter(frame => !get(frame, "source.isBlackBoxed"))
    .map(annotateFrame);
}

export default function getCallStackFrames(state) {
  const selectedSource = getSelectedSource(state);
  const sources = getSources(state);
  const frames = getFrames(state);

  return getAndProcessFrames(frames, sources, selectedSource);
}
