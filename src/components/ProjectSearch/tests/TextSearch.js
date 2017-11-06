/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import React from "react";
import { shallow } from "enzyme";
import TextSearch from "../TextSearch.js";

function render(overrides = {}) {
  const defaultProps = {
    sources: {},
    results: [],
    query: "foo",
    closeActiveSearch: jest.fn(),
    searchSources: jest.fn(),
    selectSource: jest.fn()
  };
  const props = Object.assign({}, defaultProps, overrides);

  const component = shallow(<TextSearch {...props} />);
  return component;
}

describe("TextSearch", () => {
  it("where <Enter> has not been pressed", () => {
    const component = render({
      query: ""
    });
    expect(component).toMatchSnapshot();
  });

  it("found no search results", () => {
    const component = render();
    expect(component).toMatchSnapshot();
  });

  it("found search results", () => {
    const component = render({
      query: "match",
      results: [
        {
          filepath: "testFilePath1",
          matches: ["match1", "match2", "match3"]
        },
        {
          filepath: "testFilePath2",
          matches: ["match4", "match5"]
        }
      ]
    });
    expect(component).toMatchSnapshot();
  });
});
