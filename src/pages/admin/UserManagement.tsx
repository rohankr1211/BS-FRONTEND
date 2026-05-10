import React, { useState, useEffect, useCallback } from 'react';
import {
  Row, Col, Card, Form, InputGroup, Button, Table, Badge, Alert, Spinner, OverlayTrigger, Tooltip
} from 'react-bootstrap';
import {
  FaUserPlus, FaSearch, FaEdit, FaCheckCircle,
  FaTrash, FaClock, FaSync, FaUsers, FaUserShield, FaUserCheck, FaUserTimes, FaFilter
} from 'react-icons/fa';
import type { User } from '../../types';
import { UserStatus, Role } from '../../types';
import { userService } from '../../services/userService';
import { UserFormModal } from '../../components/admin/UserFormModal';
import { ConfirmActionModal } from '../../components/admin/ConfirmActionModal';
import { toast } from 'react-toastify';

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
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [approvingUserId, setApprovingUserId] = useState<string | null>(null);
  const [rejectingUserId, setRejectingUserId] = useState<string | null>(null);

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

  const activeCount = (Array.isArray(users) ? users : []).filter(u => u?.status === UserStatus.ACTIVE).length;
  const suspendedCount = (Array.isArray(users) ? users : []).filter(u => u?.status === UserStatus.SUSPENDED).length;

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
      action: async () => {
        setApprovingUserId(user.userId);
        await userService.approveUser(user.userId);
        toast.success(`${user.name} has been approved successfully!`);
        loadUsers();
        setApprovingUserId(null);
      },
    });

  const handleReject = (user: User) =>
    openConfirm({
      title: 'Reject Registration',
      message: `Reject and remove ${user.name}'s registration? This cannot be undone.`,
      confirmLabel: 'Reject',
      confirmVariant: 'danger',
      action: async () => {
        setRejectingUserId(user.userId);
        await userService.rejectUser(user.userId);
        toast.warning(`${user.name}'s registration has been rejected.`);
        loadUsers();
        setRejectingUserId(null);
      },
    });

  const handleDelete = (user: User) =>
    openConfirm({
      title: 'Delete User',
      message: `Permanently delete ${user.name}? All their data will be removed.`,
      confirmLabel: 'Delete',
      confirmVariant: 'danger',
      action: async () => {
        await userService.deleteUser(user.userId);
        toast.error(`${user.name} has been deleted permanently.`);
        loadUsers();
      },
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
          <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <FaUserShield className="text-primary" /> User Management
          </h2>
          <p className="text-muted mb-0">Manage staff accounts, roles, and access approvals.</p>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            className="fw-bold px-3 py-2 rounded-3 shadow-sm d-flex align-items-center gap-2"
            onClick={loadUsers}
            disabled={isLoading}
          >
            <FaSync className={isLoading ? 'spin-animation' : ''} /> Refresh
          </Button>
          <Button
            variant="primary"
            className="fw-bold px-4 py-2 rounded-3 shadow-sm d-flex align-items-center gap-2"
            onClick={handleAddNew}
          >
            <FaUserPlus /> Add New User
          </Button>
        </div>
      </div>

      {/* Backend error banner */}
      {fetchError && (
        <Alert variant="warning" className="rounded-4 d-flex align-items-center gap-2 border-0 shadow-sm">
          <strong>Backend Unreachable:</strong> {fetchError}
          <Button variant="outline-warning" size="sm" className="ms-auto rounded-pill" onClick={loadUsers}>
            <FaSync className="me-1" /> Retry
          </Button>
        </Alert>
      )}

      {/* Stats Row */}
      <Row className="g-4 mb-4">
        <Col lg={3} sm={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100 stat-card-hover overflow-hidden" style={{ borderTop: '3px solid #0d6efd' }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <p className="small text-uppercase fw-bold text-muted mb-0">Total Users</p>
                <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3"><FaUsers size={16} /></div>
              </div>
              <h2 className="fw-bold text-dark mb-0">{isLoading ? <Spinner animation="border" size="sm" /> : totalElements}</h2>
              <small className="text-muted">All registered accounts</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} sm={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100 stat-card-hover overflow-hidden" style={{ borderTop: '3px solid #198754' }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <p className="small text-uppercase fw-bold text-muted mb-0">Active</p>
                <div className="bg-success bg-opacity-10 text-success p-2 rounded-3"><FaUserCheck size={16} /></div>
              </div>
              <h2 className="fw-bold text-success mb-0">{isLoading ? <Spinner animation="border" size="sm" /> : activeCount}</h2>
              <small className="text-muted">Currently active</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} sm={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100 stat-card-hover overflow-hidden" style={{ borderTop: '3px solid #ffc107' }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <p className="small text-uppercase fw-bold text-muted mb-0">Pending</p>
                <div className="bg-warning bg-opacity-10 text-warning p-2 rounded-3"><FaClock size={16} /></div>
              </div>
              <h2 className="fw-bold text-warning mb-0">
                {isLoading ? <Spinner animation="border" size="sm" /> : pendingUsers.length}
              </h2>
              {pendingUsers.length > 0 ? (
                <small className="text-warning fw-semibold">⚡ Action required</small>
              ) : (
                <small className="text-muted">No pending requests</small>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} sm={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100 stat-card-hover overflow-hidden" style={{ borderTop: '3px solid #dc3545' }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <p className="small text-uppercase fw-bold text-muted mb-0">Suspended</p>
                <div className="bg-danger bg-opacity-10 text-danger p-2 rounded-3"><FaUserTimes size={16} /></div>
              </div>
              <h2 className="fw-bold text-danger mb-0">{isLoading ? <Spinner animation="border" size="sm" /> : suspendedCount}</h2>
              <small className="text-muted">Access revoked</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search & Filter Bar */}
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="d-flex flex-column flex-md-row align-items-md-center gap-3 p-3 px-4">
          <div className="d-flex align-items-center gap-2 text-muted">
            <FaFilter /> <span className="fw-bold small text-uppercase">Filters</span>
          </div>
          <InputGroup className="flex-grow-1">
            <InputGroup.Text className="bg-light border-end-0 text-muted rounded-start-3">
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search by name, email, or role..."
              className="bg-light border-start-0 py-2 rounded-end-3"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
          <Form.Select
            className="bg-light border-0 py-2 rounded-3"
            style={{ maxWidth: '180px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING_VERIFICATION">Pending</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </Form.Select>
          {(searchQuery || statusFilter !== 'ALL') && (
            <Button variant="outline-secondary" size="sm" className="rounded-pill px-3" onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); }}>
              Clear
            </Button>
          )}
        </Card.Body>
      </Card>

      {/* Pending Approvals Quick-View */}
      {pendingUsers.length > 0 && (
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4" style={{ borderLeft: '4px solid #ffc107' }}>
          <Card.Header className="bg-warning bg-opacity-10 border-0 py-3 px-4 d-flex align-items-center gap-2">
            <div className="bg-warning text-white p-1 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 28, height: 28 }}>
              <FaClock size={14} />
            </div>
            <span className="fw-bold text-dark">
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
                  <tr key={u.userId} className="border-bottom transition-bg">
                    <td className="py-3 px-4">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="bg-warning bg-opacity-20 text-warning fw-bold rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: 44, height: 44, fontSize: 14 }}
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
                      <Badge bg={ROLE_COLOR[u.role] || 'secondary'} className="px-2 py-1 bg-opacity-15 text-dark rounded-pill">
                        {u.role?.replace('_', ' ') || 'USER'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <Button
                          variant="success"
                          size="sm"
                          className="rounded-pill fw-semibold px-3 shadow-sm"
                          onClick={() => handleApprove(u)}
                          disabled={approvingUserId === u.userId || rejectingUserId === u.userId}
                        >
                          {approvingUserId === u.userId ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <><FaCheckCircle className="me-1" /> Approve</>
                          )}
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="rounded-pill fw-semibold px-3"
                          onClick={() => handleReject(u)}
                          disabled={approvingUserId === u.userId || rejectingUserId === u.userId}
                        >
                          {rejectingUserId === u.userId ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <>Reject</>
                          )}
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
        <Card.Header className="bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
          <span className="fw-bold text-dark d-flex align-items-center gap-2">
            <FaUsers className="text-primary" /> All Users
          </span>
          <Badge bg="light" text="dark" className="border px-3 py-2 rounded-pill">
            {displayedUsers.filter(u => u.status !== UserStatus.PENDING_VERIFICATION).length} shown
          </Badge>
        </Card.Header>
        {isLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="text-muted mt-2 mb-0">Loading users...</p>
          </div>
        ) : !fetchError && displayedUsers.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <FaSearch size={32} className="mb-3 text-muted opacity-50" />
            <p className="mb-0 fw-bold">No users found matching your filters.</p>
            <p className="small">Try adjusting your search query or status filter.</p>
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
                    <tr 
                      key={user.userId} 
                      className={`border-bottom transition-bg ${hoveredRow === user.userId ? 'bg-primary bg-opacity-5' : ''}`}
                      onMouseEnter={() => setHoveredRow(user.userId)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td className="py-3 px-4">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className={`bg-${ROLE_COLOR[user.role] || 'secondary'} bg-opacity-10 text-${ROLE_COLOR[user.role] || 'secondary'} fw-bold rounded-circle d-flex align-items-center justify-content-center shadow-sm`}
                            style={{ width: 44, height: 44, fontSize: 14 }}
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
                          className="px-2 py-1 bg-opacity-15 text-dark border border-secondary border-opacity-10 rounded-pill"
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
                            style={{ width: 7, height: 7 }}
                          />
                          <span className={`text-${statusVariant(user.status)} fw-bold`}>
                            {statusLabel(user.status)}
                          </span>
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <OverlayTrigger placement="top" overlay={<Tooltip>Edit user</Tooltip>}>
                            <Button
                              variant="light"
                              size="sm"
                              className="text-muted shadow-sm rounded-3 action-btn"
                              onClick={() => handleEdit(user)}
                            >
                              <FaEdit />
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger placement="top" overlay={<Tooltip>Delete user</Tooltip>}>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="shadow-sm rounded-3 action-btn"
                              onClick={() => handleDelete(user)}
                            >
                              <FaTrash />
                            </Button>
                          </OverlayTrigger>
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
                Showing page <span className="fw-bold text-dark">{page + 1}</span> of <span className="fw-bold text-dark">{totalPages || 1}</span> ({totalElements} total)
              </span>
              <div className="d-flex gap-1">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="rounded-3"
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
                    className="rounded-3"
                    onClick={() => setPage(i)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="rounded-3"
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

      {/* Interactive styles */}
      <style>{`
        .stat-card-hover { transition: all 0.25s ease; }
        .stat-card-hover:hover { transform: translateY(-4px); box-shadow: 0 8px 30px rgba(0,0,0,0.12) !important; }
        .transition-bg { transition: background-color 0.2s ease; }
        .action-btn { transition: all 0.2s ease; }
        .action-btn:hover { transform: scale(1.1); }
        .spin-animation { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
