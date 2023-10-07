/* eslint-disable @typescript-eslint/naming-convention */
// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import React, { useCallback, useEffect, useState } from "react";
import { vscode } from "./api";
import { kvGet, KvKey, kvSet } from "./main";
import superjson from "superjson";

type ValueType = "string" | "json" | "number";

interface PageGetProps {
  selectedKey: KvKey;
}
export function PageGet(props: PageGetProps) {
  const selectedKey = props.selectedKey;
  const [value, setValue] = useState<string | null>(null);
  const [versionstamp, setVersionstamp] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [valueType, setValueType] = useState<ValueType>("string");

  const eventHandler = useCallback((event: MessageEvent) => {
    const message = event.data; // The json data that the extension sent
    switch (message.type) {
      case "getResult": {
        const value = message.result.value;
        let valueType: ValueType = "string";
        if (typeof value === "object") {
          valueType = "json";
          setValue(JSON.stringify(value, null, 2));
        } else if (typeof value === "number") {
          valueType = "number";
          setValue(String(value));
        } else {
          setValue(value);
        }
        setValueType(valueType);
        setVersionstamp(message.result.versionstamp);
        break;
      }
    }
  }, []);

  const eventUpdateHandler = useCallback((event: MessageEvent) => {
    const message = event.data; // The json data that the extension sent
    switch (message.type) {
      case "setResult": {
        console.log("message", message);
        if (message.result === "OK") {
          setMessage("The item set successfully : " + new Date());
          if (selectedKey) {
            kvGet(selectedKey);
          }
        }
        break;
      }
    }
  }, [selectedKey]);

  useEffect(() => {
    window.addEventListener("message", eventUpdateHandler);

    return () => {
      window.removeEventListener("message", eventUpdateHandler);
    };
  }, []);

  useEffect(() => {
    if (selectedKey) {
      kvGet(selectedKey);
    }

    window.addEventListener("message", eventHandler);

    return () => {
      window.removeEventListener("message", eventHandler);
    };
  }, []);

  return (
    <div className="get__wrapper">
      <div className="label">Key</div>
      <div className="get__key">{JSON.stringify(selectedKey)}</div>
      <div className="value-column">
        <div className="label">Value</div>
        <select
          className="get__value__type"
          onChange={(e) => {
            setValueType(e.target.value as ValueType);
          }}
          value={valueType}
        >
          <option value="string">string</option>
          <option value="json">json</option>
          <option value="number">number</option>
        </select>
      </div>
      <div className="get__value__wrapper">
        <textarea
          className="get__value"
          value={value || ""}
          onChange={(e) => {
            if (e.target.value !== value) {
              return setValue(e.target.value);
            }
          }}
        />
      </div>
      <button
        className="get__update"
        onClick={() => {
          if (valueType === "string") {
            kvSet(selectedKey, value);
          } else if (valueType === "number") {
            kvSet(selectedKey, Number(value));
          } else if (valueType === "json" && value) {
            kvSet(selectedKey, JSON.parse(value));
          }
        }}
      >
        Update
      </button>
      <div className="label">{message}</div>
      <div className="label">VersionStamp</div>
      <div className="get__versionstamp">{versionstamp}</div>
    </div>
  );
}
