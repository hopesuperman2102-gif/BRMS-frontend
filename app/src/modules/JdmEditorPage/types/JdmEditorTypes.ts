import { RepoItem } from "../../../core/types/commonTypes";

export type EditorProps = {
  items: RepoItem[];
  selectedId: string | number | null;
  openFiles: (string | number)[];               
  setOpenFiles: (files: (string | number)[]) => void; 
};