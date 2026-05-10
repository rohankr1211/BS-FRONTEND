import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaBuilding, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { DASHBOARD_ROUTES } from '../../utils/constants';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.login({ email, password });
      // Backend might return { success, message, data: { ... } } OR the flat object
      const data = response.data?.data || response.data;
      
      console.log('✅ Login data extracted:', JSON.stringify(data)); 

      // Strict validation of required fields
      if (!data || !data.token) {
        console.error('❌ Missing token in response:', data);
        setError('Authentication failed: Server did not provide an access token.');
        return;
      }

      // Normalize role for robust routing (handle case and spaces/underscores)
      const backendRole = data.role || '';
      const normalizedRole = backendRole.toUpperCase().trim().replace(/\s+/g, '_');
      
      if (!normalizedRole) {
        console.error('❌ Missing role in response:', data);
        setError('Authentication failed: User role is missing.');
        return;
      }

      console.log(`🔑 Role mapping: "${backendRole}" -> "${normalizedRole}"`);

      login(data.token, {
        userId: data.userId || data.email,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: normalizedRole as any,
        status: data.status || 'ACTIVE',
      });

      const targetRoute = DASHBOARD_ROUTES[normalizedRole as keyof typeof DASHBOARD_ROUTES] || '/admin/dashboard';
      console.log(`🚀 Final Route Selection: ${targetRoute}`);
      navigate(targetRoute);
    } catch (err: any) {
      // Log full error so we can see exact backend response in browser console
      console.error('Login error - Status:', err.response?.status);
      console.error('Login error - Data:', JSON.stringify(err.response?.data));
      console.error('Login error - Full:', err);

      if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('Cannot connect to the server. Please ensure the backend is running.');
      } else {
        setError(err.response?.data?.message || err.response?.data?.error || `Error ${err.response?.status}: Check browser console for details.`);
      }

    } finally {
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
                  <h2 className="fw-bold text-primary">BuildSmart</h2>
                  <p className="text-muted small">Precision Site Management</p>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleLogin}>
                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-bold text-muted">EMAIL ADDRESS</Form.Label>
                    <div className="position-relative">
                      <div className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">
                        <FaEnvelope />
                      </div>
                      <Form.Control
                        type="email"
                        placeholder="name@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="ps-5 py-3 rounded-3 bg-light border-0"
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <Form.Label className="small fw-bold text-muted mb-0">PASSWORD</Form.Label>
                      <Link to="/forgot-password" className="small text-primary text-decoration-none">Forgot Password?</Link>
                    </div>
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

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 py-3 rounded-3 fw-bold shadow-sm d-flex justify-content-center align-items-center gap-2 mb-4"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Authenticating...' : 'Access Portal'}
                  </Button>

                  <div className="text-center pt-3 border-top">
                    <p className="small text-muted mb-3">
                      New to BuildSmart? <Link to="/signup" className="text-primary fw-bold text-decoration-none">Create an account</Link>
                    </p>

                  </div>
                </Form>
              </Card.Body>
            </Card>

            <div className="text-center mt-4 text-white-50 small">
              <p className="mb-2">© 2024 BuildSmart Infrastructure V2.4.1</p>
              <div className="d-flex justify-content-center gap-3">
                <a href="#" className="text-white-50 text-decoration-none">Safety Protocols</a>
                <a href="#" className="text-white-50 text-decoration-none">Privacy Policy</a>
                <a href="#" className="text-white-50 text-decoration-none">System Support</a>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginPage;
