import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { type User, UserRole } from "../../shared/types";
import { formatDate, formatCurrency } from "../../utils/formatters";

interface UserData extends User {
  total_bookings: number;
  total_spent: number;
}

interface UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  totalBookings: number;
  totalSpent: number;
  createdAt: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editUser, setEditUser] = useState<UserData | null>(null);
  const [editRole, setEditRole] = useState<UserRole>(UserRole.GUEST);

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `/api/admin/users?page=${page + 1}&limit=${pageSize}${
          selectedRole ? `&role=${selectedRole}` : ""
        }${searchQuery ? `&search=${searchQuery}` : ""}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(
        data.users.map((user: UserResponse) => ({
          id: user.id,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          role: user.role,
          created_at: user.createdAt,
          total_bookings: user.totalBookings || 0,
          total_spent: user.totalSpent || 0,
        }))
      );
      setTotalUsers(data.pagination.totalUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize, selectedRole, searchQuery]);

  const handleRoleChange = async () => {
    if (!editUser) return;

    try {
      const response = await fetch(`/api/admin/users/${editUser.id}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ role: editRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user role");
      }

      const data = await response.json();

      // Update the user in the local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === editUser.id
            ? {
                ...user,
                role: data.user.role,
              }
            : user
        )
      );

      // Close the dialog
      setEditUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const columns: GridColDef[] = [
    { field: "email", headerName: "Email", flex: 1 },
    { field: "first_name", headerName: "First Name", flex: 1 },
    { field: "last_name", headerName: "Last Name", flex: 1 },
    { field: "role", headerName: "Role", width: 120 },
    {
      field: "total_bookings",
      headerName: "Total Bookings",
      width: 130,
      type: "number",
    },
    {
      field: "total_spent",
      headerName: "Total Spent",
      width: 130,
      valueFormatter: (params: { value: number }) =>
        formatCurrency(params.value),
    },
    {
      field: "created_at",
      headerName: "Created At",
      width: 180,
      valueFormatter: (params: { value: string }) =>
        formatDate(new Date(params.value)),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            setEditUser(params.row);
            setEditRole(params.row.role);
          }}
        >
          Edit Role
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        User Management
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
            label="Search Users"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>
        <Box gridColumn="span 12 sm:span 6 md:span 4">
          <FormControl fullWidth>
            <InputLabel>Filter by Role</InputLabel>
            <Select
              value={selectedRole}
              label="Filter by Role"
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <MenuItem value="">All Roles</MenuItem>
              {Object.values(UserRole).map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
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
            rows={users}
            columns={columns}
            paginationModel={{
              page,
              pageSize,
            }}
            pageSizeOptions={[5, 10, 20, 50]}
            rowCount={totalUsers}
            onPaginationModelChange={(model) => {
              setPage(model.page);
              setPageSize(model.pageSize);
            }}
            disableRowSelectionOnClick
            getRowId={(row) => row.id}
          />
        )}
      </Paper>

      {/* Edit Role Dialog */}
      <Dialog open={!!editUser} onClose={() => setEditUser(null)}>
        <DialogTitle>Edit User Role</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={editRole}
              label="Role"
              onChange={(e) => setEditRole(e.target.value as UserRole)}
            >
              {Object.values(UserRole).map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUser(null)}>Cancel</Button>
          <Button onClick={handleRoleChange} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;
