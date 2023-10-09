/* eslint-disable @typescript-eslint/naming-convention */
// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import React, { useCallback, useEffect, useRef, useState } from "react";
import { KvKey, kvList } from "./main";
import { IconSearch } from "./icons";

interface PageListFormProps {
  onSubmit: (key: string) => void;
  isBusy: boolean;
}

function PageListForm(props: PageListFormProps) {
  const searchKeyRef = useRef<HTMLInputElement | null>(null);

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
        <IconSearch width={16} height={16} />
      </button>
    </form>
  );
}

interface PageListResultItemProps {
  item: {
    key: KvKey;
    value: string;
  };
  onChangeSelectedKey: (key: KvKey) => void;
}
function PageListResultItem(props: PageListResultItemProps) {
  const item = props.item;

  return (
    <div
      className="result__item"
      onClick={() => {
        props.onChangeSelectedKey(item.key);
      }}
    >
      <div className="result__item__key">
        {item.key.map((i) => JSON.stringify(i)).join(",")}
      </div>
      <div className="result__item__value">{JSON.stringify(item.value)}</div>
    </div>
  );
}

interface PageListResultProps {
  items: {
    key: KvKey;
    value: string;
  }[];
  onChangeSelectedKey: (key: KvKey) => void;
}
function PageListResult(props: PageListResultProps) {
  const items = props.items;

  return (
    <div className="result">
      {items.length === 0 && (
        <div className="result__empty">
          No items found
        </div>
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

interface PageListProps {
  database: string | null;
  onChangeSelectedKey: (key: KvKey) => void;
  selectedKey: KvKey;
}

export function PageList(props: PageListProps) {
  const [items, setItems] = useState([]);
  const [isBusy, setIsBusy] = useState<boolean>(false);

  const handleMessage = useCallback((event: MessageEvent) => {
    const message = event.data; // The json data that the extension sent
    switch (message.type) {
      case "listResult": {
        setItems(message.result);
        setIsBusy(false);
        break;
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("message", handleMessage);

    // initial lPd
    kvList([]);

    setIsBusy(true);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    kvList([]);
  }, [props.database]);

  return (
    <div className="result__wrapper">
      <PageListForm
        onSubmit={(key) => {
          if (key === "") {
            kvList([]);
          } else {
            kvList(key.split(",")); // TODO: support array
          }
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
