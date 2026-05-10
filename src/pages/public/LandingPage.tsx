import React from 'react';
import { Container, Row, Col, Button, Navbar, Nav, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHardHat, FaTools, FaBuilding, FaMoneyCheckAlt, FaShieldAlt, FaStar, FaQuoteRight } from 'react-icons/fa';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page d-flex flex-column min-vh-100">
      {/* Navbar */}
      <Navbar bg="white" expand="lg" fixed="top" className="shadow-sm border-bottom">
        <Container>
          <Navbar.Brand as={Link as any} to="/" className="d-flex align-items-center gap-2 font-weight-bold text-primary">
            <FaBuilding size={24} />
            <span className="fs-4 fw-bold">BuildSmart</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <Nav className="align-items-center gap-3">
              <Nav.Link href="#features">Solutions</Nav.Link>
              <Nav.Link href="#pricing">Pricing</Nav.Link>
              <Button as={Link as any} to="/signup" variant="primary" className="fw-bold px-4 rounded-pill">
                Get Started
              </Button>
              <Button as={Link as any} to="/login" variant="outline-secondary" className="fw-bold px-4 rounded-pill">
                Login
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main className="flex-grow-1" style={{ paddingTop: '70px' }}>
        {/* Hero Section */}
        <section className="hero-section position-relative d-flex align-items-center" style={{ minHeight: '80vh', overflow: 'hidden' }}>
          <div className="position-absolute w-100 h-100 top-0 start-0 construction-overlay" style={{ zIndex: 0 }}></div>
          <Container className="position-relative z-1 text-white py-5">
            <Row>
              <Col md={8} lg={6}>
                <div className="d-inline-flex align-items-center bg-primary text-white px-3 py-1 rounded-pill mb-4 border border-white">
                  <span className="small fw-bold text-uppercase tracking-wider">New SiteOps V2.4</span>
                </div>
                <h1 className="display-3 fw-bold mb-4 lh-sm">
                  Build Smarter, <br/><span className="text-primary">Together.</span>
                </h1>
                <p className="lead mb-5 opacity-75">
                  The precision of modern architecture meets industrial-grade performance. Streamline your job site, finance, and safety protocols with the world's most intuitive construction manifest.
                </p>
                <div className="d-flex flex-column flex-sm-row gap-3">
                  <Button as={Link as any} to="/signup" variant="primary" size="lg" className="fw-bold px-5 py-3 rounded-pill shadow-lg d-flex align-items-center justify-content-center gap-2">
                    Start Your Project <FaHardHat />
                  </Button>
                  <Button variant="outline-light" size="lg" className="fw-bold px-5 py-3 rounded-pill">
                    Watch Demo
                  </Button>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Features Section */}
        <section id="features" className="py-5 bg-light">
          <Container className="py-5">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-5">
              <div>
                <h2 className="fw-bold mb-2">Integrated Solutions</h2>
                <p className="text-muted mb-0">Everything you need to manage a high-density job site.</p>
              </div>
              <a href="#" className="text-primary fw-bold text-decoration-none mt-3 mt-md-0">Explore all features &rarr;</a>
            </div>

            <Row className="g-4">
              <Col md={8}>
                <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden group-hover">
                  <Card.Body className="p-4 p-md-5">
                    <div className="d-flex justify-content-between align-items-start mb-4">
                      <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-3">
                        <FaTools size={28} />
                      </div>
                      <span className="badge bg-success bg-opacity-10 text-success p-2">Active Tracking</span>
                    </div>
                    <h3 className="fw-bold mb-3">SiteOps Management</h3>
                    <p className="text-muted mb-4">Real-time labor tracking and equipment logistics. Monitor site progress with millimeter precision using integrated CAD overlays.</p>
                    <div className="bg-secondary bg-opacity-10 rounded-4" style={{ height: '200px', backgroundImage: 'url("https://images.unsplash.com/photo-1541888086425-d81bb19240f5?auto=format&fit=crop&q=80")', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={4}>
                <Card className="h-100 border-0 shadow-sm rounded-4 bg-dark text-white">
                  <Card.Body className="p-4 p-md-5 d-flex flex-column justify-content-between">
                    <div>
                      <div className="p-3 bg-white bg-opacity-10 rounded-3 mb-4 d-inline-block">
                        <FaMoneyCheckAlt size={28} className="text-primary" />
                      </div>
                      <h3 className="fw-bold mb-3">Finance &amp; Billing</h3>
                      <p className="text-white-50">Automated procurement, vendor payments, and budget forecasting built for industrial-scale projects.</p>
                    </div>
                    <div className="mt-4 pt-4 border-top border-secondary">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="small text-uppercase">Monthly Budget</span>
                        <span className="text-primary fw-bold">$1.2M</span>
                      </div>
                      <div className="progress bg-secondary" style={{ height: '8px' }}>
                        <div className="progress-bar bg-primary" role="progressbar" style={{ width: '65%' }} aria-valuenow={65} aria-valuemin={0} aria-valuemax={100}></div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={4}>
                <Card className="h-100 border-0 shadow-sm rounded-4">
                  <Card.Body className="p-4 p-md-5">
                    <div className="p-3 bg-danger bg-opacity-10 text-danger rounded-3 mb-4 d-inline-block">
                      <FaShieldAlt size={28} />
                    </div>
                    <h3 className="fw-bold mb-3">Safety Protocols</h3>
                    <p className="text-muted">Incident reporting and compliance tracking. Keep your team safe with automated OSHA-ready reporting tools.</p>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={8}>
                <Card className="h-100 border-0 shadow-sm rounded-4">
                  <Card.Body className="p-4 p-md-5 d-flex flex-column flex-md-row gap-4 align-items-center">
                    <div className="flex-grow-1">
                      <div className="p-3 bg-info bg-opacity-10 text-info rounded-3 mb-4 d-inline-block">
                        <FaBuilding size={28} />
                      </div>
                      <h3 className="fw-bold mb-3">Resource Logistics</h3>
                      <p className="text-muted">Smart inventory management that anticipates shortages before they happen. Track every bolt and beam across multiple job sites.</p>
                    </div>
                    <div className="w-100 bg-light rounded-4 p-4" style={{ flex: '1' }}>
                      <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                        <li className="d-flex align-items-center bg-white p-3 rounded-3 border">
                          <span className="fw-bold">Reinforced Steel</span>
                          <span className="ms-auto text-success small fw-bold">In Stock</span>
                        </li>
                        <li className="d-flex align-items-center bg-white p-3 rounded-3 border">
                          <span className="fw-bold">Lumber Grade A</span>
                          <span className="ms-auto text-danger small fw-bold">Low Stock</span>
                        </li>
                        <li className="d-flex align-items-center bg-white p-3 rounded-3 border">
                          <span className="fw-bold">Concrete Mix</span>
                          <span className="ms-auto text-success small fw-bold">Arriving Today</span>
                        </li>
                      </ul>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Testimonials */}
        <section className="py-5">
          <Container className="py-5">
            <div className="text-center mb-5 max-w-3xl mx-auto">
              <h2 className="fw-bold mb-3">Trusted by the Builders of the Modern World</h2>
              <div className="text-warning d-flex justify-content-center gap-1 mb-4">
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
              </div>
            </div>
            
            <Row className="g-4">
              {[
                { name: 'David Chen', role: 'Director, Skyline Dev', quote: 'BuildSmart transformed our project margins. We reduced material waste by 18% in the first quarter of adoption.' },
                { name: 'Sarah Mitchell', role: 'COO, Ironwood Const.', quote: 'The safety module alone is worth the investment. Compliance reporting that used to take days now takes minutes.' },
                { name: 'Marcus Thorne', role: 'Lead Engineer, TerraCorp', quote: 'Finally, a digital toolbelt that feels as rugged as the equipment we use on site. Intuitive, fast, and reliable.' }
              ].map((testimonial, idx) => (
                <Col md={4} key={idx}>
                  <Card className="h-100 border border-light shadow-sm rounded-4 position-relative">
                    <FaQuoteRight className="position-absolute text-light" size={40} style={{ top: '20px', right: '20px', zIndex: 0 }} />
                    <Card.Body className="p-4 p-md-5 d-flex flex-column position-relative z-1">
                      <p className="fst-italic text-muted mb-4 flex-grow-1">"{testimonial.quote}"</p>
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary rounded-circle" style={{ width: '50px', height: '50px' }}></div>
                        <div>
                          <p className="fw-bold mb-0">{testimonial.name}</p>
                          <p className="text-muted small text-uppercase mb-0">{testimonial.role}</p>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        {/* CTA */}
        <section className="py-5 bg-primary text-white text-center position-relative overflow-hidden">
          <Container className="py-5 position-relative z-1">
            <h2 className="display-4 fw-bold mb-4">Ready to build smarter?</h2>
            <p className="lead mb-5 opacity-75 max-w-2xl mx-auto">Join over 5,000 developers and contractors who are revolutionizing the construction industry with BuildSmart.</p>
            <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
              <Button as={Link as any} to="/signup" variant="light" size="lg" className="fw-bold px-5 py-3 rounded-pill text-primary shadow">
                Schedule a Consultation
              </Button>
              <Button variant="outline-light" size="lg" className="fw-bold px-5 py-3 rounded-pill">
                View Pricing Plans
              </Button>
            </div>
          </Container>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-dark text-white py-5">
        <Container>
          <Row className="g-4 mb-4">
            <Col md={4}>
              <div className="d-flex align-items-center gap-2 mb-3">
                <FaBuilding className="text-primary" size={24} />
                <span className="fs-4 fw-bold">BuildSmart</span>
              </div>
              <p className="text-white-50 small pe-md-4">Building the foundations of the future with rugged, reliable, and refined digital tools.</p>
            </Col>
            <Col md={2} xs={6}>
              <h6 className="text-uppercase fw-bold mb-3 text-white-50">Platform</h6>
              <ul className="list-unstyled small d-flex flex-column gap-2">
                <li><a href="#" className="text-white text-decoration-none opacity-75">SiteOps</a></li>
                <li><a href="#" className="text-white text-decoration-none opacity-75">Finance</a></li>
                <li><a href="#" className="text-white text-decoration-none opacity-75">Safety</a></li>
              </ul>
            </Col>
            <Col md={2} xs={6}>
              <h6 className="text-uppercase fw-bold mb-3 text-white-50">Company</h6>
              <ul className="list-unstyled small d-flex flex-column gap-2">
                <li><a href="#" className="text-white text-decoration-none opacity-75">About Us</a></li>
                <li><a href="#" className="text-white text-decoration-none opacity-75">Careers</a></li>
                <li><a href="#" className="text-white text-decoration-none opacity-75">Contact</a></li>
              </ul>
            </Col>
            <Col md={4}>
               <h6 className="text-uppercase fw-bold mb-3 text-white-50">Subscribe</h6>
               <p className="text-white-50 small">Get the latest construction tech news.</p>
               <div className="input-group mb-3">
                 <input type="text" className="form-control bg-transparent text-white border-secondary" placeholder="Email address" />
                 <button className="btn btn-primary" type="button">Subscribe</button>
               </div>
            </Col>
          </Row>
          <div className="border-top border-secondary pt-4 mt-4 text-center text-md-start d-flex flex-column flex-md-row justify-content-between align-items-center">
            <p className="text-white-50 small mb-0">&copy; 2024 BuildSmart Technologies Inc. All rights reserved.</p>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default LandingPage;
