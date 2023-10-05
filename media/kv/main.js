// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
  let page = "list";

  // @ts-ignore
  const vscode = acquireVsCodeApi();

  const queryEl =
    /** @type {HTMLButtonElement} */
    (document.getElementById("PageList__Query"));
  const resultEl =
    /** @type {HTMLTextAreaElement} */ (document.getElementById("result"));
  const setForm =
    /** @type {HTMLFormElement} */ (document.getElementById("SetForm"));

  const navNewButtonEl =
    /** @type {HTMLButtonElement} */
    (document.getElementById("Nav__New"));

  const navListButtonEl =
    /** @type {HTMLButtonElement} */
    (document.getElementById("Nav__List"));

  navNewButtonEl.addEventListener("click", () => {
    navigateTo("new");
  });
  navListButtonEl.addEventListener("click", () => {
    navigateTo("list");
  });

  const pageListEl =
    /** @type {HTMLDivElement} */ (document.getElementById("PageList"));
  const pageUpdateEl =
    /** @type {HTMLDivElement} */ (document.getElementById("PageUpdate"));
  const pageNewEl =
    /** @type {HTMLDivElement} */ (document.getElementById("PageNew"));
  const pageDatabaseEl = /** @type {HTMLDivElement} */ (document.getElementById(
    "PageDatabase",
  ));

  function hideAllPage() {
    pageListEl.style.display = "none";
    pageUpdateEl.style.display = "none";
    pageNewEl.style.display = "none";
    pageDatabaseEl.style.display = "none";
  }

  function updateNav(page) {
    const navEl =
      /** @type {HTMLDivElement} */ (document.getElementById("Nav"));
    const navTitleEl =
      /** @type {HTMLDivElement} */ (document.getElementById("Nav__Title"));
    navListButtonEl.style.display = "none";

    if (page === "list") {
      navEl.style.display = "block";
      navTitleEl.innerText = "List All Items";
    }
    if (page === "update") {
      navEl.style.display = "block";
      navListButtonEl.style.display = "block";
      navTitleEl.innerText = "Update Item";
    }
    if (page === "new") {
      navEl.style.display = "block";
      navListButtonEl.style.display = "block";
      navTitleEl.innerText = "New Item";
    }
    if (page === "database") {
      navListButtonEl.style.display = "block";
      navEl.style.display = "none";
    }
  }

  function navigateTo(pageName) {
    page = pageName;
    hideAllPage();
    if (pageName === "list") {
      pageListEl.style.display = "block";
    }
    if (pageName === "update") {
      pageUpdateEl.style.display = "block";
    }
    if (pageName === "new") {
      pageNewEl.style.display = "block";
    }
    if (pageName === "database") {
      pageDatabaseEl.style.display = "block";
    }
    updateNav(pageName);
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

  navigateTo("list");
})();
