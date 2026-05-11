import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaBuilding, FaUser, FaEnvelope, FaLock, FaPhone, FaUserTie } from 'react-icons/fa';
import { Role } from '../../types';
import { authService } from '../../services/authService';

export const SignupPage = () => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.register(formData);
      const data = response.data?.data || response.data;
      
      if (data.success) {
        navigate('/pending-verification');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Registration failed. Please try again.');
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
                <h4 className="fw-bold text-center mb-4">Create Account</h4>
              </Card.Header>
              <Card.Body className="p-4">
                {error && (
                  <Alert variant="danger" className="mb-3">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSignup}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Full Name</Form.Label>
                    <div className="input-group">
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required
                        className="rounded-3"
                      />
                      <span className="input-group-text">
                        <FaUser className="text-muted" />
                      </span>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Email Address</Form.Label>
                    <div className="input-group">
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
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
                    <Form.Label className="fw-bold">Phone Number</Form.Label>
                    <div className="input-group">
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        required
                        className="rounded-3"
                      />
                      <span className="input-group-text">
                        <FaPhone className="text-muted" />
                      </span>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Password</Form.Label>
                    <div className="input-group">
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                        className="rounded-3"
                      />
                      <span className="input-group-text">
                        <FaLock className="text-muted" />
                      </span>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Role</Form.Label>
                    <Form.Select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                      className="rounded-3"
                    >
                      <option value={Role.SITE_ENGINEER}>Site Engineer</option>
                      <option value={Role.SAFETY_OFFICER}>Safety Officer</option>
                      <option value={Role.PROJECT_MANAGER}>Project Manager</option>
                      <option value={Role.FINANCE_OFFICER}>Finance Officer</option>
                      <option value={Role.VENDOR}>Vendor</option>
                    </Form.Select>
                  </Form.Group>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Form.Check
                      type="checkbox"
                      label="I agree to the terms and conditions"
                      className="text-muted"
                      required
                    />
                    <Link to="/login" className="text-decoration-none">
                      <small className="text-muted">Already have an account? Sign in</small>
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
                        Creating account...
                      </>
                    ) : (
                      <>
                        <FaUserTie className="me-2" />
                        Sign Up
                      </>
                    )}
                  </Button>
                </Form>

                <div className="text-center mt-4">
                  <p className="text-muted mb-0">
                    By signing up, you agree to our{' '}
                    <Link to="/terms" className="text-decoration-none">
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-decoration-none">
                      Privacy Policy
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
