// @ts-check
/* eslint-disable @typescript-eslint/naming-convention */
// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import React, { useRef, useEffect, useState } from "react";

// @ts-ignore
const vscode = acquireVsCodeApi();

function PageListForm(props) {
  /**
   * @type {React.MutableRefObject<HTMLInputElement | null>}
   */
  const searchKeyRef = useRef(null);

  return (
    <form
      className="form__wrapper"
      onSubmit={(e) => {
        e.preventDefault();
        if (searchKeyRef.current === null) {
          return;
        }
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

export function PageList(props) {
  /** @type {React.MutableRefObject<EventListener | null>} */
  const eventRef = useRef(null);
  const [items, setItems] = useState([]);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    eventRef.current = (event) => {
      // @ts-ignore
      const message = event.data; // The json data that the extension sent
      switch (message.type) {
        case "listResult": {
          setItems(message.result);
          setIsBusy(false);
          break;
        }
      }
    };
    // @ts-ignore
    window.addEventListener("message", eventRef.current);

    // initial lPd
    vscode.postMessage({ type: "list", key: "" });
    setIsBusy(true);

    return () => {
      // @ts-ignore
      window.removeEventListener("message", eventRef.current);
    };
  }, []);

  useEffect(() => {
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
