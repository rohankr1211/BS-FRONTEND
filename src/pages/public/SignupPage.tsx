import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaBuilding, FaUser, FaEnvelope, FaLock, FaPhone, FaUserTie } from 'react-icons/fa';
import { Role } from '../../types';

import { authService } from '../../services/authService';

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: Role.SITE_ENGINEER
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.email.endsWith('@gmail.com')) {
      setError('Email must be a valid Gmail account (@gmail.com).');
      return;
    }

    if (formData.password.length < 6 || !/[A-Z]/.test(formData.password) || !/[a-z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      setError('Password must be at least 6 characters and contain 1 uppercase, 1 lowercase, and 1 number.');
      return;
    }

    setIsLoading(true);

    try {
      await authService.signup(formData);
      
      setTimeout(() => {
        setIsLoading(false);
        navigate('/pending-verification'); // Redirect to pending verification screen
      }, 1000);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center construction-overlay py-5">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6}>
            <Card className="border-0 shadow-lg rounded-4 bg-white opacity-95">
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <div className="bg-primary bg-opacity-10 text-primary d-inline-block p-3 rounded-circle mb-3">
                    <FaBuilding size={32} />
                  </div>
                  <h2 className="fw-bold text-primary">Join BuildSmart</h2>
                  <p className="text-muted small">Register for portal access. Approval required.</p>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSignup}>
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-muted">FULL NAME</Form.Label>
                        <div className="position-relative">
                          <div className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">
                            <FaUser />
                          </div>
                          <Form.Control
                            type="text"
                            name="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="ps-5 py-2 rounded-3 bg-light border-0"
                          />
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-muted">GMAIL ADDRESS</Form.Label>
                        <div className="position-relative">
                          <div className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">
                            <FaEnvelope />
                          </div>
                          <Form.Control
                            type="email"
                            name="email"
                            placeholder="name@gmail.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="ps-5 py-2 rounded-3 bg-light border-0"
                          />
                        </div>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-muted">PHONE</Form.Label>
                        <div className="position-relative">
                          <div className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">
                            <FaPhone />
                          </div>
                          <Form.Control
                            type="tel"
                            name="phone"
                            placeholder="+1 (555) 000-0000"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            className="ps-5 py-2 rounded-3 bg-light border-0"
                          />
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-muted">PASSWORD</Form.Label>
                        <div className="position-relative">
                          <div className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">
                            <FaLock />
                          </div>
                          <Form.Control
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="ps-5 py-2 rounded-3 bg-light border-0"
                          />
                        </div>
                        <Form.Text className="text-muted" style={{ fontSize: '0.7rem' }}>
                          Min 6 chars, 1 uppercase, 1 lowercase, 1 number.
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="small fw-bold text-muted">ROLE</Form.Label>
                        <div className="position-relative">
                          <div className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted z-1">
                            <FaUserTie />
                          </div>
                          <Form.Select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="ps-5 py-2 rounded-3 bg-light border-0 position-relative"
                            style={{ paddingLeft: '2.5rem' }}
                          >
                            {Object.values(Role).map((r) => (
                              <option key={r} value={r}>{r.replace('_', ' ')}</option>
                            ))}
                          </Form.Select>
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 py-3 rounded-3 fw-bold shadow-sm d-flex justify-content-center align-items-center gap-2 mb-4"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Submitting...' : 'Register Account'}
                  </Button>

                  <div className="text-center pt-3 border-top">
                    <p className="small text-muted mb-0">
                      Already have an account? <Link to="/login" className="text-primary fw-bold text-decoration-none">Sign in</Link>
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

export default SignupPage;
