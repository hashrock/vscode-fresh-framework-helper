/* eslint-disable @typescript-eslint/naming-convention */
// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import React, { useCallback, useEffect, useRef, useState } from "react";
import { render } from "react-dom";
import cx from "classnames";
import { PageList } from "./list";
import { vscode } from "./api";
import { PageGet } from "./get";

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () {
  function PageNew() {
    const [message, setMessage] = useState<string | null>(null);

    const eventHandler = useCallback((event: MessageEvent) => {
      const message = event.data; // The json data that the extension sent
      switch (message.type) {
        case "setResult": {
          if (message.result === "OK") {
            setMessage("The item set successfully : " + new Date());
          }
          break;
        }
      }
    }, []);

    useEffect(() => {
      window.addEventListener("message", eventHandler);

      return () => {
        window.removeEventListener("message", eventHandler);
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

    const eventHandler = useCallback((event: MessageEvent) => {
      const message = event.data; // The json data that the extension sent
      switch (message.type) {
        case "changeDatabaseResult": {
          setDatabase(message.database);
          break;
        }
      }
    }, []);

    useEffect(() => {
      window.addEventListener("message", eventHandler);

      return () => {
        window.removeEventListener("message", eventHandler);
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
          />
        )}
        <Database database={database} />
      </div>
    );
  }

  render(<Page />, document.getElementById("app"));
})();
