// @flow

// React
import React, { Component } from "react";
import classnames from "classnames";

// Redux
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import {
  getShownSource,
  getSelectedSource,
  getDebuggeeUrl,
  getExpandedState
} from "../../selectors";
import actions from "../../actions";

// Types
import type { SourcesMap } from "../../reducers/types";
import type { SourceRecord } from "../../reducers/sources";

// Components
import ManagedTree from "../shared/ManagedTree";
import Svg from "../shared/Svg";

// Utils
import {
  nodeHasChildren,
  createParentMap,
  isDirectory,
  addToTree,
  collapseTree,
  createTree,
  getDirectories
} from "../../utils/sources-tree";
import { Set } from "immutable";
import { showMenu } from "devtools-launchpad";
import { copyToTheClipboard } from "../../utils/clipboard";
import { throttle } from "../../utils/utils";

type CreateTree = {
  focusedItem?: any,
  parentMap: any,
  sourceTree: any,
  uncollapsedTree: any,
  listItems?: any,
  highlightItems?: any
};

type Props = {
  sources: SourcesMap,
  selectSource: string => void,
  shownSource?: String,
  selectedSource?: SourceRecord,
  debuggeeUrl: String,
  setExpandedState: any => void,
  expanded?: any
};

class SourcesTree extends Component {
  props: Props;
  state: CreateTree;
  focusItem: Function;
  selectItem: Function;
  getIcon: Function;
  queueUpdate: Function;
  onContextMenu: Function;
  renderItem: Function;
  mounted: boolean;

  constructor(props) {
    super(props);
    this.state = createTree(this.props.sources, this.props.debuggeeUrl);
    this.focusItem = this.focusItem.bind(this);
    this.selectItem = this.selectItem.bind(this);
    this.getIcon = this.getIcon.bind(this);
    this.onContextMenu = this.onContextMenu.bind(this);
    this.renderItem = this.renderItem.bind(this);

    this.queueUpdate = throttle(function() {
      if (!this.mounted) {
        return;
      }

      this.forceUpdate();
    }, 50);
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnMount() {
    this.mounted = false;
  }

  shouldComponentUpdate() {
    this.queueUpdate();
    return false;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.debuggeeUrl !== nextProps.debuggeeUrl) {
      // Recreate tree because the sort order changed
      this.setState(createTree(nextProps.sources, nextProps.debuggeeUrl));
      return;
    }
    const { selectedSource } = this.props;
    if (
      nextProps.shownSource &&
      nextProps.shownSource != this.props.shownSource
    ) {
      const listItems = getDirectories(
        nextProps.shownSource,
        this.state.sourceTree
      );

      if (listItems && listItems[0]) {
        this.selectItem(listItems[0]);
      }

      return this.setState({ listItems });
    }

    if (
      nextProps.selectedSource &&
      nextProps.selectedSource != selectedSource
    ) {
      const highlightItems = getDirectories(
        nextProps.selectedSource.get("url"),
        this.state.sourceTree
      );

      return this.setState({ highlightItems });
    }

    if (nextProps.sources === this.props.sources) {
      return;
    }

    if (nextProps.sources.size === 0) {
      // remove all sources
      this.setState(createTree(nextProps.sources, this.props.debuggeeUrl));
      return;
    }

    // TODO: do not run this every time a source is clicked,
    // only when a new source is added
    const next = Set(nextProps.sources.valueSeq());
    const prev = Set(this.props.sources.valueSeq());
    const newSet = next.subtract(prev);

    const uncollapsedTree = this.state.uncollapsedTree;

    // TODO: recreating the tree every time messes with the expanded
    // state of ManagedTree, because it depends on item instances
    // being the same. The result is that if a source is added at a
    // later time, all expanded state is lost.
    let sourceTree = this.state.sourceTree;
    if (newSet.size > 0) {
      for (const source of newSet) {
        addToTree(uncollapsedTree, source, this.props.debuggeeUrl);
      }
      sourceTree = collapseTree(uncollapsedTree);
    }

    this.setState({
      uncollapsedTree,
      sourceTree,
      parentMap: createParentMap(sourceTree)
    });
  }

  focusItem(item) {
    this.setState({ focusedItem: item });
  }

  selectItem(item) {
    if (!nodeHasChildren(item)) {
      this.props.selectSource(item.contents.get("id"));
    }
  }

  getIcon(item, depth) {
    if (item.path === "/Webpack") {
      return <Svg name="webpack" />;
    }

    if (depth === 0) {
      return <Svg name="domain" />;
    }

    if (!nodeHasChildren(item)) {
      return <Svg name="file" />;
    }

    return <Svg name="folder" />;
  }

  onContextMenu(event, item) {
    const copySourceUri2Label = L10N.getStr("copySourceUri2");
    const copySourceUri2Key = L10N.getStr("copySourceUri2.accesskey");

    event.stopPropagation();
    event.preventDefault();

    const menuOptions = [];

    if (!isDirectory(item)) {
      const source = item.contents.get("url");

      const open = {
        id: "node-menu-open",
        label: "Open",
        disabled: false,
        click: () => this.selectItem(item)
      };

      const copySourceUri = {
        id: "node-menu-copy-source",
        label: copySourceUri2Label,
        accesskey: copySourceUri2Key,
        disabled: false,
        click: () => copyToTheClipboard(source)
      };

      menuOptions.push(open);
      menuOptions.push(copySourceUri);
    }

    showMenu(event, menuOptions);
  }

  renderItem(item, depth, focused, _, expanded, { setExpanded }) {
    const arrow = nodeHasChildren(item) ? (
      <img
        className={classnames("arrow", {
          expanded: expanded
        })}
        onClick={e => {
          e.stopPropagation();
          setExpanded(item, !expanded, e.altKey);
        }}
      />
    ) : (
      <i className="no-arrow" />
    );

    const icon = this.getIcon(item, depth);
    let paddingDir = "paddingRight";
    if (document.body && document.body.parentElement) {
      paddingDir =
        document.body.parentElement.dir == "ltr"
          ? "paddingLeft"
          : "paddingRight";
    }

    return (
      <div
        className={classnames("node", { focused })}
        style={{ [paddingDir]: `${depth * 15 + 5}px` }}
        key={item.path}
        onClick={e => {
          this.selectItem(item);
          setExpanded(item, !expanded, e.altKey);
        }}
        onContextMenu={e => this.onContextMenu(e, item)}
      >
        {arrow}
        {icon}
        <span className="label"> {item.name} </span>
      </div>
    );
  }

  render() {
    const { setExpandedState, expanded } = this.props;
    const {
      focusedItem,
      sourceTree,
      parentMap,
      listItems,
      highlightItems
    } = this.state;

    const isEmpty = sourceTree.contents.length === 0;
    const treeProps = {
      key: isEmpty ? "empty" : "full",
      getParent: item => parentMap.get(item),
      getChildren: item => (nodeHasChildren(item) ? item.contents : []),
      getRoots: () => sourceTree.contents,
      getPath: item => `${item.path}/${item.name}`,
      itemHeight: 21,
      autoExpandDepth: expanded ? 0 : 1,
      autoExpandAll: false,
      onFocus: this.focusItem,
      listItems,
      highlightItems,
      expanded,
      onExpand: (item, expandedState) => setExpandedState(expandedState),
      onCollapse: (item, expandedState) => setExpandedState(expandedState),
      renderItem: this.renderItem
    };

    const tree = <ManagedTree {...treeProps} />;

    if (isEmpty) {
      return (
        <div className="no-sources-message">
          {L10N.getStr("sources.noSourcesAvailable")}
        </div>
      );
    }

    const onKeyDown = e => {
      if (e.keyCode === 13 && focusedItem) {
        this.selectItem(focusedItem);
      }
    };

    return (
      <div className="sources-list" onKeyDown={onKeyDown}>
        {tree}
      </div>
    );
  }
}

export default connect(
  state => {
    return {
      shownSource: getShownSource(state),
      selectedSource: getSelectedSource(state),
      debuggeeUrl: getDebuggeeUrl(state),
      expanded: getExpandedState(state)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(SourcesTree);
