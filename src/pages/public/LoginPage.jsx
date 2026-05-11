import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaBuilding, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { DASHBOARD_ROUTES } from '../../utils/constants';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.login({ email, password });
      // Backend might return { success, message, data: { ... } } OR a flat object
      const data = response.data?.data || response.data;
      
      console.log('✅ Login data extracted:', JSON.stringify(data));

      // Strict validation of required fields
      if (!data || !data.user) {
        setError('Invalid login response. Please try again.');
        return;
      }

      // Check if user object has required properties
      if (!data.user.userId || !data.user.name || !data.user.email || !data.user.role) {
        setError('Invalid user data received. Please contact support.');
        return;
      }

      // Store auth token and user data
      localStorage.setItem('auth_token', data.token || '');
      localStorage.setItem('user_data', JSON.stringify(data.user));

      // Navigate based on user role
      const role = data.user.role;
      if (role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (role === 'PROJECT_MANAGER') {
        navigate('/pm/dashboard');
      } else if (role === 'SITE_ENGINEER') {
        navigate('/site/dashboard');
      } else if (role === 'SAFETY_OFFICER') {
        navigate('/safety/dashboard');
      } else if (role === 'FINANCE_OFFICER') {
        navigate('/finance/dashboard');
      } else if (role === 'VENDOR') {
        navigate('/vendor/dashboard');
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="shadow-lg border-0 rounded-4">
              <Card.Header className="bg-white border-0 text-center py-4">
                <div className="d-flex align-items-center justify-content-center mb-3">
                  <FaBuilding size={48} className="text-primary mb-3" />
                  <h2 className="fw-bold text-dark">BuildSmart</h2>
                  <p className="text-muted">Construction Management System</p>
                </div>
                <h4 className="fw-bold text-center mb-4">Sign In</h4>
              </Card.Header>
              <Card.Body className="p-4">
                {error && (
                  <Alert variant="danger" className="mb-3">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleLogin}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Email Address</Form.Label>
                    <div className="input-group">
                      <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="rounded-3"
                      />
                      <span className="input-group-text">
                        <FaEnvelope className="text-muted" />
                      </span>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Password</Form.Label>
                    <div className="input-group">
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="rounded-3"
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                        className="rounded-3"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </div>
                  </Form.Group>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Remember me"
                      className="text-muted"
                    />
                    <Link to="/forgot-password" className="text-decoration-none">
                      <small className="text-muted">Forgot password?</small>
                    </Link>
                  </div>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 rounded-3 py-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Signing in...
                      </>
                    ) : (
                      <>
                        <FaLock className="me-2" />
                        Sign In
                      </>
                    )}
                  </Button>
                </Form>

                <div className="text-center mt-4">
                  <p className="text-muted mb-0">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-decoration-none">
                      Sign up here
                    </Link>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};
