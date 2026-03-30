"use client";

import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { RepoTreeProps } from "@/modules/JdmEditorPage/types/JdmEditorTypes";
import { brmsTheme } from "@/core/theme/brmsTheme";

const TreeRoot = styled(Box)({});

const ItemRow = styled(Box)<{ isSelected: boolean; depth: number }>(
  ({ isSelected, depth }) => ({
    display: "flex",
    alignItems: "center",
    gap: 6,
    paddingRight: 12,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: `${12 + depth * 12}px`,
    cursor: "pointer",
    backgroundColor: isSelected ? "rgba(101, 82, 208, 0.08)" : "transparent",
    borderLeft: isSelected
      ? `2px solid ${brmsTheme.colors.primary}`
      : "2px solid transparent",
    transition: "all 0.15s ease",
    "&:hover": {
      backgroundColor: isSelected
        ? "rgba(101, 82, 208, 0.12)"
        : "rgba(0, 0, 0, 0.03)",
    },
  })
);

const ChevronWrapper = styled(Box)({
  width: 14,
  height: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  color: brmsTheme.colors.textGrayLight,
});

const StyledExpandMoreIcon = styled(ExpandMoreIcon)({
  fontSize: 14,
});

const StyledChevronRightIcon = styled(ChevronRightIcon)({
  fontSize: 14,
});

const StyledFolderIcon = styled(FolderIcon)<{ isExpanded: boolean }>(
  ({ isExpanded }) => ({
    fontSize: 16,
    color: brmsTheme.colors.warningAmber,
    flexShrink: 0,
    transform: isExpanded ? "scale(1.05)" : "scale(1)",
    transition: "0.15s ease",
  })
);

const StyledFileIcon = styled(InsertDriveFileIcon)<{ isSelected: boolean }>(
  ({ isSelected }) => ({
    fontSize: 15,
    color: isSelected
      ? brmsTheme.colors.primary
      : brmsTheme.colors.lightTextLow,
    flexShrink: 0,
  })
);

const ItemLabel = styled(Typography)<{
  isSelected: boolean;
  isFolder: boolean;
}>(({ isSelected, isFolder }) => ({
  fontSize: "0.8125rem",
  fontWeight: isSelected ? 600 : isFolder ? 500 : 400,
  color: isSelected
    ? brmsTheme.colors.primary
    : isFolder
      ? brmsTheme.colors.textDarkSlate
      : brmsTheme.colors.lightTextMid,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  letterSpacing: "-0.01em",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}));

export default function RepoTree({
  items,
  selectedId,
  expandedFolders,
  onToggleFolder,
  onSelectItem,
  onDragStart,
  onDropOnFolder,
  depth = 0,
}: RepoTreeProps) {
  return (
    <TreeRoot>
      {items.map((item) => {
        const isSelected = item.id === selectedId;
        const isExpanded = expandedFolders.has(item.id);
        const isFolder = item.type === "folder";

        return (
          <Box key={item.id}>
            <ItemRow
              isSelected={isSelected}
              depth={depth}
              onClick={() => {
                if (isFolder) onToggleFolder(item.id);
                onSelectItem(item);
              }}
              draggable
              onDragStart={() => onDragStart(item)}
              onDrop={(e) => {
                e.preventDefault();
                if (isFolder) onDropOnFolder(item);
              }}
              onDragOver={(e) => isFolder && e.preventDefault()}
            >
              {/* Chevron for folders */}
              <ChevronWrapper>
                {isFolder &&
                  (isExpanded ? (
                    <StyledExpandMoreIcon />
                  ) : (
                    <StyledChevronRightIcon />
                  ))}
              </ChevronWrapper>

              {/* File/Folder Icon */}
              {isFolder ? (
                <StyledFolderIcon isExpanded={isExpanded} />
              ) : (
                <StyledFileIcon isSelected={isSelected} />
              )}

              {/* Name */}
              <ItemLabel isSelected={isSelected} isFolder={isFolder}>
                {item.name}
              </ItemLabel>
            </ItemRow>

            {/* Recursive children */}
            {isFolder && isExpanded && item.children && (
              <RepoTree
                items={item.children}
                selectedId={selectedId}
                expandedFolders={expandedFolders}
                onToggleFolder={onToggleFolder}
                onSelectItem={onSelectItem}
                onDragStart={onDragStart}
                onDropOnFolder={onDropOnFolder}
                depth={depth + 1}
              />
            )}
          </Box>
        );
      })}
    </TreeRoot>
  );
}