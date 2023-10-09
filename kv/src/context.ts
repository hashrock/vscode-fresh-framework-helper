/* eslint-disable @typescript-eslint/naming-convention */

import { createContext } from "react";

export interface MenuItemProps {
  title: string;
  onClick: () => void;
}

export interface MenuContextProps {
  menuItems: MenuItemProps[];
  setMenuItems: (menuItems: MenuItemProps[]) => void;
}

export const MenuContext = createContext<MenuContextProps>({
  menuItems: [],
  setMenuItems: () => {},
});
