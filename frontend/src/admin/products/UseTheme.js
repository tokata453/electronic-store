import { useContext } from "react";
import { ThemeContext } from "./ThemeContext";

export function UseTheme() {
  return useContext(ThemeContext);
}