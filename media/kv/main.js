/* eslint-disable @typescript-eslint/naming-convention */
// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () {
  let page = "list";

  // @ts-ignore
  const vscode = acquireVsCodeApi();

  // @ts-ignore
  let React = window.React;
  // @ts-ignore
  let ReactDOM = window.ReactDOM;
  const h = React.createElement;
  // @ts-ignore
  let cx = window.classNames;

  function PageGet(props) {
    const selectedKey = props.selectedKey;
    const eventRef = React.useRef(null);
    const [value, setValue] = React.useState(null);
    const [versionstamp, setVersionstamp] = React.useState(null);

    React.useEffect(() => {
      if (selectedKey) {
        vscode.postMessage({ type: "get", key: selectedKey });
      }
      eventRef.current = (event) => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
          case "getResult": {
            setValue(message.result.value);
            setVersionstamp(message.result.versionstamp);
            break;
          }
        }
      };
      window.addEventListener("message", eventRef.current);
    }, []);

    return h("div", {}, [
      h("div", {
        className: "label",
      }, "Key"),
      h("div", {
        className: "get__key",
      }, selectedKey),
      h("div", {
        className: "label",
      }, "Value"),
      h("div", {
        className: "get__value",
      }, value),
      h("div", {
        className: "label",
      }, "VersionStamp"),
      h("div", {
        className: "get__versionstamp",
      }, versionstamp),
    ]);
  }

  function PageNew() {
    const eventRef = React.useRef(null);
    const [message, setMessage] = React.useState(null);

    React.useEffect(() => {
      eventRef.current = (event) => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
          case "setResult": {
            console.log("message", message);
            if (message.result === "OK") {
              setMessage("The item set successfully : " + new Date());
            }
            break;
          }
        }
      };
      window.addEventListener("message", eventRef.current);

      return () => {
        window.removeEventListener("message", eventRef.current);
      };
    }, []);

    return h("div", {}, [
      PageNewForm(),
      message && h("div", {
        className: "message",
      }, message),
    ]);
  }

  function PageNewForm(props) {
    const keyRef = React.useRef(null);
    const valueRef = React.useRef(null);

    return h("form", {
      className: "newform__wrapper",
      onSubmit: (e) => {
        e.preventDefault();
        const key = keyRef.current.value;
        const value = valueRef.current.value;
        console.log("key", key);
        console.log("value", value);
        vscode.postMessage({ type: "set", key, value });
      },
    }, [
      h("input", {
        className: "newform__key",
        name: "key",
        ref: keyRef,
        type: "text",
        placeholder: "Key",
      }),
      h("input", {
        className: "newform__value",
        ref: valueRef,
        type: "text",
        placeholder: "Value",
      }),
      h("button", {
        className: "newform__submit",
        type: "submit",
      }, "Set"),
    ]);
  }

  function PageListForm(props) {
    const searchKeyRef = React.useRef(null);

    return h("form", {
      className: "form__wrapper",
      onSubmit: (e) => {
        e.preventDefault();
        const searchKey = searchKeyRef.current.value;
        console.log("searchKey", searchKey);
        vscode.postMessage({ type: "list", key: searchKey });
      },
    }, [
      h("input", {
        className: "form__query",
        ref: searchKeyRef,
        type: "text",
        placeholder: "Search",
      }),
      h("button", {
        className: "form__submit",
        type: "submit",
      }, "Search"),
    ]);
  }
  function PageListResult(props) {
    const items = props.items;
    return h(
      "div",
      {
        className: "result",
      },
      items.map((item) => {
        return h("div", {
          className: "result__item",
          onClick: () => {
            props.onChangeSelectedKey(item.key.join(","));
          },
        }, item.key.join(","));
      }),
    );
  }

  function PageList(props) {
    const eventRef = React.useRef(null);
    const [items, setItems] = React.useState([]);

    React.useEffect(() => {
      eventRef.current = (event) => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
          case "listResult": {
            setItems(message.result);
            break;
          }
        }
      };
      window.addEventListener("message", eventRef.current);

      // inital load
      vscode.postMessage({ type: "list", key: "" });

      return () => {
        window.removeEventListener("message", eventRef.current);
      };
    }, []);

    return h("div", {}, [
      PageListForm(),
      PageListResult({
        items,
        onChangeSelectedKey: (key) => {
          props.onChangeSelectedKey(key);
        },
      }),
    ]);
  }

  function NavItem(props) {
    return h("button", {
      className: cx("nav__item", props.selected && "nav__item--selected"),
      onClick: props.onClick,
    }, props.children);
  }

  function Nav(props) {
    const { page } = props;
    return h("div", {
      className: "nav",
    }, [
      h(NavItem, {
        selected: page === "list",
        onClick: () => {
          props.onChangePage("list");
        },
      }, "List"),
      h(NavItem, {
        selected: page === "new",
        onClick: () => {
          props.onChangePage("new");
        },
      }, "New"),
      h(NavItem, {
        selected: page === "get",
        onClick: () => {
          props.onChangePage("get");
        },
      }, "Get"),
    ]);
  }

  function Page() {
    const [page, setPage] = React.useState("list");
    const [selectedKey, setSelectedKey] = React.useState(null);

    return h("div", {}, [
      h(Nav, {
        page,
        onChangePage: (page) => {
          setPage(page);
        },
      }),
      page === "list" && h(PageList, {
        selectedKey,
        onChangeSelectedKey: (key) => {
          setSelectedKey(key);
          setPage("get");
        },
      }),
      page === "new" && h(PageNew, {}),
      page === "get" && h(PageGet, {
        selectedKey,
        onChangeSelectedKey: (key) => {
          setSelectedKey(key);
        },
      }),
    ]);
  }

  ReactDOM.render(
    h(Page, {}),
    document.getElementById("app"),
  );

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

  // navNewButtonEl.addEventListener("click", () => {
  //   navigateTo("new");
  // });
  // navListButtonEl.addEventListener("click", () => {
  //   navigateTo("list");
  // });

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

  // searchFormEl.addEventListener("submit", updateListResult);
  // navigateTo(page);

  // window.addEventListener("message", (event) => {
  //   const message = event.data; // The json data that the extension sent
  //   switch (message.type) {
  //     case "listResult": {
  //       updateList(JSON.parse(message.result));
  //       break;
  //     }
  //     case "setResult": {
  //       resultEl.value = message.result;
  //       break;
  //     }
  //   }
  // });

  // function updateListResult(e) {
  //   e.preventDefault();
  //   const searchKey = searchKeyEl.value;
  //   vscode.postMessage({ type: "list", key: searchKey });
  // }

  // if (!(setForm instanceof HTMLFormElement)) {
  //   return;
  // }
  // setForm.addEventListener("submit", (e) => {
  //   e.preventDefault();
  //   if (!(e.target instanceof HTMLFormElement)) {
  //     return;
  //   }
  //   const formData = new FormData(e.target);
  //   const key = formData.get("key");
  //   const value = formData.get("value");
  //   if (typeof key === "string" && typeof value === "string") {
  //     vscode.postMessage({ type: "set", key, value });
  //   }
  // });
})();
