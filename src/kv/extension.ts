// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import * as vscode from "vscode";
import { join } from "path";
import { KvViewProvider } from "./webview";
import { ChildProcess } from "child_process";

let process: ChildProcess | null = null;
let outputChannel: vscode.OutputChannel | null = null;

export function activate(context: vscode.ExtensionContext) {
  const webviewProvider = new KvViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "hashrock.deno.kvView",
      webviewProvider,
    ),
  );

  // create output channel
  outputChannel = vscode.window.createOutputChannel("kvViewer");
  context.subscriptions.push(outputChannel);
  outputChannel.appendLine("kvViewer activate");
  console.log("kvViewer activate");

  console.log(__dirname, "server.ts");

  const serverSrc = vscode.Uri.joinPath(
    context.extensionUri,
    "scripts",
    "kv",
    "server.ts",
  );

  process = require("child_process").spawn(
    "deno",
    ["run", "-A", serverSrc.path],
  );

  process?.stdout?.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  process?.stderr?.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  process?.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
  });
}

export function deactivate() {
  console.log("kvViewer deactivate");

  if (process) {
    process.kill();
    process = null;
  }
  if (outputChannel) {
    outputChannel.appendLine("kvViewer deactivate");
  }
}
