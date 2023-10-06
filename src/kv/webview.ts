// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import * as vscode from "vscode";
import fetch from "node-fetch";

export class KvViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _port: string,
  ) {}
  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext<unknown>,
    _token: vscode.CancellationToken,
  ): void | Thenable<void> {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,

      localResourceRoots: [
        this._extensionUri,
      ],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      const type = data.type; // list, get, set, database
      const key = data.key;
      const value = data.value;
      const database = data.database;

      const url = `http://localhost:${this._port}/`;
      const searchParams = new URLSearchParams("");
      if (type) {
        searchParams.set("type", type);
      }
      if (key) {
        searchParams.set("key", key);
      }
      if (value) {
        searchParams.set("value", value);
      }
      if (type === "changeDatabase") {
        const db = await vscode.window.showInputBox({
          prompt:
            "Enter KV database file path / URL / UUID (Empty to use default))",
          value: database,
        });
        if (db === undefined) {
          return;
        } else {
          searchParams.set("database", db);
        }
      }

      const fetchUrl = url + "?" + searchParams.toString();
      const response = await fetch(fetchUrl);
      if (!response.ok) {
        vscode.window.showErrorMessage(`KV Viewer: ${response.statusText}`);
        return;
      }
      const result = await response.json();

      if (type === "list") {
        webviewView.webview.postMessage({
          type: "listResult",
          result: result,
        });
      }
      if (type === "set") {
        webviewView.webview.postMessage({
          type: "setResult",
          result: result.result,
        });
      }
      if (type === "get") {
        webviewView.webview.postMessage({
          type: "getResult",
          result: result,
        });
      }
      if (type === "changeDatabase") {
        webviewView.webview.postMessage({
          type: "changeDatabaseResult",
          result: result.result,
          database: result.database,
        });
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    const subFolder = "kv";
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "media",
        subFolder,
        "main.js",
      ),
    );

    // Do the same for the stylesheet.
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "media",
        subFolder,
        "vscode.css",
      ),
    );
    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "media",
        subFolder,
        "main.css",
      ),
    );

    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading styles from our extension directory,
					and only allow scripts that have a specific nonce.
					(See the 'webview-sample' extension sample for img-src content security policy examples)
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">

				<title>Fresh URL Matcher</title>
			</head>
			<body>
        <div id="app">
        </div>

				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}

function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
