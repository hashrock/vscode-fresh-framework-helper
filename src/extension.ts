import * as vscode from "vscode";
import * as snippets from "./snippets";
import { generateFile } from "./generate";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "fresh-snippets.generateRoute",
    generateFile,
  );

  context.subscriptions.push(disposable);

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
}

// This method is called when your extension is deactivated
export function deactivate() {}
