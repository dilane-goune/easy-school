import React from "react";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableContainer from "@mui/material/TableContainer";
import TableFooter from "@mui/material/TableFooter";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";

function TablePaginationActions(props) {
    const theme = useTheme();
    const { count, page, rowsPerPage, onPageChange } = props;

    const handleFirstPageButtonClick = (event) => {
        onPageChange(event, 0);
    };

    const handleBackButtonClick = (event) => {
        onPageChange(event, page - 1);
    };

    const handleNextButtonClick = (event) => {
        onPageChange(event, page + 1);
    };

    const handleLastPageButtonClick = (event) => {
        onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };

    return (
        <Box sx={{ flexShrink: 0, ml: 2.5 }}>
            <IconButton
                onClick={handleFirstPageButtonClick}
                disabled={page === 0}
                aria-label="first page"
            >
                {theme.direction === "rtl" ? (
                    <LastPageIcon />
                ) : (
                    <FirstPageIcon />
                )}
            </IconButton>
            <IconButton
                onClick={handleBackButtonClick}
                disabled={page === 0}
                aria-label="previous page"
            >
                {theme.direction === "rtl" ? (
                    <KeyboardArrowRight />
                ) : (
                    <KeyboardArrowLeft />
                )}
            </IconButton>
            <IconButton
                onClick={handleNextButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="next page"
            >
                {theme.direction === "rtl" ? (
                    <KeyboardArrowLeft />
                ) : (
                    <KeyboardArrowRight />
                )}
            </IconButton>
            <IconButton
                onClick={handleLastPageButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="last page"
            >
                {theme.direction === "rtl" ? (
                    <FirstPageIcon />
                ) : (
                    <LastPageIcon />
                )}
            </IconButton>
        </Box>
    );
}

TablePaginationActions.propTypes = {
    count: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
};

const MyTableRow = ({ data, number, keys, onClick, selected }) => {
    return (
        <TableRow
            sx={{
                bgcolor: selected && onClick ? "#faf1f1" : "initial",
            }}
        >
            {number ? <TableCell>{number}</TableCell> : null}
            {keys.map((k, ind) => {
                return (
                    <TableCell
                        onClick={(e) => {
                            onClick(data, e);
                        }}
                        key={ind}
                    >
                        {data[k]}
                    </TableCell>
                );
            })}
        </TableRow>
    );
};

export default function MyTable({
    headData,
    data = [],
    numbered,
    onClick = () => {},
    small = false,
    noSkickyheader = false,
    noFooter = false,
    asPage = false,
}) {
    // state
    const [keys, setKeys] = React.useState([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    const [selectedRow, setSelectedRow] = React.useState();

    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    React.useEffect(() => {
        setKeys(headData.map((h) => h.key));
    }, [headData]);

    return (
        <TableContainer component={asPage ? Paper : null}>
            <Table
                stickyHeader={!noSkickyheader}
                sx={{ minWidth: 500 }}
                aria-label="pagination table"
                size={small ? "small" : "medium"}
            >
                <TableHead>
                    <TableRow>
                        {numbered ? (
                            <TableCell
                                sx={{
                                    width: "20px !important",
                                }}
                            >
                                #
                            </TableCell>
                        ) : null}
                        {headData.map(({ label, minWidth, ...rest }, ind) => {
                            return (
                                <TableCell
                                    sx={{ minWidth: minWidth }}
                                    key={ind}
                                    {...rest}
                                >
                                    {label}
                                </TableCell>
                            );
                        })}
                    </TableRow>
                </TableHead>
                {noFooter ? (
                    <TableBody>
                        {data.map((l, ind) => {
                            return (
                                <MyTableRow
                                    key={ind}
                                    data={l}
                                    number={numbered ? ind + 1 : undefined}
                                    keys={keys}
                                    onClick={(opt, e) => {
                                        setSelectedRow(ind);
                                        onClick(opt, e);
                                    }}
                                    selected={selectedRow === ind}
                                    sx={{ whiteSpace: "nowrap" }}
                                />
                            );
                        })}

                        {emptyRows > 0 && (
                            <TableRow style={{ height: 53 * emptyRows }}>
                                <TableCell colSpan={6} />
                            </TableRow>
                        )}
                    </TableBody>
                ) : (
                    <TableBody>
                        {(rowsPerPage > 0
                            ? data.slice(
                                  page * rowsPerPage,
                                  page * rowsPerPage + rowsPerPage
                              )
                            : data
                        ).map((l, ind) => {
                            return (
                                <MyTableRow
                                    key={ind}
                                    data={l}
                                    number={numbered ? ind + 1 : undefined}
                                    keys={keys}
                                    onClick={(opt, e) => {
                                        setSelectedRow(ind);
                                        onClick(opt, e);
                                    }}
                                    selected={selectedRow === ind}
                                />
                            );
                        })}

                        {emptyRows > 0 && (
                            <TableRow
                                style={{
                                    height: small
                                        ? 33.02 * emptyRows
                                        : 53.02 * emptyRows,
                                }}
                            >
                                <TableCell colSpan={6} />
                            </TableRow>
                        )}
                    </TableBody>
                )}

                {!noFooter && data.length > 5 && (
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                rowsPerPageOptions={[
                                    5,
                                    10,
                                    15,
                                    20,
                                    25,
                                    50,
                                    { label: "All", value: -1 },
                                ]}
                                colSpan={3}
                                count={data.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                SelectProps={{
                                    inputProps: {
                                        "aria-label": "rows per page",
                                    },
                                    native: true,
                                }}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                ActionsComponent={TablePaginationActions}
                            />
                        </TableRow>
                    </TableFooter>
                )}
            </Table>
        </TableContainer>
    );
}
