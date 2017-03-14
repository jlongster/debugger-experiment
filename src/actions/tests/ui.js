const { createStore, selectors, actions } = require("../../utils/test-head");
const expect = require("expect.js");

const {
  getFileSearchState,
  getProjectSearchState,
  getPaneCollapse
} = selectors;

describe("ui", () => {
  it("should toggle the visible state of project search", () => {
    const { dispatch, getState } = createStore();
    expect(getProjectSearchState(getState())).to.be(false);
    dispatch(actions.toggleProjectSearch());
    expect(getProjectSearchState(getState())).to.be(true);
  });

  it("should close project search", () => {
    const { dispatch, getState } = createStore();
    expect(getProjectSearchState(getState())).to.be(false);
    dispatch(actions.toggleProjectSearch());
    dispatch(actions.toggleProjectSearch(false));
    expect(getProjectSearchState(getState())).to.be(false);
  });

  it("should toggle the visible state of file search", () => {
    const { dispatch, getState } = createStore();
    expect(getFileSearchState(getState())).to.be(false);
    dispatch(actions.toggleFileSearch());
    expect(getFileSearchState(getState())).to.be(true);
  });

  it("should close file search", () => {
    const { dispatch, getState } = createStore();
    expect(getFileSearchState(getState())).to.be(false);
    dispatch(actions.toggleFileSearch());
    dispatch(actions.toggleFileSearch(false));
    expect(getFileSearchState(getState())).to.be(false);
  });

  it("should toggle the collapse state of a pane", () => {
    const { dispatch, getState } = createStore();
    expect(getPaneCollapse(getState(), "start")).to.be(false);
    dispatch(actions.togglePaneCollapse("start", true));
    expect(getPaneCollapse(getState(), "start")).to.be(true);
  });
});
