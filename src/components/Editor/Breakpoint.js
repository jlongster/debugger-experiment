/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import { Component } from "react";
import { toEditorLine } from "../../utils/monaco";
import { BREAKPOINT_DECORATION } from "../../utils/monaco/source-editor";

type Props = {
  breakpoint: Object,
  selectedSource: Object,
  editor: Object
};

function getBreakpoinkDecorationOption(disabled, condition) {
  if (disabled) {
    if (condition) {
      return BREAKPOINT_DECORATION.DISABLED_CONDITION;
    }

    return BREAKPOINT_DECORATION.DISABLED;
  }

  if (condition) {
    return BREAKPOINT_DECORATION.CONDITION;
  }

  return BREAKPOINT_DECORATION.DEFAULT;
}

class Breakpoint extends Component<Props> {
  addBreakpoint: Function;
  breakpointGutterDecoration: string;

  constructor() {
    super();
    this.breakpointGutterDecoration = "";
  }

  addBreakpoint = () => {
    const { breakpoint, editor, selectedSource } = this.props;

    // Hidden Breakpoints are never rendered on the client
    if (breakpoint.hidden) {
      return;
    }

    // NOTE: we need to wait for the breakpoint to be loaded
    // to get the generated location
    if (!selectedSource || breakpoint.loading) {
      return;
    }

    const sourceId = selectedSource.get("id");
    const line = toEditorLine(sourceId, breakpoint.location.line);

    const newDecoration = {
      options: getBreakpoinkDecorationOption(
        breakpoint.disabled,
        breakpoint.condition
      ),
      range: {
        startLineNumber: line,
        startColumn: 1,
        endLineNumber: line,
        endColumn: 1
      }
    };

    this.breakpointGutterDecoration = editor.monaco.deltaDecorations(
      [this.breakpointGutterDecoration],
      [newDecoration]
    );
  };

  shouldComponentUpdate(nextProps: any) {
    const { editor, breakpoint, selectedSource } = this.props;
    return (
      editor !== nextProps.editor ||
      breakpoint.disabled !== nextProps.breakpoint.disabled ||
      breakpoint.hidden !== nextProps.breakpoint.hidden ||
      breakpoint.condition !== nextProps.breakpoint.condition ||
      breakpoint.loading !== nextProps.breakpoint.loading ||
      selectedSource !== nextProps.selectedSource
    );
  }

  componentDidMount() {
    this.addBreakpoint();
  }

  componentDidUpdate() {
    this.addBreakpoint();
  }

  componentWillUnmount() {
    const { editor, breakpoint, selectedSource } = this.props;

    if (!selectedSource) {
      return;
    }

    if (breakpoint.loading) {
      return;
    }

    editor.monaco.deltaDecorations([this.breakpointGutterDecoration], []);
  }

  render() {
    return null;
  }
}

export default Breakpoint;
