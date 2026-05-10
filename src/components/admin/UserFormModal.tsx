import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { Role } from '../../types';
import type { User } from '../../types';
import { userService } from '../../services/userService';
import type { CreateUserPayload, UpdateUserPayload } from '../../services/userService';

interface UserFormModalProps {
  show: boolean;
  onHide: () => void;
  editUser?: User | null;
  onSuccess: () => void;
}

const ALL_ROLES = [
  Role.ADMIN,
  Role.PROJECT_MANAGER,
  Role.SITE_ENGINEER,
  Role.SAFETY_OFFICER,
  Role.FINANCE_OFFICER,
  Role.VENDOR,
];

export const UserFormModal: React.FC<UserFormModalProps> = ({
  show,
  onHide,
  editUser,
  onSuccess,
}) => {
  const isEdit = !!editUser;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>(Role.SITE_ENGINEER);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill fields when editing
  useEffect(() => {
    if (editUser) {
      setName(editUser.name);
      setEmail(editUser.email);
      setPhone(editUser.phone || '');
      setRole(editUser.role);
      setPassword('');
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setRole(Role.SITE_ENGINEER);
      setPassword('');
    }
    setError(null);
  }, [editUser, show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isEdit && editUser) {
        const payload: UpdateUserPayload = { name, phone, role };
        await userService.updateUser(editUser.userId, payload);
      } else {
        const payload: CreateUserPayload = { name, email, phone, role, password };
        await userService.createUser(payload);
      }
      onSuccess();
      onHide();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        (isEdit ? 'Failed to update user.' : 'Failed to create user.');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">{isEdit ? 'Edit User' : 'Add New User'}</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="px-4 py-3">
          {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-muted text-uppercase">Full Name</Form.Label>
            <Form.Control
              required
              type="text"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-3 py-2"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-muted text-uppercase">Email Address</Form.Label>
            <Form.Control
              required
              type="email"
              placeholder="user@buildsmart.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isEdit}
              className="rounded-3 py-2"
            />
            {isEdit && <Form.Text className="text-muted">Email cannot be changed.</Form.Text>}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-muted text-uppercase">Phone (optional)</Form.Label>
            <Form.Control
              type="tel"
              placeholder="+91 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-3 py-2"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-muted text-uppercase">Role</Form.Label>
            <Form.Select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="rounded-3 py-2"
            >
              {ALL_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.replace('_', ' ')}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {!isEdit && (
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small text-muted text-uppercase">Temporary Password</Form.Label>
              <Form.Control
                required
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                className="rounded-3 py-2"
              />
            </Form.Group>
          )}
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0 px-4 pb-4">
          <Button variant="light" onClick={onHide} className="rounded-3 px-4">
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading} className="rounded-3 px-4 fw-semibold">
            {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create User'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
