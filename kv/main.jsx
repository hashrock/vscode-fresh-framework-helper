import * as React from "react";
import * as ReactDOM from "react-dom";
import cx from "classnames";

// @ts-check

/* eslint-disable @typescript-eslint/naming-convention */
// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () {
  // @ts-ignore
  const vscode = acquireVsCodeApi();

  function PageGet(props) {
    const selectedKey = props.selectedKey;
    const eventRef = React.useRef(null);
    const eventUpdateRef = React.useRef(null);
    const [value, setValue] = React.useState(null);
    const [versionstamp, setVersionstamp] = React.useState(null);
    const [message, setMessage] = React.useState(null);

    React.useEffect(() => {
      eventUpdateRef.current = (event) => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
          case "setResult": {
            console.log("message", message);
            if (message.result === "OK") {
              setMessage("The item set successfully : " + new Date());
              vscode.postMessage({ type: "get", key: selectedKey });
            }
            break;
          }
        }
      };
      window.addEventListener("message", eventUpdateRef.current);

      return () => {
        window.removeEventListener("message", eventUpdateRef.current);
      };
    }, []);

    React.useEffect(() => {
      if (selectedKey) {
        vscode.postMessage({ type: "get", key: selectedKey });
      }
      eventRef.current = (event) => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
          case "getResult": {
            setValue(JSON.stringify(message.result.value, null, 2));
            setVersionstamp(message.result.versionstamp);
            break;
          }
        }
      };
      window.addEventListener("message", eventRef.current);
    }, []);

    return (
      <div className="get__wrapper">
        <div className="label">Key</div>
        <div className="get__key">{JSON.stringify(selectedKey)}</div>
        <div className="label">Value</div>
        <div className="get__value__wrapper">
          <textarea
            className="get__value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <button
          className="get__update"
          onClick={() =>
            vscode.postMessage({ type: "set", key: selectedKey, value })
          }
        >
          Update
        </button>
        <div className="label">{message}</div>
        <div className="label">VersionStamp</div>
        <div className="get__versionstamp">{versionstamp}</div>
      </div>
    );
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

    return (
      <div className="new__wrapper">
        {PageNewForm()}
        {message && <div className="message">{message}</div>}
      </div>
    );
  }

  function PageNewForm() {
    const keyRef = React.useRef(null);
    const valueRef = React.useRef(null);

    return (
      <form
        className="newform__wrapper"
        onSubmit={(e) => {
          e.preventDefault();
          const key = keyRef.current.value;
          const value = valueRef.current.value;
          vscode.postMessage({ type: "set", key, value });
        }}
      >
        <input
          className="newform__key"
          name="key"
          ref={keyRef}
          type="text"
          placeholder="Key"
        />
        <input
          className="newform__value"
          ref={valueRef}
          type="text"
          placeholder="Value"
        />
        <button className="newform__submit" type="submit">
          Set
        </button>
      </form>
    );
  }

  function PageListForm(props) {
    const searchKeyRef = React.useRef(null);

    return (
      <form
        className="form__wrapper"
        onSubmit={(e) => {
          e.preventDefault();
          const searchKey = searchKeyRef.current.value;
          props.onSubmit(searchKey);
        }}
      >
        <input
          className="form__query"
          ref={searchKeyRef}
          type="text"
          placeholder="Search"
        />
        <button className="form__submit" type="submit">
          {props.isBusy ? "Searching..." : "Search"}
        </button>
      </form>
    );
  }

  function PageListResultItem(props) {
    const item = props.item;

    return (
      <div
        className="result__item"
        onClick={() => {
          props.onChangeSelectedKey(item.key.join(","));
        }}
      >
        <div className="result__item__key">
          {item.key.map((i) => JSON.stringify(i)).join(",")}
        </div>
        <div className="result__item__value">{JSON.stringify(item.value)}</div>
      </div>
    );
  }

  function PageListResult(props) {
    const items = props.items;

    return (
      <div className="result">
        {items.length === 0 && (
          <div className="result__empty">No items found</div>
        )}
        {items.map((item) => (
          <PageListResultItem
            item={item}
            onChangeSelectedKey={(key) => props.onChangeSelectedKey(key)}
          />
        ))}
      </div>
    );
  }

  function PageList(props) {
    const eventRef = React.useRef(null);
    const [items, setItems] = React.useState([]);
    const [isBusy, setIsBusy] = React.useState(false);

    React.useEffect(() => {
      eventRef.current = (event) => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
          case "listResult": {
            setItems(message.result);
            setIsBusy(false);
            break;
          }
        }
      };
      window.addEventListener("message", eventRef.current);

      // initial lPd
      vscode.postMessage({ type: "list", key: "" });
      setIsBusy(true);

      return () => {
        window.removeEventListener("message", eventRef.current);
      };
    }, []);

    React.useEffect(() => {
      vscode.postMessage({ type: "list", key: "" });
    }, [props.database]);

    return (
      <div className="result__wrapper">
        <PageListForm
          onSubmit={(key) => {
            vscode.postMessage({ type: "list", key });
          }}
          isBusy={isBusy}
        />
        <PageListResult
          items={items}
          onChangeSelectedKey={(key) => props.onChangeSelectedKey(key)}
        />
      </div>
    );
  }

  function NavItem(props) {
    return (
      <button
        className={cx("nav__item", props.selected && "nav__item--selected")}
        onClick={props.onClick}
      >
        {props.children}
      </button>
    );
  }
  function Nav(props) {
    const { page } = props;

    return (
      <div className="nav">
        <NavItem
          selected={page === "list"}
          onClick={() => props.onChangePage("list")}
        >
          List
        </NavItem>
        <NavItem
          selected={page === "new"}
          onClick={() => props.onChangePage("new")}
        >
          New
        </NavItem>
      </div>
    );
  }

  function Database(props) {
    const { database } = props;

    return (
      <div className="database__wrapper">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          strokeWidth={2}
          fill="transparent"
          stroke="#a074c4"
        >
          <use href="#icon-database" />
        </svg>
        <div
          className="database"
          onClick={() => {
            vscode.postMessage({ type: "changeDatabase", database });
          }}
        >
          {database || "Default database"}
        </div>
      </div>
    );
  }

  function Page() {
    const [page, setPage] = React.useState("list");
    const [selectedKey, setSelectedKey] = React.useState(null);
    const [database, setDatabase] = React.useState(null);
    const eventRef = React.useRef(null);

    React.useEffect(() => {
      eventRef.current = (event) => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
          case "changeDatabaseResult": {
            setDatabase(message.database);
            break;
          }
        }
      };
      window.addEventListener("message", eventRef.current);

      return () => {
        window.removeEventListener("message", eventRef.current);
      };
    }, []);

    return (
      <div className="page">
        <Nav
          page={page}
          onChangePage={(page) => {
            setPage(page);
          }}
        />
        {page === "list" && (
          <PageList
            selectedKey={selectedKey}
            database={database}
            onChangeSelectedKey={(key) => {
              setSelectedKey(key);
              setPage("get");
            }}
          />
        )}
        {page === "new" && <PageNew />}
        {page === "get" && (
          <PageGet
            selectedKey={selectedKey}
            onChangeSelectedKey={(key) => {
              setSelectedKey(key);
            }}
          />
        )}
        <Database database={database} />
      </div>
    );
  }

  ReactDOM.render(h(Page, {}), document.getElementById("app"));
})();
