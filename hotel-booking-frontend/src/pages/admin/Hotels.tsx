import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Alert,
  CircularProgress,
  Rating,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { type Hotel } from "../../shared/types";
import { formatCurrency, formatDate } from "../../utils/formatters";

interface HotelData extends Hotel {
  manager_email: string;
  total_rooms: number;
  total_bookings: number;
  total_revenue: number;
}

const Hotels: React.FC = () => {
  const [hotels, setHotels] = useState<HotelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalHotels, setTotalHotels] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchHotels = async () => {
    try {
      const response = await fetch(
        `/api/admin/hotels?page=${page + 1}&limit=${pageSize}${
          searchQuery ? `&search=${searchQuery}` : ""
        }`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch hotels");
      }

      const data = await response.json();
      setHotels(
        data.hotels.map((hotel: any) => ({
          ...hotel,
          manager_email: hotel.managerEmail,
          total_rooms: hotel.totalRooms,
          total_bookings: hotel.totalBookings,
          total_revenue: hotel.totalRevenue,
          created_at: hotel.createdAt,
        }))
      );
      setTotalHotels(data.pagination.totalHotels);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [page, pageSize, searchQuery]);

  const columns: GridColDef[] = [
    { field: "name", headerName: "Hotel Name", flex: 1 },
    { field: "city", headerName: "City", width: 130 },
    { field: "country", headerName: "Country", width: 130 },
    {
      field: "average_rating",
      headerName: "Rating",
      width: 150,
      renderCell: (params) => (
        <Rating value={params.value} precision={0.5} readOnly />
      ),
    },
    {
      field: "manager_email",
      headerName: "Manager",
      width: 200,
    },
    {
      field: "total_rooms",
      headerName: "Rooms",
      width: 100,
      type: "number",
    },
    {
      field: "total_bookings",
      headerName: "Bookings",
      width: 100,
      type: "number",
    },
    {
      field: "total_revenue",
      headerName: "Revenue",
      width: 130,
      valueFormatter: (params) => formatCurrency(params.value),
    },
    {
      field: "created_at",
      headerName: "Created At",
      width: 180,
      valueFormatter: (params) => formatDate(new Date(params.value)),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Hotel Management
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
            label="Search Hotels"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, city, or country"
          />
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
            rows={hotels}
            columns={columns}
            paginationModel={{
              page,
              pageSize,
            }}
            pageSizeOptions={[5, 10, 20, 50]}
            rowCount={totalHotels}
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

export default Hotels;
