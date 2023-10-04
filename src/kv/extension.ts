// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import * as vscode from "vscode";
import { join } from "path";
import { KvViewProvider } from "./webview";

export function activate(context: vscode.ExtensionContext) {
  const webviewProvider = new KvViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "hashrock.deno.kvView",
      webviewProvider,
    ),
  );
}
