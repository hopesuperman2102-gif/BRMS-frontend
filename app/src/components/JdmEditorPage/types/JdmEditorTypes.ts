import { RepoItem } from "../../types";

export type ProjectTreeProps = {
  items: RepoItem[];
  setItems: React.Dispatch<React.SetStateAction<RepoItem[]>>;
  selectedId: number | null;
  setSelectedId: React.Dispatch<React.SetStateAction<number | null>>;
  onOpenFile: (id: number) => void;
};

export type EditorProps = {
  items: RepoItem[];
  selectedId: number | null;
  openFiles: number[];
  setOpenFiles: React.Dispatch<React.SetStateAction<number[]>>;
};