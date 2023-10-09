/* eslint-disable @typescript-eslint/naming-convention */
// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import React, { useCallback, useEffect, useState } from "react";
import { vscode } from "./api";
import { kvGet, KvKey, kvSet, PageType } from "./main";
import cx from "classnames";

interface NavProps {
  page: string;
  onChangePage: (page: PageType) => void;
}
export function Nav(props: NavProps) {
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
