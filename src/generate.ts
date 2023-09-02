import * as vscode from "vscode";

export const generateFile = async (uri: vscode.Uri) => {
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
};
