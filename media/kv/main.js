// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () {
  let page = "list";

  // @ts-ignore
  const vscode = acquireVsCodeApi();

  // PageList__Search
  const searchFormEl =
    /** @type {HTMLFormElement} */
    (document.getElementById("PageList__Search"));

  const updateListButtonEl =
    /** @type {HTMLButtonElement} */
    (document.getElementById("PageList__UpdateList"));

  const searchKeyEl =
    /** @type {HTMLInputElement} */
    (document.getElementById("PageList__SearchKey"));

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
  const pageListResultEl =
    /** @type {HTMLDivElement} */ (document.getElementById(
      "PageList__Result",
    ));

  const pageUpdateEl =
    /** @type {HTMLDivElement} */ (document.getElementById("PageUpdate"));
  const pageNewEl =
    /** @type {HTMLDivElement} */ (document.getElementById("PageNew"));
  const pageDatabaseEl = /** @type {HTMLDivElement} */ (document.getElementById(
    "PageDatabase",
  ));
  const navEl = /** @type {HTMLDivElement} */ (document.getElementById("Nav"));
  const navTitleEl =
    /** @type {HTMLDivElement} */ (document.getElementById("Nav__Title"));

  function hideAllPage() {
    pageListEl.style.display = "none";
    pageUpdateEl.style.display = "none";
    pageNewEl.style.display = "none";
    pageDatabaseEl.style.display = "none";
    navListButtonEl.style.display = "none";
  }

  /**
   * @param {Array} items
   */
  function updateList(items) {
    pageListResultEl.innerText = "";
    for (const item of items) {
      const itemEl = document.createElement("div");
      itemEl.setAttribute("class", "PageList__Result__Item");
      itemEl.innerText = item.key.join(",");
      pageListResultEl.appendChild(itemEl);
    }
  }

  function updateNav(page) {
    if (page === "list") {
      navEl.style.display = "flex";
      navListButtonEl.style.display = "none";
      navTitleEl.innerText = "List All Items";
    }
    if (page === "update") {
      navEl.style.display = "flex";
      navListButtonEl.style.display = "block";
      navTitleEl.innerText = "Update Item";
    }
    if (page === "new") {
      navEl.style.display = "flex";
      navListButtonEl.style.display = "block";
      navTitleEl.innerText = "New Item";
    }
    if (page === "database") {
      // TODO
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

  searchFormEl.addEventListener("submit", updateListResult);
  navigateTo(page);

  window.addEventListener("message", (event) => {
    const message = event.data; // The json data that the extension sent
    switch (message.type) {
      case "listResult": {
        updateList(JSON.parse(message.result));
        break;
      }
      case "setResult": {
        resultEl.value = message.result;
        break;
      }
    }
  });

  function updateListResult(e) {
    e.preventDefault();
    const searchKey = searchKeyEl.value;
    vscode.postMessage({ type: "list", key: searchKey });
  }

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
})();
