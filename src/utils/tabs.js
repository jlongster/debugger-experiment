/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import React from "react";

import type { List } from "immutable";
import type { SourceRecord } from "../reducers/sources";
import { isPretty } from "./source";

type SourcesList = List<SourceRecord>;
/*
 * Finds the hidden tabs by comparing the tabs' top offset.
 * hidden tabs will have a great top offset.
 *
 * @param sourceTabs Immutable.list
 * @param sourceTabEls HTMLCollection
 *
 * @returns Immutable.list
 */

export function getHiddenTabs(
  sourceTabs: SourcesList,
  sourceTabEls: Array<any>
) {
  sourceTabEls = [].slice.call(sourceTabEls);
  function getTopOffset() {
    const topOffsets = sourceTabEls.map(t => t.getBoundingClientRect().top);
    return Math.min(...topOffsets);
  }

  function hasTopOffset(el) {
    // adding 10px helps account for cases where the tab might be offset by
    // styling such as selected tabs which don't have a border.
    const tabTopOffset = getTopOffset();
    return el.getBoundingClientRect().top > tabTopOffset + 10;
  }

  return sourceTabs.filter((tab, index) => {
    const element = sourceTabEls[index];
    return element && hasTopOffset(element);
  });
}

export function getSourceAnnotation(
  source: SourceRecord,
  sourceMetaData: Object
) {
  const sourceId = source.get("id");

  const framework =
    sourceMetaData && sourceMetaData.framework
      ? sourceMetaData.framework
      : false;

  if (framework) {
    return <img className={framework.toLowerCase()} />;
  }

  if (isPretty(source)) {
    return <img className="prettyPrint" />;
  }
  if (source.get("isBlackBoxed")) {
    return <img className="blackBox" />;
  }
}

export function getTabMenuItems() {
  return {
    closeTab: {
      id: "node-menu-close-tab",
      label: L10N.getStr("sourceTabs.closeTab"),
      accesskey: L10N.getStr("sourceTabs.closeTab.accesskey"),
      disabled: false
    },
    closeOtherTabs: {
      id: "node-menu-close-other-tabs",
      label: L10N.getStr("sourceTabs.closeOtherTabs"),
      accesskey: L10N.getStr("sourceTabs.closeOtherTabs.accesskey"),
      disabled: false
    },
    closeTabsToEnd: {
      id: "node-menu-close-tabs-to-end",
      label: L10N.getStr("sourceTabs.closeTabsToEnd"),
      accesskey: L10N.getStr("sourceTabs.closeTabsToEnd.accesskey"),
      disabled: false
    },
    closeAllTabs: {
      id: "node-menu-close-all-tabs",
      label: L10N.getStr("sourceTabs.closeAllTabs"),
      accesskey: L10N.getStr("sourceTabs.closeAllTabs.accesskey"),
      disabled: false
    },
    showSource: {
      id: "node-menu-show-source",
      label: L10N.getStr("sourceTabs.revealInTree"),
      accesskey: L10N.getStr("sourceTabs.revealInTree.accesskey"),
      disabled: false
    },
    copySourceUri2: {
      id: "node-menu-copy-source-url",
      label: L10N.getStr("copySourceUri2"),
      accesskey: L10N.getStr("copySourceUri2.accesskey"),
      disabled: false
    },
    prettyPrint: {
      id: "node-menu-pretty-print",
      label: L10N.getStr("sourceTabs.prettyPrint"),
      accesskey: L10N.getStr("sourceTabs.prettyPrint.accesskey"),
      disabled: false
    }
  };
}
