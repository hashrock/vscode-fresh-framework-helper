import * as vscode from "vscode";
import * as freshExtension from "./fresh/extension";

export function activate(context: vscode.ExtensionContext) {
  freshExtension.activate(context);
}

// This method is called when your extension is deactivated
export function deactivate() {}
