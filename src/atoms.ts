import { atomWithStorage } from "jotai/utils";

const tabSave = atomWithStorage("tabSave", "todo-list");
const tabOrder = atomWithStorage<string[]>("tabOrder", []);

export { tabOrder, tabSave };
