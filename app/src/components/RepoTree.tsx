'use client';

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';

import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { RepoItem } from './types';

type Props = {
  items: RepoItem[];
  selectedId: number | null;
  expandedFolders: Set<number>;
  onToggleFolder: (id: number) => void;
  onSelectItem: (item: RepoItem) => void;
  onDragStart: (item: RepoItem) => void;
  onDropOnFolder: (folder: RepoItem) => void;
  level?: number;
};

export default function RepoTree({
  items,
  selectedId,
  expandedFolders,
  onToggleFolder,
  onSelectItem,
  onDragStart,
  onDropOnFolder,
  level = 0,
}: Props) {
  return (
    <List disablePadding>
      {items.map((item) => {
        const isSelected = item.id === selectedId;

        // FILE
        if (item.type === 'file') {
          return (
            <ListItemButton
              key={item.id}
              selected={isSelected}
              draggable
              onClick={() => onSelectItem(item)}
              onDragStart={() => onDragStart(item)}
              sx={{
                pl: 2 + level * 2,
                height: 36,
                borderRadius: 1.5,
                '&.Mui-selected': { bgcolor: '#eaf0ff' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 28 }}>
                <DescriptionIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItemButton>
          );
        }

        // FOLDER
        const expanded = expandedFolders.has(item.id);

        return (
          <Accordion
            key={item.id}
            expanded={expanded}
            disableGutters
            elevation={0}
            square
            sx={{ bgcolor: 'transparent', '&:before': { display: 'none' } }}
            onChange={() => onToggleFolder(item.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDropOnFolder(item)}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon fontSize="small" />}
              sx={{
                pl: 2 + level * 2,
                minHeight: 36,
                borderRadius: 1.5,
                bgcolor: isSelected ? '#eaf0ff' : 'transparent',
                '& .MuiAccordionSummary-content': {
                  alignItems: 'center',
                  margin: 0,
                },
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectItem(item);
              }}
            >
              <ListItemIcon sx={{ minWidth: 28 }}>
                <FolderIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={item.name} />
            </AccordionSummary>

            <AccordionDetails sx={{ p: 0 }}>
              {item.children && (
                <RepoTree
                  items={item.children}
                  selectedId={selectedId}
                  expandedFolders={expandedFolders}
                  onToggleFolder={onToggleFolder}
                  onSelectItem={onSelectItem}
                  onDragStart={onDragStart}
                  onDropOnFolder={onDropOnFolder}
                  level={level + 1}
                />
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </List>
  );
}
