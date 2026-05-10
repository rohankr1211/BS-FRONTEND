import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Navbar, Nav, Card, Accordion, Badge, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHardHat, FaTools, FaBuilding, FaMoneyCheckAlt, FaShieldAlt, FaStar, FaQuoteRight, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

const Counter = ({ end, duration = 2, suffix = '' }: { end: number, duration?: number, suffix?: string }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / (duration * 1000), 1);
      
      // Easing function for smooth counting
      const easeOutQuart = 1 - Math.pow(1 - percentage, 4);
      setCount(Math.floor(end * easeOutQuart));

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(updateCount);
      }
    };

    animationFrame = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{count}{suffix}</span>;
};


const LandingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { title: 'Plan & Design', desc: 'Import CAD files and instantly generate material lists and labor requirements.', icon: <FaBuilding /> },
    { title: 'Execute & Build', desc: 'Track daily site progress, manage vendors, and allocate resources in real-time.', icon: <FaHardHat /> },
    { title: 'Monitor & Report', desc: 'Generate automated compliance, financial, and safety reports with one click.', icon: <FaShieldAlt /> }
  ];

  return (
    <div className="landing-page d-flex flex-column min-vh-100 bg-white">
      {/* Navbar */}
      <Navbar bg="white" expand="lg" fixed="top" className="shadow-sm border-bottom py-3 transition-all">
        <Container>
          <Navbar.Brand as={Link as any} to="/" className="d-flex align-items-center gap-2 text-primary">
            <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}>
              <FaBuilding size={28} />
            </motion.div>
            <span className="fs-3 fw-bold tracking-tight">BuildSmart</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <Nav className="align-items-center gap-4">
              <Nav.Link href="#features" className="fw-medium text-dark hover-primary">Solutions</Nav.Link>
              <Nav.Link href="#how-it-works" className="fw-medium text-dark hover-primary">Workflow</Nav.Link>
              <Nav.Link href="#testimonials" className="fw-medium text-dark hover-primary">Testimonials</Nav.Link>
              <div className="d-flex gap-3 ms-2">
                <Button as={Link as any} to="/login" variant="outline-primary" className="fw-bold px-4 rounded-pill">
                  Login
                </Button>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button as={Link as any} to="/signup" variant="primary" className="fw-bold px-4 rounded-pill shadow-sm">
                    Get Started Free
                  </Button>
                </motion.div>
              </div>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main className="flex-grow-1" style={{ paddingTop: '86px' }}>
        {/* Hero Section */}
        <section className="hero-section position-relative d-flex align-items-center bg-light overflow-hidden" style={{ minHeight: '90vh' }}>
          <div className="position-absolute top-0 start-0 w-100 h-100" style={{ 
            background: 'radial-gradient(circle at top right, rgba(13,110,253,0.1) 0%, transparent 40%), radial-gradient(circle at bottom left, rgba(13,110,253,0.05) 0%, transparent 40%)',
            zIndex: 0 
          }}></div>
          
          <Container className="position-relative z-1 py-5">
            <Row className="align-items-center g-5">
              <Col lg={6}>
                <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
                  <motion.div variants={fadeInUp} className="d-inline-flex align-items-center bg-white text-primary px-4 py-2 rounded-pill mb-4 shadow-sm border">
                    <span className="spinner-grow spinner-grow-sm text-success me-2" role="status" aria-hidden="true"></span>
                    <span className="small fw-bold text-uppercase tracking-wider">BuildSmart V3.0 is Live</span>
                  </motion.div>
                  
                  <motion.h1 variants={fadeInUp} className="display-2 fw-bolder mb-4 lh-sm text-dark">
                    Construct with <br/>
                    <span className="text-primary position-relative">
                      Absolute Precision
                      <svg className="position-absolute w-100" style={{ bottom: '-10px', left: 0, height: '12px' }} viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.00021 6.82422C41.3533 2.5029 130.655 -1.93665 198.001 6.82422" stroke="#0d6efd" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                  </motion.h1>
                  
                  <motion.p variants={fadeInUp} className="lead mb-5 text-secondary fs-4" style={{ maxWidth: '90%' }}>
                    The operating system for modern construction. Unify your job site, finance, vendors, and safety protocols in one powerful platform.
                  </motion.p>
                  
                  <motion.div variants={fadeInUp} className="d-flex flex-column flex-sm-row gap-3">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button as={Link as any} to="/signup" variant="primary" size="lg" className="fw-bold px-5 py-3 rounded-pill shadow-lg d-flex align-items-center justify-content-center gap-3 w-100">
                        Start Building Free <FaArrowRight />
                      </Button>
                    </motion.div>
                  </motion.div>
                  
                  <motion.div variants={fadeInUp} className="mt-5 pt-4 border-top">
                    <p className="text-muted small fw-bold text-uppercase mb-3">Trusted by industry leaders</p>
                    <div className="d-flex gap-4 opacity-50 grayscale" style={{ filter: 'grayscale(100%)' }}>
                       <FaBuilding size={32} /> <FaTools size={32} /> <FaHardHat size={32} /> <FaShieldAlt size={32} />
                    </div>
                  </motion.div>
                </motion.div>
              </Col>
              
              <Col lg={6} className="d-none d-lg-block">
                <motion.div initial="hidden" animate="visible" variants={scaleUp} className="position-relative">
                  <div className="bg-primary rounded-circle position-absolute blur-3xl opacity-25" style={{ width: '400px', height: '400px', top: '10%', right: '10%', filter: 'blur(60px)' }}></div>
                  <Card className="border-0 shadow-xl rounded-4 overflow-hidden" style={{ transform: 'rotate(2deg) translateY(-20px)' }}>
                    <Card.Header className="bg-dark border-0 py-3 d-flex align-items-center gap-2">
                      <div className="rounded-circle bg-danger" style={{width: 12, height: 12}}></div>
                      <div className="rounded-circle bg-warning" style={{width: 12, height: 12}}></div>
                      <div className="rounded-circle bg-success" style={{width: 12, height: 12}}></div>
                      <div className="ms-3 bg-secondary bg-opacity-25 rounded px-3 py-1 text-white-50 small w-50">buildsmart.app/dashboard</div>
                    </Card.Header>
                    <Card.Body className="p-0 position-relative">
                      <img src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=1000" alt="Dashboard Preview" className="img-fluid" />
                      
                      {/* Floating Interactive Elements */}
                      <motion.div 
                        initial={{ y: 20, opacity: 0 }} 
                        animate={{ y: 0, opacity: 1 }} 
                        transition={{ delay: 1, duration: 0.8, repeat: Infinity, repeatType: 'reverse' as const }}
                        className="position-absolute bg-white p-3 rounded-4 shadow-lg d-flex align-items-center gap-3"
                        style={{ bottom: '-20px', left: '-20px' }}>
                        <div className="bg-success bg-opacity-10 text-success p-2 rounded-circle"><FaCheckCircle size={24} /></div>
                        <div>
                          <div className="fw-bold text-dark">Concrete Poured</div>
                          <div className="text-muted small">Zone B • Just now</div>
                        </div>
                      </motion.div>
                      
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Stats Section */}
        <section className="py-5 bg-dark text-white position-relative mt-5 mt-lg-0">
          <Container>
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
              className="row g-4 text-center">
              {[
                { label: 'Projects Completed', value: 1200, suffix: '+' },
                { label: 'Active Users', value: 45000, suffix: '+' },
                { label: 'Cost Saved', value: 150, suffix: 'M$' },
                { label: 'Uptime', value: 99.9, suffix: '%' }
              ].map((stat, idx) => (
                <Col md={3} sm={6} key={idx}>
                  <motion.div variants={fadeInUp} className="p-4 rounded-4 bg-white bg-opacity-10 hover-bg-opacity-20 transition-all">
                    <div className="display-4 fw-bold text-primary mb-2">
                      <Counter end={stat.value} duration={2.5} suffix={stat.suffix} />
                    </div>
                    <div className="text-white-50 fw-medium text-uppercase tracking-wider">{stat.label}</div>
                  </motion.div>
                </Col>
              ))}
            </motion.div>
          </Container>
        </section>

        {/* Interactive Features Section */}
        <section id="features" className="py-6 py-md-8 bg-white" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
          <Container>
            <div className="text-center mb-5 pb-4 max-w-3xl mx-auto">
              <Badge bg="primary" pill className="px-3 py-2 mb-3 bg-opacity-10 text-primary border border-primary-subtle">Core Features</Badge>
              <h2 className="display-5 fw-bold mb-3">Engineered for the Modern Builder</h2>
              <p className="lead text-muted">Everything you need to manage complex projects from groundbreaking to ribbon-cutting.</p>
            </div>

            <Row className="g-5">
              {[
                { title: 'SiteOps Intelligence', desc: 'Real-time labor tracking, equipment logistics, and site progress monitoring with millimeter precision.', icon: <FaTools />, color: 'primary', img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=600' },
                { title: 'Financial Command', desc: 'Automated procurement, seamless vendor payments, and dynamic budget forecasting for maximum ROI.', icon: <FaMoneyCheckAlt />, color: 'success', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600' },
                { title: 'Safety & Compliance', desc: 'Proactive incident reporting, OSHA-ready compliance tracking, and automated hazard alerts.', icon: <FaShieldAlt />, color: 'danger', img: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=600' }
              ].map((feature, idx) => (
                <Col lg={4} key={idx}>
                  <motion.div 
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp}
                    whileHover={{ y: -15, transition: { duration: 0.2 } }}
                    className="h-100">
                    <Card className="h-100 border-0 shadow-sm rounded-5 overflow-hidden group">
                      <div className="position-relative overflow-hidden" style={{ height: '240px' }}>
                        <div className="position-absolute w-100 h-100 bg-dark" style={{ zIndex: 1, opacity: 0.2 }}></div>
                        <motion.img 
                          whileHover={{ scale: 1.1 }} transition={{ duration: 0.5 }}
                          src={feature.img} className="w-100 h-100 object-fit-cover" alt={feature.title} 
                        />
                        <div className={`position-absolute top-0 start-0 m-4 p-3 bg-white text-${feature.color} rounded-4 shadow-sm z-2`}>
                          {React.cloneElement(feature.icon as React.ReactElement<any>, { size: 30 })}
                        </div>
                      </div>
                      <Card.Body className="p-5 bg-light">
                        <h3 className="fw-bold mb-3 fs-4">{feature.title}</h3>
                        <p className="text-muted mb-4 lh-lg">{feature.desc}</p>
                        <a href="#" className={`text-${feature.color} fw-bold text-decoration-none d-inline-flex align-items-center gap-2 group-hover:gap-3 transition-all`}>
                          Explore feature <FaArrowRight />
                        </a>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        {/* How It Works - Interactive Tabs */}
        <section id="how-it-works" className="py-6 bg-light border-top border-bottom" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
          <Container>
             <div className="text-center mb-5 pb-4">
              <h2 className="display-5 fw-bold mb-3">How BuildSmart Works</h2>
              <p className="lead text-muted">A streamlined workflow designed to eliminate friction.</p>
            </div>

            <Row className="align-items-center g-5">
              <Col lg={5}>
                <div className="d-flex flex-column gap-3">
                  {tabs.map((tab, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab(idx)}
                      className={`p-4 rounded-4 cursor-pointer transition-all border ${activeTab === idx ? 'bg-primary text-white shadow-lg border-primary' : 'bg-white text-dark hover-bg-light border-light shadow-sm'}`}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-center gap-4">
                        <div className={`p-3 rounded-circle ${activeTab === idx ? 'bg-white text-primary' : 'bg-primary bg-opacity-10 text-primary'}`}>
                           {React.cloneElement(tab.icon as React.ReactElement<any>, { size: 24 })}
                        </div>
                        <div>
                          <h4 className="fw-bold mb-1">{tab.title}</h4>
                          <p className={`mb-0 small ${activeTab === idx ? 'text-white-50' : 'text-muted'}`}>{tab.desc}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Col>
              <Col lg={7}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white p-2 rounded-5 shadow-lg border"
                  >
                    <div className="bg-light rounded-4 w-100 overflow-hidden" style={{ height: '450px' }}>
                      {activeTab === 0 && <img src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=800" className="w-100 h-100 object-fit-cover" alt="Plan & Design - Architectural blueprints" />}
                      {activeTab === 1 && <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800" className="w-100 h-100 object-fit-cover" alt="Execute & Build - Construction workers on site" />}
                      {activeTab === 2 && <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800" className="w-100 h-100 object-fit-cover" alt="Monitor & Report - Analytics dashboard" />}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-6 bg-dark text-white overflow-hidden" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
          <Container>
            <div className="text-center mb-5 pb-3">
               <div className="text-warning d-flex justify-content-center gap-1 mb-3 fs-4">
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
              </div>
              <h2 className="display-6 fw-bold mb-3">Trusted by Industry Leaders</h2>
            </div>
            
            <Row className="g-4">
              {[
                { name: 'David Chen', role: 'Director, Skyline Dev', quote: 'BuildSmart transformed our project margins. We reduced material waste by 18% in the first quarter of adoption.' },
                { name: 'Sarah Mitchell', role: 'COO, Ironwood Const.', quote: 'The safety module alone is worth the investment. Compliance reporting that used to take days now takes minutes.' },
                { name: 'Marcus Thorne', role: 'Lead Engineer, TerraCorp', quote: 'Finally, a digital toolbelt that feels as rugged as the equipment we use on site. Intuitive, fast, and reliable.' }
              ].map((testimonial, idx) => (
                <Col md={4} key={idx}>
                  <motion.div 
                    initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                    className="h-100 p-5 bg-white bg-opacity-10 rounded-5 position-relative hover-bg-opacity-20 transition-all cursor-pointer">
                    <FaQuoteRight className="position-absolute text-white opacity-10" size={60} style={{ top: '20px', right: '20px' }} />
                    <p className="fst-italic text-light fs-5 mb-5 position-relative z-1 lh-lg">"{testimonial.quote}"</p>
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center fw-bold fs-5 shadow-sm" style={{ width: '60px', height: '60px' }}>
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <h5 className="fw-bold mb-1 text-white">{testimonial.name}</h5>
                        <p className="text-white-50 small text-uppercase tracking-wider mb-0">{testimonial.role}</p>
                      </div>
                    </div>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        {/* FAQ Section */}
        <section className="py-6 bg-light" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
          <Container className="max-w-4xl mx-auto" style={{ maxWidth: '800px' }}>
             <div className="text-center mb-5">
              <h2 className="display-6 fw-bold mb-3">Frequently Asked Questions</h2>
              <p className="text-muted">Everything you need to know about the product and billing.</p>
            </div>
            
            <Accordion defaultActiveKey="0" className="shadow-sm rounded-4 overflow-hidden border-0">
              {[
                { q: "Is there a free trial available?", a: "Yes, you can try BuildSmart completely free for 14 days. No credit card required. You'll get access to all Professional tier features to see if it's the right fit." },
                { q: "Can I integrate BuildSmart with my existing accounting software?", a: "Absolutely. BuildSmart integrates natively with QuickBooks, Xero, and major ERPs like Oracle and SAP to ensure seamless financial data flow." },
                { q: "How secure is my project data?", a: "We utilize enterprise-grade 256-bit AES encryption, multi-factor authentication, and conduct regular third-party security audits. Your data is stored on redundant, ISO-certified AWS servers." },
                { q: "Do you offer onboarding support for my team?", a: "Yes, Professional and Enterprise plans include dedicated onboarding specialists who will train your team, help migrate historical data, and set up your initial projects." }
              ].map((faq, idx) => (
                <Accordion.Item eventKey={idx.toString()} key={idx} className="border-bottom border-light p-2">
                  <Accordion.Header className="fw-bold fs-5">{faq.q}</Accordion.Header>
                  <Accordion.Body className="text-muted lh-lg fs-6 pt-0 pb-4 pe-5">
                    {faq.a}
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </Container>
        </section>

        {/* CTA */}
        <section className="py-6 bg-primary text-white text-center position-relative overflow-hidden" style={{ paddingTop: '120px', paddingBottom: '120px' }}>
          <div className="position-absolute w-100 h-100 top-0 start-0 opacity-25" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
          <Container className="position-relative z-1">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleUp}>
              <h2 className="display-3 fw-bolder mb-4">Ready to Build Smarter?</h2>
              <p className="lead mb-5 opacity-75 fs-4" style={{ maxWidth: '700px', margin: '0 auto' }}>Join over 5,000 developers and contractors who are revolutionizing the construction industry with BuildSmart.</p>
              <div className="d-flex flex-column flex-sm-row justify-content-center gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button as={Link as any} to="/signup" variant="light" size="lg" className="fw-bold px-5 py-4 rounded-pill text-primary shadow-lg fs-5 d-flex align-items-center gap-2">
                    Get Started Free <FaArrowRight />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline-light" size="lg" className="fw-bold px-5 py-4 rounded-pill fs-5 border-2 hover-bg-light hover-text-primary transition-all">
                    Schedule Demo
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </Container>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-dark text-white pt-6 pb-4 border-top border-secondary">
        <Container className="pt-5">
          <Row className="g-5 mb-5">
            <Col lg={4} md={6}>
              <div className="d-flex align-items-center gap-2 mb-4">
                <FaBuilding className="text-primary" size={30} />
                <span className="fs-3 fw-bold tracking-tight">BuildSmart</span>
              </div>
              <p className="text-white-50 lh-lg pe-lg-4 mb-4">Building the foundations of the future with rugged, reliable, and refined digital tools for the modern construction industry.</p>
              <div className="d-flex gap-3">
                {/* Social icons placeholders */}
                <div className="bg-white bg-opacity-10 p-2 rounded-circle hover-bg-primary cursor-pointer transition-all text-white"><FaBuilding size={20} /></div>
                <div className="bg-white bg-opacity-10 p-2 rounded-circle hover-bg-primary cursor-pointer transition-all text-white"><FaHardHat size={20} /></div>
                <div className="bg-white bg-opacity-10 p-2 rounded-circle hover-bg-primary cursor-pointer transition-all text-white"><FaTools size={20} /></div>
              </div>
            </Col>
            <Col lg={2} md={3} xs={6}>
              <h6 className="text-uppercase fw-bold mb-4 text-white tracking-widest">Platform</h6>
              <ul className="list-unstyled d-flex flex-column gap-3">
                <li><a href="#" className="text-white-50 text-decoration-none hover-text-white transition-all">SiteOps</a></li>
                <li><a href="#" className="text-white-50 text-decoration-none hover-text-white transition-all">Finance</a></li>
                <li><a href="#" className="text-white-50 text-decoration-none hover-text-white transition-all">Safety</a></li>
                <li><a href="#" className="text-white-50 text-decoration-none hover-text-white transition-all">Integrations</a></li>
              </ul>
            </Col>
            <Col lg={2} md={3} xs={6}>
              <h6 className="text-uppercase fw-bold mb-4 text-white tracking-widest">Company</h6>
              <ul className="list-unstyled d-flex flex-column gap-3">
                <li><a href="#" className="text-white-50 text-decoration-none hover-text-white transition-all">About Us</a></li>
                <li><a href="#" className="text-white-50 text-decoration-none hover-text-white transition-all">Careers</a></li>
                <li><a href="#" className="text-white-50 text-decoration-none hover-text-white transition-all">Blog</a></li>
                <li><a href="#" className="text-white-50 text-decoration-none hover-text-white transition-all">Contact</a></li>
              </ul>
            </Col>
            <Col lg={4} md={12}>
               <h6 className="text-uppercase fw-bold mb-4 text-white tracking-widest">Subscribe to Newsletter</h6>
               <p className="text-white-50 mb-4">Get the latest construction tech news and platform updates delivered to your inbox.</p>
               <Form className="d-flex bg-white bg-opacity-10 rounded-pill p-1 border border-secondary">
                 <Form.Control type="email" placeholder="Enter your email address" className="bg-transparent border-0 text-white shadow-none px-3" />
                 <Button variant="primary" className="rounded-pill px-4 fw-bold shadow-sm">Subscribe</Button>
               </Form>
            </Col>
          </Row>
          <div className="border-top border-secondary pt-4 text-center text-md-start d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <p className="text-white-50 small mb-0">&copy; 2026 BuildSmart Technologies Inc. All rights reserved.</p>
            <div className="d-flex gap-4 small text-white-50">
              <a href="#" className="text-white-50 text-decoration-none hover-text-white">Privacy Policy</a>
              <a href="#" className="text-white-50 text-decoration-none hover-text-white">Terms of Service</a>
              <a href="#" className="text-white-50 text-decoration-none hover-text-white">Cookie Policy</a>
            </div>
          </div>
        </Container>
      </footer>
      
      {/* Global styles injected for specific hover effects not available in pure bootstrap utilities */}
      <style>{`
        .tracking-tight { letter-spacing: -0.05em; }
        .tracking-wider { letter-spacing: 0.05em; }
        .tracking-widest { letter-spacing: 0.1em; }
        .hover-primary:hover { color: #0d6efd !important; }
        .hover-bg-light:hover { background-color: #f8f9fa !important; }
        .hover-bg-opacity-20:hover { background-color: rgba(255,255,255,0.2) !important; }
        .hover-bg-primary:hover { background-color: #0d6efd !important; }
        .hover-text-primary:hover { color: #0d6efd !important; }
        .hover-text-white:hover { color: #fff !important; }
        .transition-all { transition: all 0.3s ease; }
        .cursor-pointer { cursor: pointer; }
        .blur-3xl { filter: blur(64px); }
        .group:hover .group-hover\\:gap-3 { gap: 1rem !important; }
        .grayscale { filter: grayscale(100%); transition: all 0.3s ease; }
        .grayscale:hover { filter: grayscale(0%); opacity: 1 !important; }
      `}</style>
    </div>
  );
};

export default LandingPage;
