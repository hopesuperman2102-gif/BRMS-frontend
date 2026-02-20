"use client";

import { Box, Typography } from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { RepoTreeProps } from "../types/JdmEditorTypes";



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
    <Box>
      {items.map((item) => {
        const isSelected = item.id === selectedId;
        const isExpanded = expandedFolders.has(item.id);
        const isFolder = item.type === "folder";

        return (
          <Box key={item.id}>
            <Box
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
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                px: 1.5,
                py: 0.6,
                pl: 1.5 + depth * 1.5,
                cursor: "pointer",
                backgroundColor: isSelected
                  ? "rgba(101, 82, 208, 0.08)"
                  : "transparent",
                borderLeft: isSelected
                  ? "2px solid #6552D0"
                  : "2px solid transparent",
                transition: "all 0.15s ease",
                "&:hover": {
                  backgroundColor: isSelected
                    ? "rgba(101, 82, 208, 0.12)"
                    : "rgba(0, 0, 0, 0.03)",
                },
              }}
            >
              {/* Chevron for folders */}
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  color: "#9ca3af",
                }}
              >
                {isFolder &&
                  (isExpanded ? (
                    <ExpandMoreIcon sx={{ fontSize: 14 }} />
                  ) : (
                    <ChevronRightIcon sx={{ fontSize: 14 }} />
                  ))}
              </Box>

              {/* File/Folder Icon */}
              {isFolder ? (
                <FolderIcon
                  sx={{
                    fontSize: 16,
                    color: "#f59e0b",
                    flexShrink: 0,
                    transform: isExpanded ? "scale(1.05)" : "scale(1)",
                    transition: "0.15s ease",
                  }}
                />
              ) : (
                <InsertDriveFileIcon
                  sx={{
                    fontSize: 15,
                    color: isSelected ? "#6552D0" : "#94a3b8",
                    flexShrink: 0,
                  }}
                />
              )}

              {/* Name */}
              <Typography
                fontSize={13}
                color="#6552D0"
                sx={{
                  fontSize: "0.8125rem",
                  fontWeight: isSelected ? 600 : isFolder ? 500 : 400,
                  color: isSelected
                    ? "#6552D0"
                    : isFolder
                      ? "#1e293b"
                      : "#475569",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  letterSpacing: "-0.01em",
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                {item.name}
              </Typography>
            </Box>

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
    </Box>
  );
}
