import * as vscode from "vscode";
import { getAllRoutes } from "./getRoutes";

export class FreshRouteViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  constructor(
    private readonly _extensionUri: vscode.Uri,
  ) {}
  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext<unknown>,
    token: vscode.CancellationToken,
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
      switch (data.type) {
        case "colorSelected": {
          vscode.window.activeTextEditor?.insertSnippet(
            new vscode.SnippetString(`#${data.value}`),
          );
          break;
        }
        case "update": {
          const routes = await getAllRoutes();
          webviewView.webview.postMessage({
            type: "setRoutes",
            value: routes,
          });
          break;
        }
        case "open": {
          // open in editor
          const projectPath = vscode.workspace.workspaceFolders?.[0].uri;
          if (!projectPath) {
            return;
          }
          const uri = vscode.Uri.joinPath(projectPath, data.value);

          const doc = await vscode.workspace.openTextDocument(uri);
          await vscode.window.showTextDocument(doc);

          break;
        }
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "main.js"),
    );

    // Do the same for the stylesheet.
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css"),
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css"),
    );
    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "main.css"),
    );

    const nonce = "Hogehoge";

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

				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">

				<title>Fresh URL Matcher</title>
			</head>
			<body>
        <svg viewBox="0 0 24 25" fill="none" display="none" xmlns="http://www.w3.org/2000/svg">
          <symbol id="icon-path">
            <path opacity="0.5" fill-rule="evenodd" clip-rule="evenodd" d="M12 2.5C10.284 2.5 8.904 3.88 6.142 6.642C3.381 9.404 2 10.784 2 12.5C2 14.216 3.38 15.596 6.142 18.358C8.904 21.119 10.284 22.5 12 22.5C13.716 22.5 15.096 21.12 17.858 18.358C20.619 15.596 22 14.216 22 12.5C22 10.784 20.62 9.404 17.858 6.642C15.096 3.881 13.716 2.5 12 2.5Z" fill="#61FF97"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12.786 8.98701C12.9221 8.84195 13.1102 8.75688 13.309 8.75051C13.5077 8.74413 13.7009 8.81697 13.846 8.95301L16.513 11.453C16.5878 11.5232 16.6474 11.6079 16.6881 11.702C16.7289 11.796 16.7499 11.8975 16.7499 12C16.7499 12.1025 16.7289 12.204 16.6881 12.2981C16.6474 12.3921 16.5878 12.4769 16.513 12.547L13.846 15.047C13.7003 15.1796 13.5083 15.2496 13.3115 15.2419C13.1146 15.2341 12.9288 15.1492 12.794 15.0055C12.6592 14.8618 12.5864 14.6709 12.5913 14.4739C12.5962 14.277 12.6783 14.0899 12.82 13.953L14.103 12.75H10.667C10.333 12.75 9.822 12.85 9.42 13.122C9.057 13.367 8.75 13.765 8.75 14.5C8.75 14.6989 8.67098 14.8897 8.53033 15.0303C8.38968 15.171 8.19891 15.25 8 15.25C7.80109 15.25 7.61032 15.171 7.46967 15.0303C7.32902 14.8897 7.25 14.6989 7.25 14.5C7.25 13.235 7.832 12.383 8.58 11.878C9.289 11.4 10.112 11.25 10.667 11.25H14.103L12.82 10.047C12.6749 9.91094 12.5899 9.72283 12.5835 9.52405C12.5771 9.32527 12.65 9.13209 12.786 8.98701Z" fill="#61FF97"/>
          </symbol>
        </svg>
    
        <input type="text" class="path-input" placeholder="Enter a URL">

        <ul class="route-list">
				</ul>

				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}
