import { getSettings } from "../../settings";
import type { Feature } from "../../types";
import { setupTodoObserver } from "./observer";
import styles from "./styles.scss?inline";

let cleanup: (() => void) | null = null;

/**
 * Restyles task blocks with visual indicators for status (TODO, DONE,
 * CANCELLED, DOING), priority levels (A, B, C), and past-due dates.
 */
export const todosFeature: Feature = {
  id: "todos",
  name: "Pretty Todos",
  description:
    "Restyle task blocks with visual indicators for status, priority, and past-due dates",

  getStyles() {
    return getSettings().enablePrettyTodos ? styles : "";
  },

  init() {
    if (!getSettings().enablePrettyTodos) return;
    cleanup = setupTodoObserver();
  },

  destroy() {
    cleanup?.();
    cleanup = null;
  },
};
