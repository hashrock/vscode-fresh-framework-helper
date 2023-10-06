/* eslint-disable @typescript-eslint/naming-convention */
// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import React, { useCallback, useEffect, useState } from "react";
import { vscode } from "./api";

interface PageGetProps {
  selectedKey: string | null;
}
export function PageGet(props: PageGetProps) {
  const selectedKey = props.selectedKey;
  const [value, setValue] = useState<string | null>(null);
  const [versionstamp, setVersionstamp] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const eventHandler = useCallback((event: MessageEvent) => {
    const message = event.data; // The json data that the extension sent
    switch (message.type) {
      case "getResult": {
        setValue(JSON.stringify(message.result.value, null, 2));
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
          vscode.postMessage({ type: "get", key: selectedKey });
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
      vscode.postMessage({ type: "get", key: selectedKey });
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
      <div className="label">Value</div>
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
