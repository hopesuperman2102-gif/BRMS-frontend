import * as React from 'react';
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

export type CdfColumn<T> = {
  key: keyof T | string;
  label: string;
  align?: 'left' | 'right' | 'center';
  render?: (row: T) => React.ReactNode;
};

export type CdfSection<T> = {
  showHeader: boolean;
  key: string;
  title: string;
  rows: T[];
};

export interface CdfCollapsibleTableProps<T> {
  columns: CdfColumn<T>[];
  sections: CdfSection<T>[];
  getRowId: (row: T) => string | number;
}

export function CollapsibleTable<T extends Record<string, React.ReactNode>>({
  columns,
  sections,
  getRowId,
}: CdfCollapsibleTableProps<T>) {
  // Store multiple open sections in an object
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({});

React.useEffect(() => {
  const initialState: Record<string, boolean> = {};
  sections.forEach((s) => {
    initialState[s.key] = false; // all closed
  });
  setOpenSections(initialState);
}, [sections]);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <TableContainer
  component={Paper}
  sx={{
    maxHeight: '70vh', // responsive height
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  }}
>
      <Table stickyHeader>
        <TableBody>
          {sections.map((section, sectionIndex) => (
            <React.Fragment key={section.key}>
              {/* SECTION HEADER ROW */}
              <TableRow >
                <TableCell width={48}>
                  <IconButton size="small" onClick={() => toggleSection(section.key)}>
                    {openSections[section.key] ? (
                      <KeyboardArrowUpIcon />
                    ) : (
                      <KeyboardArrowDownIcon />
                    )}
                  </IconButton>
                </TableCell>

                {section.showHeader || sectionIndex === 0 ? (
                  columns.map((col, colIndex) => (
                    <TableCell key={String(col.key) }>
                      {colIndex === 0 ? (
                        <Typography variant="subtitle1" fontWeight={560}>
  {section.title}
</Typography>
                      ) : (
                        <Typography variant="subtitle1" color="text.secondary">
  {col.label}
</Typography>

                      )}
                    </TableCell>
                  ))
                ) : (
                  <TableCell colSpan={columns.length}>
                    <Typography variant="body2">{section.title}</Typography>
                  </TableCell>
                )}
              </TableRow>

              {/* SECTION ROWS */}
              {openSections[section.key] &&
                section.rows.map((row) => (
                  <TableRow key={getRowId(row)} sx={{
    '&:hover': {
      backgroundColor: '#f9fafb',
    },
  }}>
                    {/* empty cell for expand icon column */}
                    <TableCell width={48} />

                    {columns.map((col) => (
                      <TableCell key={String(col.key)}>
                        {col.render ? col.render(row) : row[col.key as keyof T]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}