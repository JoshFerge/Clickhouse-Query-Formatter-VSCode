// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
const { exec } = require("child_process");

async function installClickhouse(path: string) {
  return new Promise((resolve, reject) => {
    console.log(path);
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

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  await installClickhouse(context.extensionPath);
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "clickhouse-query-formatter.formatClickhouseQuery",
    async () => {
      const editor = vscode.window.activeTextEditor; // The code you place here will be executed every time your command is executed
      if (editor) {
        const document = editor.document;
        const text = document.getText();

        exec(
          `${context.extensionPath}/clickhouse format --query "${text}"`,
          // @ts-ignore
          (error, stdout, stderr) => {
            if (error) {
              vscode.window.showErrorMessage(
                `Error formatting query: ${stderr}`
              );
              return;
            }

            editor.edit((editBuilder) => {
              const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(text.length)
              );

              editBuilder.replace(fullRange, stdout);
              vscode.window.showInformationMessage(
                "Formatted Clickhouse Query"
              );
            });
          }
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
