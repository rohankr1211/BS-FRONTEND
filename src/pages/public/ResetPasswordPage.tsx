import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaBuilding, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

import { passwordService } from '../../services/passwordService';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: null, message: '' });

    if (!token) {
      setStatus({ type: 'error', message: 'Invalid or missing reset token.' });
      return;
    }

    if (password !== confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    if (password.length < 6 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      setStatus({ type: 'error', message: 'Password must be at least 6 characters and contain 1 uppercase, 1 lowercase, and 1 number.' });
      return;
    }

    setIsLoading(true);

    try {
      await passwordService.resetPassword({ token, newPassword: password });
      
      setTimeout(() => {
        setStatus({ type: 'success', message: 'Password has been successfully reset.' });
        setIsLoading(false);
        setTimeout(() => navigate('/login'), 2000);
      }, 1000);

    } catch (err: any) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to reset password. The link might be expired.' 
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center construction-overlay py-5">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={5}>
            <Card className="border-0 shadow-lg rounded-4 bg-white opacity-95">
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <div className="bg-primary bg-opacity-10 text-primary d-inline-block p-3 rounded-circle mb-3">
                    <FaBuilding size={32} />
                  </div>
                  <h2 className="fw-bold text-primary">Create New Password</h2>
                  <p className="text-muted small">Enter your new secure password.</p>
                </div>

                {status.type === 'error' && <Alert variant="danger">{status.message}</Alert>}
                {status.type === 'success' && <Alert variant="success">{status.message}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-bold text-muted">NEW PASSWORD</Form.Label>
                    <div className="position-relative">
                      <div className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">
                        <FaLock />
                      </div>
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="ps-5 pe-5 py-3 rounded-3 bg-light border-0"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="position-absolute top-50 end-0 translate-middle-y me-3 btn btn-link text-muted p-0"
                        style={{ border: 'none', background: 'transparent' }}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-bold text-muted">CONFIRM PASSWORD</Form.Label>
                    <div className="position-relative">
                      <div className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">
                        <FaLock />
                      </div>
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="ps-5 pe-5 py-3 rounded-3 bg-light border-0"
                      />
                    </div>
                    <Form.Text className="text-muted" style={{ fontSize: '0.7rem' }}>
                      Min 6 chars, 1 uppercase, 1 lowercase, 1 number.
                    </Form.Text>
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 py-3 rounded-3 fw-bold shadow-sm d-flex justify-content-center align-items-center gap-2 mb-4"
                    disabled={isLoading || status.type === 'success'}
                  >
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </Button>

                  <div className="text-center pt-3 border-top">
                    <p className="small text-muted mb-0">
                      <Link to="/login" className="text-primary fw-bold text-decoration-none">Return to login</Link>
                    </p>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ResetPasswordPage;
