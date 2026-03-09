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
import { brmsTheme } from '@/core/theme/brmsTheme';
import { RcCollapsibleTableProps } from '@/core/types/commonTypes';


export function RcCollapsibleTable<T extends Record<string, React.ReactNode>>({
  columns,
  sections,
  getRowId,
}: RcCollapsibleTableProps<T>) {
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    setOpenSections((prev) => {
      const next: Record<string, boolean> = { ...prev };
      sections.forEach((s) => {
        if (!(s.key in next)) {
          next[s.key] = false;
        }
      });
      return next;
    });
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
        borderRadius: '14px',
        border: `1px solid ${brmsTheme.colors.lightBorder}`,
        background: brmsTheme.colors.white,
        boxShadow: '0 6px 18px rgba(15, 23, 42, 0.06)',
        fontFamily: brmsTheme.fonts.sans,
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { background: brmsTheme.colors.lightBorderHover, borderRadius: '4px' },
      }}
    >
      <Table stickyHeader>
        <TableBody>
          {sections.map((section, sectionIndex) => (
            <React.Fragment key={section.key}>
              {/* SECTION HEADER ROW */}
              <TableRow
                sx={{
                  background: openSections[section.key] ? brmsTheme.colors.lightPurpleSurface : brmsTheme.colors.bgGray,
                  borderBottom: `1px solid ${brmsTheme.colors.lightBorder}`,
                  borderLeft: openSections[section.key]
                    ? `4px solid ${brmsTheme.colors.primary}`
                    : '4px solid transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: openSections[section.key] ? brmsTheme.colors.lightPurpleSurfaceHover : brmsTheme.colors.lightSurfaceHover,
                    cursor: 'pointer',
                  },
                }}
                onClick={() => toggleSection(section.key)}
              >
                <TableCell width={56} sx={{ border: 'none', py: 2, pl: 2 }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '8px',
                      background: openSections[section.key] ? brmsTheme.colors.primary : brmsTheme.colors.lightBorder,
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
                      sx={{ p: 0, color: openSections[section.key] ? brmsTheme.colors.textOnPrimary : brmsTheme.colors.lightTextMid }}
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
                    <TableCell key={String(col.key)} sx={{ border: 'none', py: 2 }}>
                      {colIndex === 0 ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.92rem',
                              color: brmsTheme.colors.textDark,
                              letterSpacing: '0.005em',
                              fontFamily: brmsTheme.fonts.sans,
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
                              bgcolor: openSections[section.key] ? brmsTheme.colors.primary : brmsTheme.colors.lightBorder,
                              color: openSections[section.key] ? 'white' : brmsTheme.colors.lightTextLow,
                              transition: 'all 0.2s ease',
                              '& .MuiChip-label': { px: 1 },
                            }}
                          />
                        </Box>
                      ) : (
                        <Typography
                          sx={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            color: brmsTheme.colors.lightTextLow,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            fontFamily: brmsTheme.fonts.sans,
                          }}
                        >
                          {col.label}
                        </Typography>
                      )}
                    </TableCell>
                  ))
                ) : (
                  <TableCell colSpan={columns.length} sx={{ border: 'none', py: 2 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', color: brmsTheme.colors.textDark, fontFamily: brmsTheme.fonts.sans }}>
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
                        ? `2px solid ${brmsTheme.colors.lightBorder}`
                        : `1px solid ${brmsTheme.colors.bgGrayLight}`,
                      transition: 'background 0.15s ease',
                      backgroundColor: rowIndex % 2 === 0 ? brmsTheme.colors.white : brmsTheme.colors.bgGrayLight,
                      '&:hover': { backgroundColor: brmsTheme.colors.bgGrayLight },
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
                          bgcolor: brmsTheme.colors.lightBorder,
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
                          fontSize: '0.84rem',
                          color: brmsTheme.colors.textGray,
                          fontWeight: 500,
                          fontFamily: brmsTheme.fonts.sans,
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
