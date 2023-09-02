import * as vscode from "vscode";
import * as snippets from "./snippets";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "fresh-snippets.generateRoute",
    async (uri: vscode.Uri) => {
      const fileName = await vscode.window.showInputBox({
        prompt: "Enter file name",
        placeHolder: "index.tsx",
        value: "index.tsx",
      });

      const newFile = uri.fsPath + "/" + fileName;
      // check if file exists
      try {
        const fileExists = await vscode.workspace.fs.stat(
          vscode.Uri.file(newFile),
        );
        if (fileExists) {
          vscode.window.showErrorMessage("File already exists");
          return;
        }
      } catch (error) {
        // do nothing
      }

      vscode.workspace.fs.writeFile(
        vscode.Uri.file(newFile),
        new Uint8Array(Buffer.from([
          "import { defineRoute } from '$fresh/server.ts';",
          "",
          "export default defineRoute(async (req, ctx) => {",
          "	return (",
          "		<div></div>",
          "	);",
          "});",
        ].join("\n"))),
      );

      vscode.window.showInformationMessage("File Created");
    },
  );

  context.subscriptions.push(disposable);

  const provider1 = vscode.languages.registerCompletionItemProvider(
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

  context.subscriptions.push(provider1);
}

// This method is called when your extension is deactivated
export function deactivate() {}
