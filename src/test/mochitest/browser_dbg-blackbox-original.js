/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

// This source map does not have source contents, so it's fetched separately
add_task(async function() {
    // NOTE: the CORS call makes the test run times inconsistent
    await pushPref("devtools.debugger.features.map-scopes", true);
  
    const dbg = await initDebugger("doc-sourcemaps3.html");
    const {
      selectors: { getBreakpoint, getBreakpointCount },
      getState
    } = dbg;
  
    await waitForSources(dbg, "bundle.js", "sorted.js", "test.js");
  
    const sortedSrc = findSource(dbg, "sorted.js");
  
    await selectSource(dbg, sortedSrc);
  
    await clickElement(dbg, "blackbox");
    await waitForDispatch(dbg, "BLACKBOX");
  
    await wait(5000);
  });
  
  function wait(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    })
  }
