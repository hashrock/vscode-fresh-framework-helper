/* eslint-disable @typescript-eslint/naming-convention */
// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import React, { useEffect, useRef, useState } from "react";
import { render } from "react-dom";
import cx from "classnames";
import { PageList } from "./list";

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () {
  const vscode = acquireVsCodeApi();

  interface PageListFormProps {
    selectedKey: string | null;
    onChangeSelectedKey: (key: string) => void;
  }

  function PageGet(props: PageListFormProps) {
    const selectedKey = props.selectedKey;
    const eventRef = useRef(null);
    const eventUpdateRef = useRef(null);
    const [value, setValue] = useState(null);
    const [versionstamp, setVersionstamp] = useState(null);
    const [message, setMessage] = useState(null);

    useEffect(() => {
      // @ts-ignore
      eventUpdateRef.current = (event) => {
        // @ts-ignore
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
          case "setResult": {
            console.log("message", message);
            if (message.result === "OK") {
              // @ts-ignore
              setMessage("The item set successfully : " + new Date());
              vscode.postMessage({ type: "get", key: selectedKey });
            }
            break;
          }
        }
      };
      // @ts-ignore
      window.addEventListener("message", eventUpdateRef.current);

      return () => {
        if (eventUpdateRef.current) {
          window.removeEventListener("message", eventUpdateRef.current);
        }
      };
    }, []);

    useEffect(() => {
      if (selectedKey) {
        vscode.postMessage({ type: "get", key: selectedKey });
      }
      // @ts-ignore
      eventRef.current = (event) => {
        // @ts-ignore
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
          case "getResult": {
            // @ts-ignore
            setValue(JSON.stringify(message.result.value, null, 2));
            setVersionstamp(message.result.versionstamp);
            break;
          }
        }
      };
      // @ts-ignore
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
            value={value || ""}
            onChange={(e) => {
              if (e.target.value !== value) {
                // @ts-ignore
                return setValue(e.target.value);
              }
            }}
          />
        </div>
        <button
          className="get__update"
          onClick={() =>
            vscode.postMessage({ type: "set", key: selectedKey, value })}
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
    const eventRef = useRef<EventListener | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
      eventRef.current = (event) => {
        // @ts-ignore
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
          case "setResult": {
            console.log("message", message);
            if (message.result === "OK") {
              // @ts-ignore
              setMessage("The item set successfully : " + new Date());
            }
            break;
          }
        }
      };
      window.addEventListener("message", eventRef.current);

      return () => {
        if (eventRef.current) {
          window.removeEventListener("message", eventRef.current);
        }
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
    const keyRef = useRef<HTMLInputElement | null>(null);
    const valueRef = useRef<HTMLInputElement | null>(null);

    return (
      <form
        className="newform__wrapper"
        onSubmit={(e) => {
          e.preventDefault();
          if (!keyRef.current || !valueRef.current) {
            return;
          }
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

  interface NavItemProps {
    selected: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }
  function NavItem(props: NavItemProps) {
    return (
      <button
        className={cx("nav__item", props.selected && "nav__item--selected")}
        onClick={props.onClick}
      >
        {props.children}
      </button>
    );
  }

  interface NavProps {
    page: string;
    onChangePage: (page: PageType) => void;
  }
  function Nav(props: NavProps) {
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

  interface DatabaseProps {
    database: string | null;
  }

  function Database(props: DatabaseProps) {
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

  type PageType = "list" | "new" | "get";

  function Page() {
    const [page, setPage] = useState<PageType>("list");
    const [selectedKey, setSelectedKey] = useState<string | null>(null);
    const [database, setDatabase] = useState<string | null>(null);
    /**
     * @type {React.MutableRefObject<EventListener | null>}
     */
    const eventRef = useRef(null);

    useEffect(() => {
      // @ts-ignore
      eventRef.current = (event) => {
        // @ts-ignore
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
          case "changeDatabaseResult": {
            setDatabase(message.database);
            break;
          }
        }
      };
      // @ts-ignore
      window.addEventListener("message", eventRef.current);

      return () => {
        if (eventRef.current) {
          window.removeEventListener("message", eventRef.current);
        }
      };
    }, []);

    return (
      <div className="page">
        <Nav
          page={page}
          onChangePage={(page: PageType) => {
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

  render(<Page />, document.getElementById("app"));
})();
