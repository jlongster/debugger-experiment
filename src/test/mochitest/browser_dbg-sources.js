/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

// Tests that the source tree works.

async function waitForSourceCount(dbg, i) {
  // We are forced to wait until the DOM nodes appear because the
  // source tree batches its rendering.
  await waitUntil(() => {
    return findAllElements(dbg, "sourceNodes").length === i;
  });
}

async function clickEl(dbg, elementName, ...args) {
  const selector = getSelector(elementName, ...args);
  const el = await waitForElementWithSelector(dbg, selector);

  el.scrollIntoView();
  el.click();
}

async function assertSourceCount(dbg, count) {
  await waitForSourceCount(dbg, count);
  is(findAllElements(dbg, "sourceNodes").length, count, `${count} sources`);
}

function getLabel(dbg, index) {
  return findElement(dbg, "sourceNode", index)
    .textContent.trim()
    .replace(/^[\s\u200b]*/g, "");
}

add_task(async function() {
  const dbg = await initDebugger("doc-sources.html");
  const { selectors: { getSelectedSource }, getState } = dbg;

  await waitForSources(dbg, "simple1", "simple2", "nested-source", "long.js");

  // Expand nodes and make sure more sources appear.
  await assertSourceCount(dbg, 2);
  await clickElement(dbg, "sourceArrow", 2);

  await assertSourceCount(dbg, 7);

  //console.log('about to click element: ', dbg.win.document.querySelector(".sources-list .tree-node:nth-child(3)"));
  //dbg.win.document.querySelector(".sources-list .tree-node:nth-child(3)").style.color='green';
  //dbg.win.document.querySelector(".sources-list .tree-node:nth-child(3)").style.border='1px solid yellow';
  //debugger;

  await clickElement(dbg, "sourceDirectory", 3);

  //dbg.win.document.querySelector(".sources-list .focused").style.color = 'red';
  //console.log(dbg.win.document.querySelector(".sources-list .tree-node:nth-child(3)"));

  //console.log('clicked on `sourceDirectory!`');
  //debugger;

  await assertSourceCount(dbg, 8);

  // Cleanup from opening source directory
  dbg.win.document.querySelector(".sources-list .focused").classList.remove("focused");

  // Select a source
  ok(
    !findElementWithSelector(dbg, ".sources-list .focused"),
    "Source is not focused"
  );

  const selected = waitForDispatch(dbg, "SELECT_SOURCE");

  await clickElement(dbg, "sourceNode", 4);
  await selected;

  ok(
    findElementWithSelector(dbg, ".sources-list .focused"),
    "Source is focused"
  );
  ok(
    getSelectedSource(getState())
      .get("url")
      .includes("nested-source.js"),
    "The right source is selected"
  );

  // Make sure new sources appear in the list.
  ContentTask.spawn(gBrowser.selectedBrowser, null, function() {
    const script = content.document.createElement("script");
    script.src = "math.min.js";
    content.document.body.appendChild(script);
  });

  await waitForSourceCount(dbg, 9);
  is(
    getLabel(dbg, 7),
    "math.min.js",
    "math.min.js - The dynamic script exists"
  );
});
