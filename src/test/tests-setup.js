global.Worker = require("workerjs");

import path from "path";
import getConfig from "../../bin/getConfig";
import { setConfig } from "devtools-config";
import { readFileSync } from "fs";
const rootPath = path.join(__dirname, "../../");

const envConfig = getConfig();
const config = Object.assign({}, envConfig, {
  workers: {
    sourceMapURL: path.join(
      rootPath,
      "node_modules/devtools-source-map/src/worker.js"
    ),
    parserURL: path.join(rootPath, "src/utils/parser/worker.js"),
    prettyPrintURL: path.join(rootPath, "src/utils/pretty-print/worker.js")
  }
});

global.DebuggerConfig = config;

global.L10N = require("devtools-launchpad").L10N;
global.L10N.setBundle(readFileSync("./assets/panel/debugger.properties"));

setConfig(config);
