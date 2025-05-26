import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  BookOnline as BookingIcon,
  AttachMoney as MoneyIcon,
} from "@mui/icons-material";
import { type DashboardStats } from "../../shared/types";
import { formatCurrency, formatDate } from "../../utils/formatters";

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
}> = ({ title, value, icon }) => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" gap={2}>
        <Box>{icon}</Box>
        <Box flex={1}>
          <Typography color="textSecondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h5">{value}</Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/api/admin/dashboard",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard statistics");
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        style={{ minHeight: "400px" }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center">
        {error}
      </Typography>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2}>
        <Box gridColumn="span 12 sm:span 6 md:span 3">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<PeopleIcon fontSize="large" />}
          />
        </Box>
        <Box gridColumn="span 12 sm:span 6 md:span 3">
          <StatCard
            title="Total Hotels"
            value={stats.totalHotels}
            icon={<BusinessIcon fontSize="large" />}
          />
        </Box>
        <Box gridColumn="span 12 sm:span 6 md:span 3">
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon={<BookingIcon fontSize="large" />}
          />
        </Box>
        <Box gridColumn="span 12 sm:span 6 md:span 3">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={<MoneyIcon fontSize="large" />}
          />
        </Box>
      </Box>

      {/* User Distribution */}
      <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2}>
        <Box gridColumn="span 12 md:span 6">
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              User Distribution
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Role</TableCell>
                  <TableCell align="right">Count</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(stats.usersByRole ?? []).map((role) => (
                  <TableRow key={role.role}>
                    <TableCell>{role.role}</TableCell>
                    <TableCell align="right">{role.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>
        <Box gridColumn="span 12 md:span 6">
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Booking Statistics
            </Typography>
            <Table size="small">
              <TableBody>
                {(stats.bookingsByStatus ?? []).map((status) => (
                  <TableRow key={status.status}>
                    <TableCell>{status.status}</TableCell>
                    <TableCell align="right">{status.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      </Box>

      {/* Recent Activity */}
      <Box>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(stats.recentBookings ?? []).map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      {formatDate(new Date(booking.created_at))}
                    </TableCell>
                    <TableCell>{`${booking.first_name} ${booking.last_name}`}</TableCell>
                    <TableCell>{booking.status}</TableCell>
                    <TableCell>{booking.payment_status}</TableCell>
                    <TableCell align="right">
                      {formatCurrency(booking.total_price)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
