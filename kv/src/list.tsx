/* eslint-disable @typescript-eslint/naming-convention */
// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { KvKey, kvList, showMessage } from "./api";
import { IconSearch } from "./icons";
import { MenuContext } from "./context";
import { queryToKvPrefix } from "./utils";

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

function getExampleCode(selectedKey: KvKey) {
  return `const kv = await Deno.openKv();

kv.list({ prefix: ${JSON.stringify(selectedKey)}});
for await (const entry of entries) {
  console.log(entry.key); // ["preferences", "ada"]
  console.log(entry.value); // { ... }
  console.log(entry.versionstamp); // "00000000000000010000"
}`;
}

export function PageList(props: PageListProps) {
  const [items, setItems] = useState([]);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const context = useContext(MenuContext);
  const [selectedKey, setSelectedKey] = useState<KvKey | undefined>(
    props.selectedKey,
  );

  useEffect(() => {
    context.setMenuItems([{
      title: "Copy code with kv.list",
      onClick: () => {
        navigator.clipboard.writeText(getExampleCode(selectedKey ?? []));
        showMessage("Copied!");
      },
    }, {
      title: "Export JSON",
      onClick: () => {
        const blob = new Blob([JSON.stringify(items, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "kv.json";
        a.click();
      },
    }]);
  }, [context, selectedKey, items]);

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
          const parsed = queryToKvPrefix(key);
          kvList(parsed); // TODO: support array
          setSelectedKey(parsed);
        }}
        isBusy={isBusy}
      />
      <PageListResult
        items={items}
        onChangeSelectedKey={(key) => {
          props.onChangeSelectedKey(key);
        }}
      />
    </div>
  );
}
