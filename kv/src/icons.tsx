/* eslint-disable @typescript-eslint/naming-convention */
// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import React from "react";
import cx from "classnames";

export function IconDatabase(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={cx("icon", props.className)}
      width={props.width ?? "24"}
      height={props.height ?? "24"}
      viewBox="0 0 24 24"
      stroke-width="2"
      stroke="currentColor"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M12 6m-8 0a8 3 0 1 0 16 0a8 3 0 1 0 -16 0"></path>
      <path d="M4 6v6a8 3 0 0 0 16 0v-6"></path>
      <path d="M4 12v6a8 3 0 0 0 16 0v-6"></path>
    </svg>
  );
}

export function IconSearch(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={props.width ?? "24"}
      height={props.height ?? "25"}
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M19.6 21.5L13.3 15.2C12.8 15.6 12.225 15.9167 11.575 16.15C10.925 16.3833 10.2333 16.5 9.5 16.5C7.68333 16.5 6.146 15.8707 4.888 14.612C3.63 13.3533 3.00067 11.816 3 10C3 8.18333 3.62933 6.646 4.888 5.388C6.14667 4.13 7.684 3.50067 9.5 3.5C11.3167 3.5 12.854 4.12933 14.112 5.388C15.37 6.64667 15.9993 8.184 16 10C16 10.7333 15.8833 11.425 15.65 12.075C15.4167 12.725 15.1 13.3 14.7 13.8L21 20.1L19.6 21.5ZM9.5 14.5C10.75 14.5 11.8127 14.0623 12.688 13.187C13.5633 12.3117 14.0007 11.2493 14 10C14 8.75 13.5623 7.68733 12.687 6.812C11.8117 5.93667 10.7493 5.49933 9.5 5.5C8.25 5.5 7.18733 5.93767 6.312 6.813C5.43667 7.68833 4.99933 8.75067 5 10C5 11.25 5.43767 12.3127 6.313 13.188C7.18833 14.0633 8.25067 14.5007 9.5 14.5Z"
        fill="white"
      />
    </svg>
  );
}
