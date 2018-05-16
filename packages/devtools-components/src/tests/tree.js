/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

/* global jest */

import React from "react";
import { mount } from "enzyme";
import Components from "../../index";
import dom from "react-dom-factories";

const { Component, createFactory } = React;
const Tree = createFactory(Components.Tree);

function mountTree(overrides = {}) {
  return mount(
    createFactory(
      class container extends Component {
        constructor(props) {
          super(props);
          const state = {
            expanded: overrides.expanded || new Set(),
            focused: overrides.focused
          };
          delete overrides.focused;
          this.state = state;
        }

        render() {
          return Tree(
            Object.assign(
              {
                getParent: x => TEST_TREE.parent[x],
                getChildren: x => TEST_TREE.children[x],
                renderItem: (x, depth, focused, arrow) => {
                  return dom.div(
                    {},
                    arrow,
                    focused ? "[" : null,
                    x,
                    focused ? "]" : null
                  );
                },
                getRoots: () => ["A", "M"],
                getKey: x => `key-${x}`,
                onFocus: x => {
                  this.setState(previousState => {
                    return { focused: x };
                  });
                },
                onExpand: x => {
                  this.setState(previousState => {
                    const expanded = new Set(previousState.expanded);
                    expanded.add(x);
                    return { expanded };
                  });
                },
                onCollapse: x => {
                  this.setState(previousState => {
                    const expanded = new Set(previousState.expanded);
                    expanded.delete(x);
                    return { expanded };
                  });
                },
                isExpanded: x => this.state && this.state.expanded.has(x),
                focused: this.state.focused
              },
              overrides
            )
          );
        }
      }
    )()
  );
}

describe("Tree", () => {
  it("does not throw", () => {
    expect(mountTree()).toBeTruthy();
  });

  it("is accessible", () => {
    const wrapper = mountTree({
      expanded: new Set("ABCDEFGHIJMN".split(""))
    });
    expect(wrapper.getDOMNode().getAttribute("role")).toBe("tree");
    expect(wrapper.getDOMNode().getAttribute("tabIndex")).toBe("0");

    const expected = {
      A: { id: "key-A", level: 1, expanded: true },
      B: { id: "key-B", level: 2, expanded: true },
      C: { id: "key-C", level: 2, expanded: true },
      D: { id: "key-D", level: 2, expanded: true },
      E: { id: "key-E", level: 3, expanded: true },
      F: { id: "key-F", level: 3, expanded: true },
      G: { id: "key-G", level: 3, expanded: true },
      H: { id: "key-H", level: 3, expanded: true },
      I: { id: "key-I", level: 3, expanded: true },
      J: { id: "key-J", level: 3, expanded: true },
      K: { id: "key-K", level: 4, expanded: undefined },
      L: { id: "key-L", level: 4, expanded: undefined },
      M: { id: "key-M", level: 1, expanded: true },
      N: { id: "key-N", level: 2, expanded: true },
      O: { id: "key-O", level: 3, expanded: undefined }
    };

    getTreeNodes(wrapper).forEach(node => {
      const key = node.prop("id").replace("key-", "");
      const item = expected[key];

      expect(node.prop("id")).toBe(item.id);
      expect(node.prop("role")).toBe("treeitem");
      expect(node.prop("aria-level")).toBe(item.level);
      expect(node.prop("aria-expanded")).toBe(item.expanded);
    });
  });

  it("renders as expected", () => {
    const wrapper = mountTree({
      expanded: new Set("ABCDEFGHIJKLMNO".split(""))
    });

    expect(formatTree(wrapper)).toMatchSnapshot();
  });

  it("renders as expected when passed a className", () => {
    const wrapper = mountTree({
      className: "testClassName"
    });

    expect(wrapper.find(".tree").hasClass("testClassName")).toBe(true);
  });

  it("renders as expected when passed a style", () => {
    const wrapper = mountTree({
      style: {
        color: "red"
      }
    });

    expect(wrapper.getDOMNode().style.color).toBe("red");
  });

  it("renders as expected when passed a label", () => {
    const wrapper = mountTree({
      label: "testAriaLabel"
    });
    expect(wrapper.getDOMNode().getAttribute("aria-label")).toBe(
      "testAriaLabel"
    );
  });

  it("renders as expected when passed an aria-labelledby", () => {
    const wrapper = mountTree({
      labelledby: "testAriaLabelBy"
    });
    expect(wrapper.getDOMNode().getAttribute("aria-labelledby")).toBe(
      "testAriaLabelBy"
    );
  });

  it("renders as expected with collapsed nodes", () => {
    const wrapper = mountTree({
      expanded: new Set("MNO".split(""))
    });
    expect(formatTree(wrapper)).toMatchSnapshot();
  });

  it("renders as expected when passed autoDepth:1", () => {
    const wrapper = mountTree({
      autoExpandDepth: 1
    });
    expect(formatTree(wrapper)).toMatchSnapshot();
  });

  it("renders as expected when given a focused item", () => {
    const wrapper = mountTree({
      expanded: new Set("ABCDEFGHIJKLMNO".split("")),
      focused: "G"
    });
    expect(formatTree(wrapper)).toMatchSnapshot();
    expect(wrapper.getDOMNode().getAttribute("aria-activedescendant")).toBe(
      "key-G"
    );
    expect(wrapper.find(".focused").prop("id")).toBe("key-G");

    getTreeNodes(wrapper)
      .first()
      .simulate("click");
    expect(formatTree(wrapper)).toMatchSnapshot();
    expect(wrapper.getDOMNode().getAttribute("aria-activedescendant")).toBe(
      "key-A"
    );
    expect(wrapper.find(".focused").prop("id")).toBe("key-A");

    getTreeNodes(wrapper)
      .first()
      .simulate("click");
    expect(formatTree(wrapper)).toMatchSnapshot();
    expect(wrapper.getDOMNode().getAttribute("aria-activedescendant")).toBe(
      "key-A"
    );
    expect(wrapper.find(".focused").prop("id")).toBe("key-A");

    wrapper.simulate("blur");
    expect(formatTree(wrapper)).toMatchSnapshot();
    expect(wrapper.getDOMNode().hasAttribute("aria-activedescendant")).toBe(
      false
    );
    expect(wrapper.find(".focused").exists()).toBe(false);
  });

  it("renders as expected when navigating up with the keyboard", () => {
    const wrapper = mountTree({
      expanded: new Set("ABCDEFGHIJKLMNO".split("")),
      focused: "L"
    });
    expect(formatTree(wrapper)).toMatchSnapshot();
    expect(wrapper.getDOMNode().getAttribute("aria-activedescendant")).toBe(
      "key-L"
    );
    expect(wrapper.find(".focused").prop("id")).toBe("key-L");

    simulateKeyDown(wrapper, "ArrowUp");
    expect(formatTree(wrapper)).toMatchSnapshot();
    expect(wrapper.getDOMNode().getAttribute("aria-activedescendant")).toBe(
      "key-K"
    );
    expect(wrapper.find(".focused").prop("id")).toBe("key-K");

    simulateKeyDown(wrapper, "ArrowUp");
    expect(formatTree(wrapper)).toMatchSnapshot();
    expect(wrapper.getDOMNode().getAttribute("aria-activedescendant")).toBe(
      "key-E"
    );
    expect(wrapper.find(".focused").prop("id")).toBe("key-E");
  });

  it("renders as expected navigating up with the keyboard on a root", () => {
    const wrapper = mountTree({
      expanded: new Set("ABCDEFGHIJKLMNO".split("")),
      focused: "A"
    });
    expect(formatTree(wrapper)).toMatchSnapshot();
    expect(wrapper.getDOMNode().getAttribute("aria-activedescendant")).toBe(
      "key-A"
    );
    expect(wrapper.find(".focused").prop("id")).toBe("key-A");

    simulateKeyDown(wrapper, "ArrowUp");
    expect(formatTree(wrapper)).toMatchSnapshot();
    expect(wrapper.getDOMNode().getAttribute("aria-activedescendant")).toBe(
      "key-A"
    );
    expect(wrapper.find(".focused").prop("id")).toBe("key-A");
  });

  it("renders as expected when navigating down with the keyboard", () => {
    const wrapper = mountTree({
      expanded: new Set("ABCDEFGHIJKLMNO".split("")),
      focused: "K"
    });
    expect(formatTree(wrapper)).toMatchSnapshot();
    expect(wrapper.getDOMNode().getAttribute("aria-activedescendant")).toBe(
      "key-K"
    );
    expect(wrapper.find(".focused").prop("id")).toBe("key-K");

    simulateKeyDown(wrapper, "ArrowDown");
    expect(formatTree(wrapper)).toMatchSnapshot();
    expect(wrapper.getDOMNode().getAttribute("aria-activedescendant")).toBe(
      "key-L"
    );
    expect(wrapper.find(".focused").prop("id")).toBe("key-L");

    simulateKeyDown(wrapper, "ArrowDown");
    expect(formatTree(wrapper)).toMatchSnapshot();
    expect(wrapper.getDOMNode().getAttribute("aria-activedescendant")).toBe(
      "key-F"
    );
    expect(wrapper.find(".focused").prop("id")).toBe("key-F");
  });

  it("renders as expected navigating down with keyboard on last node", () => {
    const wrapper = mountTree({
      expanded: new Set("ABCDEFGHIJKLMNO".split("")),
      focused: "O"
    });
    expect(formatTree(wrapper)).toMatchSnapshot();
    expect(wrapper.getDOMNode().getAttribute("aria-activedescendant")).toBe(
      "key-O"
    );
    expect(wrapper.find(".focused").prop("id")).toBe("key-O");

    simulateKeyDown(wrapper, "ArrowDown");
    expect(formatTree(wrapper)).toMatchSnapshot();
    expect(wrapper.getDOMNode().getAttribute("aria-activedescendant")).toBe(
      "key-O"
    );
    expect(wrapper.find(".focused").prop("id")).toBe("key-O");
  });

  it("renders as expected when navigating with right/left arrows", () => {
    const wrapper = mountTree({
      expanded: new Set("ABCDEFGHIJKLMNO".split("")),
      focused: "L"
    });
    expect(formatTree(wrapper)).toMatchSnapshot();
    expect(wrapper.getDOMNode().getAttribute("aria-activedescendant")).toBe(
      "key-L"
    );
    expect(wrapper.find(".focused").prop("id")).toBe("key-L");

    simulateKeyDown(wrapper, "ArrowLeft");
    expect(formatTree(wrapper)).toMatchSnapshot();
    expect(wrapper.getDOMNode().getAttribute("aria-activedescendant")).toBe(
      "key-E"
    );
    expect(wrapper.find(".focused").prop("id")).toBe("key-E");

    simulateKeyDown(wrapper, "ArrowLeft");
    expect(formatTree(wrapper)).toMatchSnapshot();
    expect(wrapper.getDOMNode().getAttribute("aria-activedescendant")).toBe(
      "key-E"
    );
    expect(wrapper.find(".focused").prop("id")).toBe("key-E");

    simulateKeyDown(wrapper, "ArrowRight");
    expect(formatTree(wrapper)).toMatchSnapshot();
    expect(wrapper.getDOMNode().getAttribute("aria-activedescendant")).toBe(
      "key-E"
    );
    expect(wrapper.find(".focused").prop("id")).toBe("key-E");

    simulateKeyDown(wrapper, "ArrowRight");
    expect(formatTree(wrapper)).toMatchSnapshot();
    expect(wrapper.getDOMNode().getAttribute("aria-activedescendant")).toBe(
      "key-K"
    );
    expect(wrapper.find(".focused").prop("id")).toBe("key-K");
  });

  it("renders as expected when navigating with left arrows on roots", () => {
    const wrapper = mountTree({
      focused: "M"
    });
    expect(formatTree(wrapper)).toMatchSnapshot();
    expect(wrapper.getDOMNode().getAttribute("aria-activedescendant")).toBe(
      "key-M"
    );
    expect(wrapper.find(".focused").prop("id")).toBe("key-M");

    simulateKeyDown(wrapper, "ArrowLeft");
    expect(formatTree(wrapper)).toMatchSnapshot();
    expect(wrapper.getDOMNode().getAttribute("aria-activedescendant")).toBe(
      "key-A"
    );
    expect(wrapper.find(".focused").prop("id")).toBe("key-A");

    simulateKeyDown(wrapper, "ArrowLeft");
    expect(formatTree(wrapper)).toMatchSnapshot();
    expect(wrapper.getDOMNode().getAttribute("aria-activedescendant")).toBe(
      "key-A"
    );
    expect(wrapper.find(".focused").prop("id")).toBe("key-A");
  });

  it("renders as expected when navigating with home/end", () => {
    const wrapper = mountTree({
      focused: "M"
    });
    expect(formatTree(wrapper)).toMatchSnapshot();
    expect(wrapper.getDOMNode().getAttribute("aria-activedescendant")).toBe(
      "key-M"
    );
    expect(wrapper.find(".focused").prop("id")).toBe("key-M");

    simulateKeyDown(wrapper, "Home");
    expect(formatTree(wrapper)).toMatchSnapshot();
    expect(wrapper.getDOMNode().getAttribute("aria-activedescendant")).toBe(
      "key-A"
    );
    expect(wrapper.find(".focused").prop("id")).toBe("key-A");

    simulateKeyDown(wrapper, "Home");
    expect(formatTree(wrapper)).toMatchSnapshot();
    expect(wrapper.getDOMNode().getAttribute("aria-activedescendant")).toBe(
      "key-A"
    );
    expect(wrapper.find(".focused").prop("id")).toBe("key-A");

    simulateKeyDown(wrapper, "End");
    expect(formatTree(wrapper)).toMatchSnapshot();
    expect(wrapper.getDOMNode().getAttribute("aria-activedescendant")).toBe(
      "key-M"
    );
    expect(wrapper.find(".focused").prop("id")).toBe("key-M");

    simulateKeyDown(wrapper, "End");
    expect(formatTree(wrapper)).toMatchSnapshot();
    expect(wrapper.getDOMNode().getAttribute("aria-activedescendant")).toBe(
      "key-M"
    );
    expect(wrapper.find(".focused").prop("id")).toBe("key-M");

    simulateKeyDown(wrapper, "ArrowRight");
    expect(formatTree(wrapper)).toMatchSnapshot();
    expect(wrapper.getDOMNode().getAttribute("aria-activedescendant")).toBe(
      "key-M"
    );
    expect(wrapper.find(".focused").prop("id")).toBe("key-M");

    simulateKeyDown(wrapper, "End");
    expect(formatTree(wrapper)).toMatchSnapshot();
    expect(wrapper.getDOMNode().getAttribute("aria-activedescendant")).toBe(
      "key-N"
    );
    expect(wrapper.find(".focused").prop("id")).toBe("key-N");

    simulateKeyDown(wrapper, "End");
    expect(formatTree(wrapper)).toMatchSnapshot();
    expect(wrapper.getDOMNode().getAttribute("aria-activedescendant")).toBe(
      "key-N"
    );
    expect(wrapper.find(".focused").prop("id")).toBe("key-N");

    simulateKeyDown(wrapper, "Home");
    expect(formatTree(wrapper)).toMatchSnapshot();
    expect(wrapper.getDOMNode().getAttribute("aria-activedescendant")).toBe(
      "key-A"
    );
    expect(wrapper.find(".focused").prop("id")).toBe("key-A");
  });

  it("renders as expected navigating with arrows on unexpandable roots", () => {
    const wrapper = mountTree({
      focused: "A",
      isExpandable: item => false
    });
    expect(formatTree(wrapper)).toMatchSnapshot();

    simulateKeyDown(wrapper, "ArrowRight");
    expect(formatTree(wrapper)).toMatchSnapshot();
    expect(wrapper.getDOMNode().getAttribute("aria-activedescendant")).toBe(
      "key-M"
    );

    simulateKeyDown(wrapper, "ArrowLeft");
    expect(formatTree(wrapper)).toMatchSnapshot();
    expect(wrapper.getDOMNode().getAttribute("aria-activedescendant")).toBe(
      "key-A"
    );
  });

  it("calls onFocus when expected", () => {
    const onFocus = jest.fn(x => {
      wrapper &&
        wrapper.setState(() => {
          return { focused: x };
        });
    });

    const wrapper = mountTree({
      expanded: new Set("ABCDEFGHIJKLMNO".split("")),
      focused: "I",
      onFocus
    });

    simulateKeyDown(wrapper, "ArrowUp");
    expect(onFocus.mock.calls[0][0]).toBe("H");

    simulateKeyDown(wrapper, "ArrowUp");
    expect(onFocus.mock.calls[1][0]).toBe("C");

    simulateKeyDown(wrapper, "ArrowLeft");
    simulateKeyDown(wrapper, "ArrowLeft");
    expect(onFocus.mock.calls[2][0]).toBe("A");

    simulateKeyDown(wrapper, "ArrowRight");
    expect(onFocus.mock.calls[3][0]).toBe("B");

    simulateKeyDown(wrapper, "ArrowDown");
    expect(onFocus.mock.calls[4][0]).toBe("E");
  });

  it("focus treeRef when a node is clicked", () => {
    const wrapper = mountTree({
      expanded: new Set("ABCDEFGHIJKLMNO".split(""))
    });
    const treeRef = wrapper
      .find("Tree")
      .first()
      .instance().treeRef;
    treeRef.focus = jest.fn();

    getTreeNodes(wrapper)
      .first()
      .simulate("click");
    expect(treeRef.focus.mock.calls).toHaveLength(1);
  });

  it("doesn't focus treeRef when focused is null", () => {
    const wrapper = mountTree({
      expanded: new Set("ABCDEFGHIJKLMNO".split("")),
      focused: "A"
    });
    const treeRef = wrapper
      .find("Tree")
      .first()
      .instance().treeRef;
    treeRef.focus = jest.fn();
    wrapper.simulate("blur");
    expect(treeRef.focus.mock.calls).toHaveLength(0);
  });

  it("calls onActivate when expected", () => {
    const onActivate = jest.fn();

    const wrapper = mountTree({
      expanded: new Set("ABCDEFGHIJKLMNO".split("")),
      focused: "A",
      onActivate
    });

    simulateKeyDown(wrapper, "Enter");
    expect(onActivate.mock.calls).toHaveLength(1);
    expect(onActivate.mock.calls[0][0]).toBe("A");

    simulateKeyDown(wrapper, "Enter");
    expect(onActivate.mock.calls).toHaveLength(2);
    expect(onActivate.mock.calls[1][0]).toBe("A");

    simulateKeyDown(wrapper, "ArrowDown");
    simulateKeyDown(wrapper, "Enter");
    expect(onActivate.mock.calls).toHaveLength(3);
    expect(onActivate.mock.calls[2][0]).toBe("B");

    wrapper.simulate("blur");
    simulateKeyDown(wrapper, "Enter");
    expect(onActivate.mock.calls).toHaveLength(3);
  });

  it("does not throw when onActivate is undefined and Enter is pressed", () => {
    const wrapper = mountTree({
      expanded: new Set("ABCDEFGHIJKLMNO".split("")),
      focused: "A"
    });

    simulateKeyDown(wrapper, "Enter");
  });

  it("ignores key strokes when pressing modifiers", () => {
    const wrapper = mountTree({
      expanded: new Set("ABCDEFGHIJKLMNO".split("")),
      focused: "L"
    });
    expect(formatTree(wrapper)).toMatchSnapshot();
    expect(wrapper.getDOMNode().getAttribute("aria-activedescendant")).toBe(
      "key-L"
    );
    expect(wrapper.find(".focused").prop("id")).toBe("key-L");

    const testKeys = [
      { key: "ArrowDown" },
      { key: "ArrowUp" },
      { key: "ArrowLeft" },
      { key: "ArrowRight" }
    ];
    const modifiers = [
      { altKey: true },
      { ctrlKey: true },
      { metaKey: true },
      { shiftKey: true }
    ];

    for (const key of testKeys) {
      for (const modifier of modifiers) {
        wrapper.simulate("keydown", Object.assign({}, key, modifier));
        expect(formatTree(wrapper)).toMatchSnapshot();
        expect(wrapper.getDOMNode().getAttribute("aria-activedescendant")).toBe(
          "key-L"
        );
      }
    }
  });

  it("renders arrows as expected when nodes are expanded", () => {
    const wrapper = mountTree({
      expanded: new Set("ABCDEFGHIJKLMNO".split(""))
    });
    expect(formatTree(wrapper)).toMatchSnapshot();

    getTreeNodes(wrapper).forEach(n => {
      if ("ABECDMN".split("").includes(getSanitizedNodeText(n))) {
        expect(n.find("img.arrow.expanded").exists()).toBe(true);
      } else {
        expect(n.find("img.arrow").exists()).toBe(false);
      }
    });
  });

  it("renders arrows as expected when nodes are collapsed", () => {
    const wrapper = mountTree();
    expect(formatTree(wrapper)).toMatchSnapshot();

    getTreeNodes(wrapper).forEach(n => {
      const arrow = n.find("img.arrow");
      expect(arrow.exists()).toBe(true);
      expect(arrow.hasClass("expanded")).toBe(false);
    });
  });

  it("uses isExpandable prop if it exists to render tree nodes", () => {
    const wrapper = mountTree({
      isExpandable: item => item === "A"
    });
    expect(formatTree(wrapper)).toMatchSnapshot();
  });

  it("adds the expected data-expandable attribute", () => {
    const wrapper = mountTree({
      isExpandable: item => item === "A"
    });
    const nodes = getTreeNodes(wrapper);
    expect(nodes.at(0).prop("data-expandable")).toBe(true);
    expect(nodes.at(1).prop("data-expandable")).toBe(false);
  });
});

function getTreeNodes(wrapper) {
  return wrapper.find(".tree-node");
}

function simulateKeyDown(wrapper, key) {
  wrapper.simulate("keydown", {
    key,
    preventDefault: () => {},
    stopPropagation: () => {}
  });
}

/*
 * Takes an Enzyme wrapper (obtained with mount/mount/…) and
 * returns a stringified version of the Tree, e.g.
 *
 *   ▼ A
 *   |   ▼ B
 *   |   |   ▼ E
 *   |   |   |   K
 *   |   |   |   L
 *   |   |   F
 *   |   |   G
 *   |   ▼ C
 *   |   |   H
 *   |   |   I
 *   |   ▼ D
 *   |   |   J
 *   ▼ M
 *   |   ▼ N
 *   |   |   O
 *
 */
function formatTree(wrapper) {
  const textTree = getTreeNodes(wrapper)
    .map(node => {
      const level = (node.prop("aria-level") || 1) - 1;
      const indentStr = "|  ".repeat(level);
      const arrow = node.find("img.arrow");
      let arrowStr = "  ";
      if (arrow.exists()) {
        arrowStr = arrow.hasClass("expanded") ? "▼ " : "▶︎ ";
      }

      return `${indentStr}${arrowStr}${getSanitizedNodeText(node)}`;
    })
    .join("\n");

  // Wrap in new lines so tree nodes are aligned as expected.
  return `\n${textTree}\n`;
}

function getSanitizedNodeText(node) {
  // Stripping off the invisible space used in the indent.
  return node.text().replace(/^\u200B+/, "");
}

// Encoding of the following tree/forest:
//
// A
// |-- B
// |   |-- E
// |   |   |-- K
// |   |   `-- L
// |   |-- F
// |   `-- G
// |-- C
// |   |-- H
// |   `-- I
// `-- D
//     `-- J
// M
// `-- N
//     `-- O
var TEST_TREE = {
  children: {
    A: ["B", "C", "D"],
    B: ["E", "F", "G"],
    C: ["H", "I"],
    D: ["J"],
    E: ["K", "L"],
    F: [],
    G: [],
    H: [],
    I: [],
    J: [],
    K: [],
    L: [],
    M: ["N"],
    N: ["O"],
    O: []
  },
  parent: {
    A: null,
    B: "A",
    C: "A",
    D: "A",
    E: "B",
    F: "B",
    G: "B",
    H: "C",
    I: "C",
    J: "D",
    K: "E",
    L: "E",
    M: null,
    N: "M",
    O: "N"
  }
};
