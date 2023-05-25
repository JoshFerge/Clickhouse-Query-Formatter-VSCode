// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
const { exec } = require("child_process");

async function installClickhouse(path: string) {
  return new Promise((resolve, reject) => {
    exec(
      `[ -f "${path}/clickhouse" ] && exit 0 || cd ${path} && curl https://clickhouse.com/ | sh`,
      // @ts-ignore
      (error, stdout, stderr) => {
        if (error) {
          vscode.window.showErrorMessage(
            `Error installing clickhouse: ${stderr}`
          );
          return;
        }
        console.log(
          'Installed Clickhouse, your extension "clickhouse-query-formatter" is now active!'
        );
        resolve("ok");
      }
    );
  });
}

async function formatQuery(editor: vscode.TextEditor, extensionPath: string) {
  const document = editor.document;
  const text = document.getText();
  const command = `${extensionPath}/clickhouse format --query "${text}"`;

  // @ts-ignore
  exec(command, (error, stdout, stderr) => {
    if (error) {
      vscode.window.showErrorMessage(`Error formatting query: ${stderr}`);
      return;
    }

    const fullRange = new vscode.Range(
      document.positionAt(0),
      document.positionAt(text.length)
    );

    editor.edit((editBuilder) => {
      editBuilder.replace(fullRange, stdout);
      vscode.window.showInformationMessage("Formatted Clickhouse Query");
    });
  });
}

export async function activate(context: vscode.ExtensionContext) {
  await installClickhouse(context.extensionPath);

  const disposable = vscode.commands.registerCommand(
    "clickhouse-query-formatter.formatClickhouseQuery",
    async () => {
      const editor = vscode.window.activeTextEditor;

      if (editor) {
        await formatQuery(editor, context.extensionPath);
      }
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
