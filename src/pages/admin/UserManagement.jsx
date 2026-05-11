import React, { useState, useEffect, useCallback } from 'react';
import {
  Row, Col, Card, Form, InputGroup, Button, Table, Badge, Alert, Spinner, OverlayTrigger, Tooltip
} from 'react-bootstrap';
import {
  FaUserPlus, FaSearch, FaEdit, FaCheckCircle,
  FaTrash, FaClock, FaSync, FaUsers, FaUserShield, FaUserCheck, FaUserTimes, FaFilter
} from 'react-icons/fa';
import { UserStatus, Role } from '../../types';
import { userService } from '../../services/userService';
import { UserFormModal } from '../../components/admin/UserFormModal';
import { ConfirmActionModal } from '../../components/admin/ConfirmActionModal';
import { toast } from 'react-toastify';

// Role → badge color map
const ROLE_COLOR = {
  ADMIN: 'danger',
  PROJECT_MANAGER: 'primary',
  SITE_ENGINEER: 'info',
  SAFETY_OFFICER: 'warning',
  FINANCE_OFFICER: 'success',
  VENDOR: 'secondary'
};

// Status helpers
const statusVariant = (s) => {
  if (s === UserStatus.ACTIVE) return 'success';
  if (s === UserStatus.PENDING_VERIFICATION) return 'warning';
  if (s === UserStatus.SUSPENDED) return 'danger';
  return 'secondary';
};

const statusLabel = (s) => {
  if (s === UserStatus.ACTIVE) return 'Active';
  if (s === UserStatus.PENDING_VERIFICATION) return 'Pending';
  if (s === UserStatus.SUSPENDED) return 'Suspended';
  return 'Inactive';
};

// Avatar initials from full name
const initials = (name) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

export const UserManagement = () => {
  // ─── State ───────────────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const PAGE_SIZE = 15;

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('User fetch error:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const openCreateModal = () => {
    setSelectedUser(null);
    setShowCreate(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditForm(user);
    setShowEdit(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDelete(true);
  };

  const handleCreate = async (userData) => {
    setSubmitting(true);
    try {
      await userService.createUser(userData);
      toast.success('User created successfully');
      setShowCreate(false);
      await loadUsers();
    } catch (err) {
      console.error('Create user error:', err);
      setError('Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await userService.updateUser(selectedUser.userId, editForm);
      toast.success('User updated successfully');
      setShowEdit(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (err) {
      console.error('Update user error:', err);
      setError('Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await userService.deleteUser(selectedUser.userId);
      toast.success('User deleted successfully');
      setShowDelete(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (err) {
      console.error('Delete user error:', err);
      setError('Failed to delete user');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || user.role === filterRole;
    const matchesStatus = !filterStatus || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(totalElements / PAGE_SIZE);

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">User Management</h3>
          <p className="text-muted mb-0">Manage user accounts and permissions.</p>
        </div>
        <Button variant="primary" className="rounded-3" onClick={openCreateModal}>
          <FaUserPlus /> Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="d-flex gap-3 mb-4">
        <InputGroup className="w-auto">
          <Form.Control
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="rounded-3"
          />
          <Button variant="outline-secondary" className="rounded-3">
            <FaFilter />
          </Button>
        </InputGroup>
        <Form.Select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="rounded-3">
          <option value="">All Roles</option>
          <option value={Role.ADMIN}>Admin</option>
          <option value={Role.PROJECT_MANAGER}>Project Manager</option>
          <option value={Role.SITE_ENGINEER}>Site Engineer</option>
          <option value={Role.SAFETY_OFFICER}>Safety Officer</option>
          <option value={Role.FINANCE_OFFICER}>Finance Officer</option>
          <option value={Role.VENDOR}>Vendor</option>
        </Form.Select>
        <Form.Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="rounded-3">
          <option value="">All Statuses</option>
          <option value={UserStatus.ACTIVE}>Active</option>
          <option value={UserStatus.PENDING_VERIFICATION}>Pending Verification</option>
          <option value={UserStatus.SUSPENDED}>Suspended</option>
          <option value={UserStatus.INACTIVE}>Inactive</option>
        </Form.Select>
      </div>

      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <div className="text-muted mt-3">Loading users...</div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-5 bg-light rounded-4">
          <FaUsers size={40} className="text-muted mb-3 opacity-25" />
          <p className="text-muted mb-0">No users found. Use the button above to add one.</p>
        </div>
      ) : (
        <Card className="border-0 shadow-sm rounded-4">
          <Card.Header className="bg-light border-0">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Users ({filteredUsers.length} of {totalElements})</h5>
              <div className="text-muted small">
                Page {page + 1} of {totalPages}
              </div>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 fw-bold text-muted small text-uppercase">User</th>
                  <th className="border-0 fw-bold text-muted small text-uppercase">Email</th>
                  <th className="border-0 fw-bold text-muted small text-uppercase">Role</th>
                  <th className="border-0 fw-bold text-muted small text-uppercase">Status</th>
                  <th className="border-0 fw-bold text-muted small text-uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.userId}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                          <span className="fw-bold">{initials(user.name)}</span>
                        </div>
                        <div>
                          <div className="fw-semibold">{user.name}</div>
                          <div className="small text-muted">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <Badge bg={ROLE_COLOR[user.role]} className="fs-6">
                        {user.role}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={statusVariant(user.status)} className="fs-6">
                        {statusLabel(user.status)}
                      </Badge>
                    </td>
                    <td className="small text-muted">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <OverlayTrigger placement="top" overlay={<Tooltip>{user.lastLoginAt ? `Last login: ${new Date(user.lastLoginAt).toLocaleString()}` : 'No login recorded'}</Tooltip>}>
                          <FaClock className="text-muted" />
                        </OverlayTrigger>
                        <Button variant="outline-primary" size="sm" className="rounded-3" onClick={() => openEditModal(user)}>
                          <FaEdit />
                        </Button>
                        <Button variant="outline-danger" size="sm" className="rounded-3" onClick={() => openDeleteModal(user)}>
                          <FaTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
          <Card.Footer className="border-0 bg-light">
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-muted small">
                Showing {filteredUsers.length} of {totalElements} entries
              </div>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-secondary"
                  className="rounded-3"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline-secondary"
                  className="rounded-3"
                  onClick={() => setPage(page + 1)}
                  disabled={filteredUsers.length < PAGE_SIZE}
                >
                  Next
                </Button>
              </div>
            </div>
          </Card.Footer>
        </Card>
      )}

      <UserFormModal show={showCreate} onHide={() => setShowCreate(false)} onCreated={handleCreate} />
      <UserFormModal show={showEdit} onHide={() => setShowEdit(false)} user={selectedUser} onUpdated={handleEdit} />
      <ConfirmActionModal
        show={showDelete}
        onHide={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone.`}
        actionText="Delete User"
        variant="danger"
      />
    </div>
  );
};
