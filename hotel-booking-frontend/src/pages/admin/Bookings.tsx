import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { type Booking, BookingStatus, PaymentStatus } from "../../shared/types";
import { formatCurrency, formatDate } from "../../utils/formatters";

interface BookingData extends Booking {
  user_email: string;
  hotel_name: string;
  room_name: string;
}

const getStatusColor = (status: BookingStatus) => {
  switch (status) {
    case BookingStatus.CONFIRMED:
      return "success";
    case BookingStatus.PENDING:
      return "warning";
    case BookingStatus.CANCELLED:
      return "error";
    case BookingStatus.COMPLETED:
      return "info";
    case BookingStatus.NO_SHOW:
      return "default";
    default:
      return "default";
  }
};

const getPaymentStatusColor = (status: PaymentStatus) => {
  switch (status) {
    case PaymentStatus.PAID:
      return "success";
    case PaymentStatus.PENDING:
      return "warning";
    case PaymentStatus.FAILED:
      return "error";
    case PaymentStatus.REFUNDED:
      return "info";
    default:
      return "default";
  }
};

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalBookings, setTotalBookings] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchBookings = async () => {
    try {
      const response = await fetch(
        `/api/admin/bookings?page=${page + 1}&limit=${pageSize}${
          searchQuery ? `&search=${searchQuery}` : ""
        }${statusFilter ? `&status=${statusFilter}` : ""}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data = await response.json();
      setBookings(
        data.bookings.map((booking: any) => ({
          ...booking,
          user_email: booking.userEmail,
          hotel_name: booking.hotelName,
          room_name: booking.roomName,
          created_at: booking.createdAt,
          total_price: booking.totalPrice,
          payment_status: booking.paymentStatus,
        }))
      );
      setTotalBookings(data.pagination.totalBookings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page, pageSize, searchQuery, statusFilter]);

  const columns: GridColDef[] = [
    {
      field: "created_at",
      headerName: "Booking Date",
      width: 180,
      valueFormatter: (params) => formatDate(new Date(params.value)),
    },
    { field: "user_email", headerName: "Guest", width: 200 },
    { field: "hotel_name", headerName: "Hotel", width: 200 },
    { field: "room_name", headerName: "Room", width: 150 },
    {
      field: "check_in",
      headerName: "Check-in",
      width: 120,
      valueFormatter: (params) => formatDate(new Date(params.value)),
    },
    {
      field: "check_out",
      headerName: "Check-out",
      width: 120,
      valueFormatter: (params) => formatDate(new Date(params.value)),
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: "payment_status",
      headerName: "Payment",
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getPaymentStatusColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: "total_price",
      headerName: "Total",
      width: 120,
      valueFormatter: (params) => formatCurrency(params.value),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Booking Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gap={2}
        sx={{ mb: 2 }}
      >
        <Box gridColumn="span 12 sm:span 6 md:span 4">
          <TextField
            fullWidth
            label="Search Bookings"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by guest email or hotel"
          />
        </Box>
        <Box gridColumn="span 12 sm:span 6 md:span 4">
          <FormControl fullWidth>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={statusFilter}
              label="Filter by Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {Object.values(BookingStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Paper sx={{ height: 600, width: "100%" }}>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={bookings}
            columns={columns}
            paginationModel={{
              page,
              pageSize,
            }}
            pageSizeOptions={[5, 10, 20, 50]}
            rowCount={totalBookings}
            onPaginationModelChange={(model) => {
              setPage(model.page);
              setPageSize(model.pageSize);
            }}
            disableRowSelectionOnClick
            getRowId={(row) => row.id}
          />
        )}
      </Paper>
    </Box>
  );
};

export default Bookings;
