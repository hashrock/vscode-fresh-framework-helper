/* eslint-disable @typescript-eslint/naming-convention */
// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import React, { useCallback, useEffect, useState } from "react";
import { render } from "react-dom";
import { PageList } from "./list";
import { PageSingle } from "./single";
import { IconDatabase } from "./icons";
import { Nav } from "./nav";
import { kvChangeDatabase, KvKey } from "./api";
import { CSSTransition } from "react-transition-group";

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

export type PageType = "list" | "new" | "single";

(function () {
  interface DatabaseProps {
    database: string;
  }

  function Database(props: DatabaseProps) {
    const { database } = props;

    return (
      <div
        className="database__wrapper"
        onClick={() => {
          kvChangeDatabase();
        }}
      >
        <IconDatabase width={16} height={16} />
        <div className="database">
          {database || "Default database"}
        </div>
      </div>
    );
  }

  function Page() {
    const [page, setPage] = useState<PageType>("list");
    const [selectedKey, setSelectedKey] = useState<KvKey>([]);
    const [database, setDatabase] = useState<string>("");

    const showModal = page === "new" || page === "single";

    const eventHandler = useCallback((event: MessageEvent) => {
      const message = event.data; // The json data that the extension sent
      switch (message.type) {
        case "changeDatabaseResult": {
          setDatabase(message.result);
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
              setPage("single");
            }}
          />
        )}
        <CSSTransition in={showModal} timeout={300} classNames="modal">
          <div className="modal">
            {page === "new" && (
              <PageSingle
                isNewItem
                onSaveNewItem={(key, value) => {
                  setSelectedKey(key);
                  setPage("single");
                }}
              />
            )}
            {page === "single" && (
              <PageSingle
                selectedKey={selectedKey}
              />
            )}
          </div>
        </CSSTransition>
        <Database database={database} />
      </div>
    );
  }

  render(<Page />, document.getElementById("app"));
})();
