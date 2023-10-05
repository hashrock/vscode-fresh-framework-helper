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
      if (database) {
        searchParams.set("database", database);
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
    const reactScriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "media",
        subFolder,
        "react.min.js",
      ),
    );
    const reactDomScriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "media",
        subFolder,
        "react-dom.min.js",
      ),
    );
    const classNamesScriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "media",
        subFolder,
        "classnames.js",
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
        <svg xmlns="http://www.w3.org/2000/svg" display="none" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <symbol id="icon-database">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <path d="M12 6m-8 0a8 3 0 1 0 16 0a8 3 0 1 0 -16 0"></path>
            <path d="M4 6v6a8 3 0 0 0 16 0v-6"></path>
            <path d="M4 12v6a8 3 0 0 0 16 0v-6"></path>
          </symbol>
        </svg>

        <div id="app">
        </div>
				<script nonce="${nonce}" src="${reactScriptUri}"></script>
				<script nonce="${nonce}" src="${reactDomScriptUri}"></script>
        <script nonce="${nonce}" src="${classNamesScriptUri}"></script>
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
