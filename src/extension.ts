import * as vscode from "vscode";
import * as snippets from "./snippets";
import {
  generateComponent,
  generateIsland,
  generateLayout,
  generateRoute,
} from "./generate";
import { FreshRouteViewProvider } from "./webview";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(
    "fresh-snippets.generateRoute",
    generateRoute,
  ));

  context.subscriptions.push(vscode.commands.registerCommand(
    "fresh-snippets.generateLayout",
    generateLayout,
  ));

  context.subscriptions.push(vscode.commands.registerCommand(
    "fresh-snippets.generateComponent",
    generateComponent,
  ));

  context.subscriptions.push(vscode.commands.registerCommand(
    "fresh-snippets.generateIsland",
    generateIsland,
  ));

  const provider = vscode.languages.registerCompletionItemProvider(
    "typescriptreact",
    {
      provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext,
      ) {
        return [
          snippets.simpleRoute,
          snippets.customHandlers,
          snippets.layout,
          snippets.defineRoute,
          snippets.defineLayout,
        ];
      },
    },
  );

  context.subscriptions.push(provider);

  const webviewProvider = new FreshRouteViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "fresh-snippets.routeView",
      webviewProvider,
    ),
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
