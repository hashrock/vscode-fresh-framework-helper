// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import * as vscode from "vscode";
import { join } from "path";
import { KvViewProvider } from "./webview";

let process = null;

export function activate(context: vscode.ExtensionContext) {
  const webviewProvider = new KvViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "hashrock.deno.kvView",
      webviewProvider,
    ),
  );

  // process = require("child_process").spawn(
  //   "deno",
  //   ["run", "--allow-net", "--allow-env", join(__dirname, "server.ts")],
  // );
}

export function deactivate() {
}
