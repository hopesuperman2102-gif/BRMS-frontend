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
import { brmsTheme } from '@/core/theme/brmsTheme';
import { RcTableProps } from "@/core/types/commonTypes";

const { colors } = brmsTheme;

const StyledTableContainer = styled(TableContainer)({
  backgroundColor: 'transparent',
  boxShadow: "none",
  borderRadius: 12,
  overflowX: "auto",
  "&::-webkit-scrollbar": { display: "none" },
});

const StyledTableHead = styled(TableHead)({
  backgroundColor: 'rgba(255,255,255,0.04)',
});

const StyledTableCell = styled(TableCell)({
  borderTop: `1px solid ${colors.panelBorder}`,
  borderBottom: `1px solid ${colors.panelBorder}`,
  padding: "10px 16px",
  "&:first-of-type": {
    borderLeft: `1px solid ${colors.panelBorder}`,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  "&:last-of-type": {
    borderRight: `1px solid ${colors.panelBorder}`,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
});

const StyledTableRow = styled(TableRow, {
  shouldForwardProp: (prop) => prop !== "selected",
})<{ selected?: boolean }>(({ selected }) => ({
  backgroundColor: selected
    ? colors.panelIndigoTint15
    : 'transparent',
  cursor: "pointer",
  "&:hover": {
    backgroundColor: selected
      ? colors.panelIndigoTint15
      : 'rgba(79,70,229,0.06)',
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
        {/* ------------------ HEADER ---------------- */}
        <StyledTableHead>
          <TableRow>
            {headers.map((header, i) => (
              <StyledTableCell key={i}>
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  sx={{ color: colors.panelTextMid }}
                >
                  {header}
                </Typography>
              </StyledTableCell>
            ))}
          </TableRow>
        </StyledTableHead>

        {/* ---------------------- BODY --------------------- */}
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <StyledTableCell colSpan={headers.length} align="center">
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  sx={{ color: colors.panelTextLow }}
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
                    <Typography variant="caption" sx={{ color: colors.textOnPrimary }}>
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