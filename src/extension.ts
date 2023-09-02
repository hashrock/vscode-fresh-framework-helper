import * as vscode from "vscode";

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
        const simpleRoute = new vscode.CompletionItem("Fresh - Simple Route");
        simpleRoute.insertText = new vscode.SnippetString(
          [
            "export default function ${1:Page}(props: PageProps) {",
            "	return (",
            "		<main>",
            "			<h1>About</h1>",
            "			<p>This is the about page.</p>",
            "		</main>",
            "	);",
            "});",
          ].join("\n"),
        );

        const customHandlers = new vscode.CompletionItem(
          "Fresh - Custom Handlers",
        );
        customHandlers.insertText = new vscode.SnippetString([
          "export const handler: Handlers = {",
          "	async GET(_req, ctx) {",
          "    return await ctx.render();",
          "  },",
          "};",
        ].join("\n"));

        const layout = new vscode.CompletionItem(
          "Fresh - Layouts",
        );

        layout.insertText = new vscode.SnippetString([
          "export default function Layout({ Component, state }: LayoutProps) {",
          "	// do something with state here",
          "	return (",
          '		<div class="layout">',
          "			<Component />",
          "		</div>",
          "	);",
          "}",
        ].join("\n"));

        const defineRoute = new vscode.CompletionItem(
          "Fresh - Define Route",
        );
        defineRoute.insertText = new vscode.SnippetString([
          "export default defineRoute(async (req, ctx) => {",
          "	return (",
          "		<div></div>",
          "	);",
          "});",
        ].join("\n"));

        const defineLayout = new vscode.CompletionItem(
          "Fresh - Define Layout",
        );
        defineLayout.insertText = new vscode.SnippetString([
          "export default defineLayout(async (req, ctx) => {",
          "	return (",
          "		<div>",
          "			<ctx.Component />",
          "		</div>",
          "	);",
          "});",
        ].join("\n"));

        return [
          simpleRoute,
          customHandlers,
          layout,
          defineRoute,
          defineLayout,
        ];
      },
    },
  );

  context.subscriptions.push(provider1);
}

// This method is called when your extension is deactivated
export function deactivate() {}
