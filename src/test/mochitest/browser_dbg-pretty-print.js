/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

// Tests basic pretty-printing functionality.

async function prettyPrintTest() {
  const dbg = await initDebugger("doc-minified.html");

  await selectSource(dbg, "math.min.js");
  clickElement(dbg, "prettyPrintButton");
  await waitForDispatch(dbg, "TOGGLE_PRETTY_PRINT");

  const ppSrc = findSource(dbg, "math.min.js:formatted");
  ok(ppSrc, "Pretty-printed source exists");

  await addBreakpoint(dbg, ppSrc, 18);

  invokeInTab("arithmetic");
  await waitForPaused(dbg);
  assertPausedLocation(dbg, ppSrc, 18);
  await stepOver(dbg);
  assertPausedLocation(dbg, ppSrc, 27);
  await resume(dbg);

  // The pretty-print button should go away in the pretty-printed
  // source.
  ok(!findElement(dbg, "sourceFooter"), "Footer is hidden");

  await selectSource(dbg, "math.min.js");
  ok(findElement(dbg, "sourceFooter"), "Footer is hidden");
}

module.exports = prettyPrintTest;
