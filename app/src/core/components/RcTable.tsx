import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { brmsTheme } from '../theme/brmsTheme';
import { RcTableProps } from "../types/commonTypes";


// ---------------- STYLED COMPONENTS ----------------

const StyledTableContainer = styled(TableContainer)({
  backgroundColor: brmsTheme.colors.white,
  boxShadow: "none",
  borderRadius: 12,
  overflowX: "auto",
  "&::-webkit-scrollbar": { display: "none" },
});

const StyledTableHead = styled(TableHead)({
  backgroundColor: brmsTheme.colors.lightSurfaceHover,
});

const StyledTableCell = styled(TableCell)({
  borderTop: `1px solid ${brmsTheme.colors.lightBorder}`,
  borderBottom: `1px solid ${brmsTheme.colors.lightBorder}`,
  padding: "10px 16px",
  "&:first-of-type": {
    borderLeft: `1px solid ${brmsTheme.colors.lightBorder}`,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  "&:last-of-type": {
    borderRight: `1px solid ${brmsTheme.colors.lightBorder}`,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
});

const StyledTableRow = styled(TableRow, {
  shouldForwardProp: (prop) => prop !== "selected",
})<{ selected?: boolean }>(({ selected }) => ({
  backgroundColor: selected
    ? brmsTheme.colors.primaryGlowSoft
    : brmsTheme.colors.white,
  cursor: "pointer",

  "&:hover": {
    backgroundColor: selected
      ? brmsTheme.colors.primaryGlowSoft
      : brmsTheme.colors.lightSurfaceHover,
  },
}));

// ---------------- COMPONENT ----------------

const RcTable: React.FC<RcTableProps> = ({
  headers,
  rows,
  onRowClick,
  selectedRowIndex,
}) => {
  return (
    <StyledTableContainer>
      <Table
        sx={{
          borderCollapse: "separate",
          borderSpacing: "0 4px",
          width: "100%",
          whiteSpace: "nowrap",
        }}
      >
        {/* ------------------ HEADER---------------- */}
        <StyledTableHead>
          <TableRow>
            {headers.map((header, i) => (
              <StyledTableCell key={i}>
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  sx={{ color: brmsTheme.colors.textGray }}
                >
                  {header}
                </Typography>
              </StyledTableCell>
            ))}
          </TableRow>
        </StyledTableHead>

        {/* ----------------------BODY--------------------- */}
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <StyledTableCell colSpan={headers.length} align="center">
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  sx={{ color: brmsTheme.colors.textGray }}
                >
                  No Data Available
                </Typography>
              </StyledTableCell>
            </TableRow>
          ) : (
            rows.map((row, rowIndex) => (
              <StyledTableRow
                key={rowIndex}
                selected={rowIndex === selectedRowIndex}
                onClick={() => onRowClick?.(row, rowIndex)}
              >
                {headers.map((header, i) => (
                  <StyledTableCell key={i}>
                    <Typography variant="caption" sx={{ color: brmsTheme.colors.textDark }}>
                      {row[header] ?? "-"}
                    </Typography>
                  </StyledTableCell>
                ))}
              </StyledTableRow>
            ))
          )}
        </TableBody>
      </Table>
    </StyledTableContainer>
  );
};

export default RcTable;
