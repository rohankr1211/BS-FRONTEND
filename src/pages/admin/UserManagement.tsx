import React, { useState, useEffect, useCallback } from 'react';
import {
  Row, Col, Card, Form, InputGroup, Button, Table, Badge, Alert, Spinner
} from 'react-bootstrap';
import {
  FaUserPlus, FaSearch, FaEdit, FaBan, FaCheckCircle,
  FaTrash, FaClock, FaSync
} from 'react-icons/fa';
import type { User } from '../../types';
import { UserStatus } from '../../types';
import { userService } from '../../services/userService';
import { UserFormModal } from '../../components/admin/UserFormModal';
import { ConfirmActionModal } from '../../components/admin/ConfirmActionModal';

// Role → badge color map
const ROLE_COLOR: Record<string, string> = {
  ADMIN: 'danger',
  PROJECT_MANAGER: 'primary',
  SITE_ENGINEER: 'info',
  SAFETY_OFFICER: 'warning',
  FINANCE_OFFICER: 'success',
  VENDOR: 'secondary',
};

// Status helpers
const statusVariant = (s: UserStatus) => {
  if (s === UserStatus.ACTIVE) return 'success';
  if (s === UserStatus.PENDING_VERIFICATION) return 'warning';
  if (s === UserStatus.SUSPENDED) return 'danger';
  return 'secondary';
};

const statusLabel = (s: UserStatus) => {
  if (s === UserStatus.PENDING_VERIFICATION) return 'PENDING';
  return s;
};

// Avatar initials from full name
const initials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

export const UserManagement: React.FC = () => {
  // ─── State ───────────────────────────────────────────────────────────────
  const [users, setUsers] = useState<User[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(totalElements / PAGE_SIZE);

  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal state
  const [showUserForm, setShowUserForm] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string; message: string; confirmLabel: string; confirmVariant: string;
    action: () => Promise<void>;
  } | null>(null);

  // ─── Data Fetching ────────────────────────────────────────────────────────
  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await userService.getAllUsers(page, PAGE_SIZE);
      setUsers(data?.content || []);
      setTotalElements(data?.totalElements || 0);
    } catch (err: any) {
      console.error('Fetch users error:', err);
      console.error('Fetch users response data:', err.response?.data);
      setFetchError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Unable to reach the backend server. Please ensure it is running and accessible.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // ─── Filtered display list ─────────────────────────────────────────────────
  const displayedUsers = (Array.isArray(users) ? users : []).filter((u) => {
    if (!u) return false;
    const matchesSearch =
      searchQuery === '' ||
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.role || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ─── Pending users tab ─────────────────────────────────────────────────────
  const pendingUsers = (Array.isArray(displayedUsers) ? displayedUsers : []).filter(
    (u) => u && u.status === UserStatus.PENDING_VERIFICATION
  );

  // ─── Confirm helper ────────────────────────────────────────────────────────
  const openConfirm = (config: typeof confirmConfig) => {
    setConfirmConfig(config);
    setShowConfirm(true);
  };

  // ─── Actions ──────────────────────────────────────────────────────────────
  const handleApprove = (user: User) =>
    openConfirm({
      title: 'Approve User',
      message: `Approve ${user.name} and grant them access to BuildSmart?`,
      confirmLabel: 'Approve',
      confirmVariant: 'success',
      action: async () => { await userService.approveUser(user.userId); loadUsers(); },
    });

  const handleReject = (user: User) =>
    openConfirm({
      title: 'Reject Registration',
      message: `Reject and remove ${user.name}'s registration? This cannot be undone.`,
      confirmLabel: 'Reject',
      confirmVariant: 'danger',
      action: async () => { await userService.rejectUser(user.userId); loadUsers(); },
    });

  const handleToggleStatus = (user: User) => {
    const isSuspending = user.status === UserStatus.ACTIVE;
    openConfirm({
      title: isSuspending ? 'Suspend User' : 'Reactivate User',
      message: isSuspending
        ? `Suspend ${user.name}? They will lose access immediately.`
        : `Reactivate ${user.name} and restore their access?`,
      confirmLabel: isSuspending ? 'Suspend' : 'Reactivate',
      confirmVariant: isSuspending ? 'danger' : 'success',
      action: async () => {
        await userService.toggleUserStatus(user.userId, isSuspending ? 'SUSPENDED' : 'ACTIVE');
        loadUsers();
      },
    });
  };

  const handleDelete = (user: User) =>
    openConfirm({
      title: 'Delete User',
      message: `Permanently delete ${user.name}? All their data will be removed.`,
      confirmLabel: 'Delete',
      confirmVariant: 'danger',
      action: async () => { await userService.deleteUser(user.userId); loadUsers(); },
    });

  const handleEdit = (user: User) => {
    setEditUser(user);
    setShowUserForm(true);
  };

  const handleAddNew = () => {
    setEditUser(null);
    setShowUserForm(true);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">User Management</h2>
          <p className="text-muted mb-0">Manage staff accounts, roles, and access approvals.</p>
        </div>
        <Button
          variant="primary"
          className="fw-bold px-4 py-2 rounded-3 shadow-sm d-flex align-items-center gap-2"
          onClick={handleAddNew}
        >
          <FaUserPlus /> Add New User
        </Button>
      </div>

      {/* Backend error banner */}
      {fetchError && (
        <Alert variant="warning" className="rounded-3 d-flex align-items-center gap-2">
          <strong>Backend Unreachable:</strong> {fetchError}
          <Button variant="outline-warning" size="sm" className="ms-auto" onClick={loadUsers}>
            <FaSync className="me-1" /> Retry
          </Button>
        </Alert>
      )}

      {/* Stats Row */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <p className="small text-uppercase fw-bold text-muted mb-1">Total Users</p>
              <h2 className="fw-bold text-dark mb-0">{isLoading ? '—' : totalElements}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <p className="small text-uppercase fw-bold text-muted mb-1">Pending Approval</p>
              <h2 className="fw-bold text-warning mb-0">
                {isLoading ? '—' : pendingUsers.length}
              </h2>
              {pendingUsers.length > 0 && (
                <small className="text-warning fw-semibold">Action required</small>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="d-flex align-items-center gap-3 p-3">
              <InputGroup>
                <InputGroup.Text className="bg-light border-end-0 text-muted">
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search by name, email, or role..."
                  className="bg-light border-start-0 py-2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
              <Form.Select
                className="bg-light border-0 py-2 rounded-3"
                style={{ maxWidth: '150px' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING_VERIFICATION">Pending</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </Form.Select>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Pending Approvals Quick-View */}
      {pendingUsers.length > 0 && (
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4 border-start border-warning border-4">
          <Card.Header className="bg-warning bg-opacity-10 border-0 py-3 px-4 d-flex align-items-center gap-2">
            <FaClock className="text-warning" />
            <span className="fw-bold text-warning">
              {pendingUsers.length} Registration{pendingUsers.length > 1 ? 's' : ''} Awaiting Approval
            </span>
          </Card.Header>
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="bg-light text-muted small text-uppercase">
                <tr>
                  <th className="py-3 px-4 border-0">User</th>
                  <th className="py-3 px-4 border-0">Role Requested</th>
                  <th className="py-3 px-4 border-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map((u) => (
                  <tr key={u.userId} className="border-bottom">
                    <td className="py-3 px-4">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="bg-warning bg-opacity-20 text-warning fw-bold rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: 40, height: 40, fontSize: 13 }}
                        >
                          {initials(u.name)}
                        </div>
                        <div>
                          <h6 className="mb-0 fw-bold">{u.name}</h6>
                          <small className="text-muted">{u.email}</small>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge bg={ROLE_COLOR[u.role] || 'secondary'} className="px-2 py-1 bg-opacity-15 text-dark">
                        {u.role?.replace('_', ' ') || 'USER'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <Button
                          variant="success"
                          size="sm"
                          className="rounded-3 fw-semibold px-3"
                          onClick={() => handleApprove(u)}
                        >
                          <FaCheckCircle className="me-1" /> Approve
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="rounded-3 fw-semibold px-3"
                          onClick={() => handleReject(u)}
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>
      )}

      {/* Main Users Table */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <Card.Header className="bg-white border-0 py-3 px-4 fw-bold text-dark">
          All Users
        </Card.Header>
        {isLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="text-muted mt-2 mb-0">Loading users...</p>
          </div>
        ) : !fetchError && displayedUsers.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <p className="mb-0">No users found matching your filters.</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead className="bg-light text-muted small text-uppercase">
                  <tr>
                    <th className="py-3 px-4 fw-semibold border-bottom-0">User Profile</th>
                    <th className="py-3 px-4 fw-semibold border-bottom-0">Role</th>
                    <th className="py-3 px-4 fw-semibold border-bottom-0">Status</th>
                    <th className="py-3 px-4 fw-semibold border-bottom-0 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedUsers
                    .filter((u) => u.status !== UserStatus.PENDING_VERIFICATION)
                    .map((user) => (
                    <tr key={user.userId} className="border-bottom">
                      <td className="py-3 px-4">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className={`bg-${ROLE_COLOR[user.role] || 'secondary'} bg-opacity-10 text-${ROLE_COLOR[user.role] || 'secondary'} fw-bold rounded-circle d-flex align-items-center justify-content-center`}
                            style={{ width: 40, height: 40, fontSize: 13 }}
                          >
                            {initials(user.name)}
                          </div>
                          <div>
                            <h6 className="mb-0 fw-bold">{user.name}</h6>
                            <small className="text-muted">{user.email}</small>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          bg={ROLE_COLOR[user.role] || 'secondary'}
                          className="px-2 py-1 bg-opacity-15 text-dark border border-secondary border-opacity-10 rounded-2"
                        >
                          {user.role?.replace('_', ' ') || 'USER'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          bg={statusVariant(user.status)}
                          className="px-2 py-1 bg-opacity-10 rounded-pill d-inline-flex align-items-center gap-1"
                        >
                          <span
                            className={`bg-${statusVariant(user.status)} rounded-circle d-inline-block`}
                            style={{ width: 6, height: 6 }}
                          />
                          <span className={`text-${statusVariant(user.status)}`}>
                            {statusLabel(user.status)}
                          </span>
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <Button
                            variant="light"
                            size="sm"
                            className="text-muted shadow-sm"
                            title="Edit user"
                            onClick={() => handleEdit(user)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant={user.status === UserStatus.ACTIVE ? 'outline-danger' : 'outline-success'}
                            size="sm"
                            className="shadow-sm"
                            title={user.status === UserStatus.ACTIVE ? 'Suspend user' : 'Reactivate user'}
                            onClick={() => handleToggleStatus(user)}
                          >
                            {user.status === UserStatus.ACTIVE ? <FaBan /> : <FaCheckCircle />}
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="shadow-sm"
                            title="Delete user"
                            onClick={() => handleDelete(user)}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {/* Pagination */}
            <Card.Footer className="bg-white py-3 px-4 d-flex justify-content-between align-items-center border-top">
              <span className="text-muted small">
                Showing page {page + 1} of {totalPages || 1} ({totalElements} total)
              </span>
              <div className="d-flex gap-1">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  &lt;
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant={page === i ? 'primary' : 'outline-secondary'}
                    onClick={() => setPage(i)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  &gt;
                </Button>
              </div>
            </Card.Footer>
          </>
        )}
      </Card>

      {/* Modals */}
      <UserFormModal
        show={showUserForm}
        onHide={() => setShowUserForm(false)}
        editUser={editUser}
        onSuccess={loadUsers}
      />

      {confirmConfig && (
        <ConfirmActionModal
          show={showConfirm}
          onHide={() => setShowConfirm(false)}
          onConfirm={confirmConfig.action}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmLabel={confirmConfig.confirmLabel}
          confirmVariant={confirmConfig.confirmVariant}
        />
      )}
    </div>
  );
};
