import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
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

        // a completion item that inserts its text as snippet,
        // the `insertText`-property is a `SnippetString` which will be
        // honored by the editor.
        const snippetCompletion = new vscode.CompletionItem(
          "Good part of the day",
        );
        snippetCompletion.insertText = new vscode.SnippetString(
          "Good ${1|morning,afternoon,evening|}. It is ${1}, right?",
        );
        const docs: any = new vscode.MarkdownString(
          "Inserts a snippet that lets you select [link](x.ts).",
        );
        snippetCompletion.documentation = docs;
        docs.baseUri = vscode.Uri.parse("http://example.com/a/b/c/");

        // return all completion items as array
        return [
          simpleRoute,
					customHandlers,
          snippetCompletion,
        ];
      },
    },
  );


  context.subscriptions.push(provider1);
}

// This method is called when your extension is deactivated
export function deactivate() {}
