/* eslint-disable @typescript-eslint/naming-convention */
// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import React, { useCallback, useEffect, useRef, useState } from "react";
import { render } from "react-dom";
import { PageList } from "./list";
import { vscode } from "./api";
import { PageGet } from "./get";
import { IconDatabase } from "./icons";
import { Nav } from "./nav";

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

export type KvKeyPart = Uint8Array | string | number | bigint | boolean;
export type KvKey = KvKeyPart[];
export type KvValue = unknown;
export type PageType = "list" | "new" | "get";

type MessageType = "list" | "changeDatabase" | "get" | "set";

export function kvSet(key: KvKey, value: KvValue) {
  vscode.postMessage({ type: "set", key, value });
}

export function kvGet(key: KvKey) {
  vscode.postMessage({ type: "get", key });
}

// TODO
export function kvDelete(key: KvKey) {
  vscode.postMessage({ type: "delete", key });
}

export function kvList(key: KvKey) {
  vscode.postMessage({ type: "list", key });
}

export function kvChangeDatabase(database: string | null) {
  vscode.postMessage({ type: "changeDatabase", database });
}

(function () {
  interface DatabaseProps {
    database: string | null;
  }

  function Database(props: DatabaseProps) {
    const { database } = props;

    return (
      <div className="database__wrapper">
        <IconDatabase width={16} height={16} />
        <div
          className="database"
          onClick={() => {
            kvChangeDatabase(database);
          }}
        >
          {database || "Default database"}
        </div>
      </div>
    );
  }

  function Page() {
    const [page, setPage] = useState<PageType>("list");
    const [selectedKey, setSelectedKey] = useState<KvKey>([]);
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
        {page === "new" && (
          <PageGet
            isNewItem
            onSaveNewItem={(key, value) => {
              setSelectedKey(key);
              setPage("get");
            }}
          />
        )}
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
