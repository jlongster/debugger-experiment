declare var describe: (name: string, func: () => void) => void;
declare var it: (desc: string, func: () => void) => void;

const {
  State, update } = require("../ui");
const expect = require("expect.js");
const C = require("../../constants");

import type { SidebarsState } from "../ui";

describe("ui reducer", () => {
  it("should flip the collapse value for left", () => {
    let state: SidebarsState = State();
    expect(state.getIn(["left", "collapsed"])).to.be(false);
    expect(state.getIn(["left", "width"])).to.be(300);
    state = update(state, {
      type: C.COLLAPSE_SIDEBAR,
      collapsed: true,
      side: "left"
    });
    expect(state.getIn(["left", "collapsed"])).to.be(true);
  });

  it("should flip the collapse value for right", () => {
    let state = State();
    expect(state.getIn(["right", "collapsed"])).to.be(false);
    expect(state.getIn(["right", "width"])).to.be(300);
    state = update(state, {
      type: C.COLLAPSE_SIDEBAR,
      collapsed: true,
      side: "right"
    });
    expect(state.getIn(["right", "collapsed"])).to.be(true);
  });

  it("should change the width for left", () => {
    let state = State();
    expect(state.getIn(["left", "collapsed"])).to.be(false);
    expect(state.getIn(["left", "width"])).to.be(300);
    expect(state.getIn(["right", "collapsed"])).to.be(false);
    expect(state.getIn(["right", "width"])).to.be(300);
    state = update(state, {
      type: C.RESIZE_SIDEBAR,
      width: 370,
      side: "left"
    });
    expect(state.getIn(["left", "collapsed"])).to.be(false);
    expect(state.getIn(["left", "width"])).to.be(370);
    expect(state.getIn(["right", "collapsed"])).to.be(false);
    expect(state.getIn(["right", "width"])).to.be(300);
  });

  it("should change the width for right", () => {
    let state = State();
    expect(state.getIn(["right", "collapsed"])).to.be(false);
    expect(state.getIn(["right", "width"])).to.be(300);
    expect(state.getIn(["left", "collapsed"])).to.be(false);
    expect(state.getIn(["left", "width"])).to.be(300);
    state = update(state, {
      type: C.RESIZE_SIDEBAR,
      width: 370,
      side: "right"
    });
    expect(state.getIn(["right", "collapsed"])).to.be(false);
    expect(state.getIn(["right", "width"])).to.be(370);
    expect(state.getIn(["left", "collapsed"])).to.be(false);
    expect(state.getIn(["left", "width"])).to.be(300);
  });
});
