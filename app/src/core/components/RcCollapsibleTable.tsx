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
  Chip,
  Box,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

export type RcColumn<T> = {
  key: keyof T | string;
  label: string;
  align?: 'left' | 'right' | 'center';
  render?: (row: T) => React.ReactNode;
};

export type RcSection<T> = {
  showHeader: boolean;
  key: string;
  title: string;
  rows: T[];
};

export interface RcCollapsibleTableProps<T> {
  columns: RcColumn<T>[];
  sections: RcSection<T>[];
  getRowId: (row: T) => string | number;
}

export function RcCollapsibleTable<T extends Record<string, React.ReactNode>>({
  columns,
  sections,
  getRowId,
}: RcCollapsibleTableProps<T>) {
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const initialState: Record<string, boolean> = {};
    sections.forEach((s) => {
      initialState[s.key] = false;
    });
    setOpenSections(initialState);
  }, [sections]);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        maxHeight: '70vh',
        overflowY: 'auto',
        borderRadius: '16px',
        border: '1px solid #e8edf3',
        background: '#ffffff',
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { background: '#d1d9e0', borderRadius: '4px' },
      }}
    >
      <Table stickyHeader>
        <TableBody>
          {sections.map((section, sectionIndex) => (
            <React.Fragment key={section.key}>
              {/* SECTION HEADER ROW */}
              <TableRow
                sx={{
                  background: openSections[section.key]
                    ? 'linear-gradient(90deg, #f0f4ff 0%, #f8f9fe 100%)'
                    : 'linear-gradient(90deg, #f8fafc 0%, #ffffff 100%)',
                  borderBottom: '1px solid #e2e8f0',
                  transition: 'background 0.2s ease',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #eef2ff 0%, #f5f7ff 100%)',
                    cursor: 'pointer',
                  },
                }}
                onClick={() => toggleSection(section.key)}
              >
                <TableCell
                  width={56}
                  sx={{ border: 'none', py: 2, pl: 2 }}
                >
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '8px',
                      background: openSections[section.key] ? '#6552D0' : '#e8edf3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <IconButton
                      size="small"
                      disableRipple
                      onClick={(e) => { e.stopPropagation(); toggleSection(section.key); }}
                      sx={{ p: 0, color: openSections[section.key] ? 'white' : '#64748b' }}
                    >
                      {openSections[section.key] ? (
                        <KeyboardArrowUpIcon sx={{ fontSize: 18 }} />
                      ) : (
                        <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
                      )}
                    </IconButton>
                  </Box>
                </TableCell>

                {section.showHeader || sectionIndex === 0 ? (
                  columns.map((col, colIndex) => (
                    <TableCell
                      key={String(col.key)}
                      sx={{ border: 'none', py: 2 }}
                    >
                      {colIndex === 0 ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.9rem',
                              color: '#1e293b',
                              letterSpacing: '-0.01em',
                            }}
                          >
                            {section.title}
                          </Typography>
                          <Chip
                            label={section.rows.filter(r => !(r as Record<string, unknown>).isEmptyState).length}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              bgcolor: openSections[section.key] ? '#6552D0' : '#e2e8f0',
                              color: openSections[section.key] ? 'white' : '#64748b',
                              transition: 'all 0.2s ease',
                              '& .MuiChip-label': { px: 1 },
                            }}
                          />
                        </Box>
                      ) : (
                        <Typography
                          sx={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#94a3b8',
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                          }}
                        >
                          {col.label}
                        </Typography>
                      )}
                    </TableCell>
                  ))
                ) : (
                  <TableCell colSpan={columns.length} sx={{ border: 'none', py: 2 }}>
                    <Typography
                      sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}
                    >
                      {section.title}
                    </Typography>
                  </TableCell>
                )}
              </TableRow>

              {/* SECTION ROWS */}
              {openSections[section.key] &&
                section.rows.map((row, rowIndex) => (
                  <TableRow
                    key={getRowId(row)}
                    sx={{
                      borderBottom: rowIndex === section.rows.length - 1
                        ? '2px solid #e8edf3'
                        : '1px solid #f1f5f9',
                      transition: 'background 0.15s ease',
                      '&:hover': {
                        backgroundColor: '#fafbff',
                      },
                      animation: 'fadeSlideIn 0.2s ease forwards',
                      animationDelay: `${rowIndex * 0.03}s`,
                      opacity: 0,
                      '@keyframes fadeSlideIn': {
                        from: { opacity: 0, transform: 'translateY(-4px)' },
                        to: { opacity: 1, transform: 'translateY(0)' },
                      },
                    }}
                  >
                    <TableCell width={56} sx={{ border: 'none', py: 1.5, pl: 2 }}>
                      <Box
                        sx={{
                          width: 4,
                          height: 24,
                          borderRadius: '2px',
                          bgcolor: '#e2e8f0',
                          mx: 'auto',
                        }}
                      />
                    </TableCell>

                    {columns.map((col) => (
                      <TableCell
                        key={String(col.key)}
                        sx={{
                          border: 'none',
                          py: 1.5,
                          fontSize: '0.85rem',
                          color: '#334155',
                        }}
                      >
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