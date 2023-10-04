// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
  // @ts-ignore
  const vscode = acquireVsCodeApi();

  const queryEl = document.getElementById("query");
  const resultEl = document.getElementById("result");
  const setForm = document.getElementById("SetForm");
  if (!queryEl || !resultEl) {
    return;
  }
  if (!(queryEl instanceof HTMLButtonElement)) {
    return;
  }
  if (!(resultEl instanceof HTMLTextAreaElement)) {
    return;
  }

  window.addEventListener("message", (event) => {
    const message = event.data; // The json data that the extension sent
    switch (message.type) {
      case "setResult": {
        resultEl.value = message.result;
        break;
      }
    }
  });

  const updateResult = () => {
    vscode.postMessage({ type: "list" });
  };

  if (!(setForm instanceof HTMLFormElement)) {
    return;
  }
  setForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!(e.target instanceof HTMLFormElement)) {
      return;
    }
    const formData = new FormData(e.target);
    const key = formData.get("key");
    const value = formData.get("value");
    if (typeof key === "string" && typeof value === "string") {
      vscode.postMessage({ type: "set", key, value });
    }
  });

  queryEl.addEventListener("click", updateResult);
})();
