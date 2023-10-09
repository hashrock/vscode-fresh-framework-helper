/* eslint-disable @typescript-eslint/naming-convention */
// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import React from "react";
import { PageType } from "./main";
import cx from "classnames";
import { IconChevronLeft, IconDots, IconPlus } from "./icons";

function BackHome(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="nav__button nav__back-home"
      {...props}
    >
      <IconChevronLeft width={16} height={16} />
    </button>
  );
}

function NewItem(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="nav__button nav__new-item"
      {...props}
    >
      <IconPlus width={16} height={16} />
    </button>
  );
}

function Menu(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="nav__button nav__menu"
      {...props}
    >
      <IconDots width={16} height={16} />
    </button>
  );
}

interface NavProps {
  page: PageType;
  onChangePage: (page: PageType) => void;
}

export function Nav(props: NavProps) {
  const { page } = props;

  return (
    <div className="nav">
      {page === "single" && (
        <>
          <BackHome
            onClick={() => props.onChangePage("list")}
          />
          <div className="nav__title">
            Edit Item
          </div>
          <NewItem
            onClick={() => props.onChangePage("new")}
          />
        </>
      )}

      {page === "list" && (
        <>
          <div className="nav__title">
            Items
          </div>
          <NewItem
            onClick={() => props.onChangePage("new")}
          />
        </>
      )}

      {page === "new" && (
        <>
          <BackHome
            onClick={() => props.onChangePage("list")}
          />
          <div className="nav__title">
            New Item
          </div>
        </>
      )}

      <Menu />
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
