import React from "react";
import { Container, Row, Col, Button, Card, Carousel } from "react-bootstrap";
import BeforeDroughtImage from "./assets/before drought.png"; // Import the before drought image
import AfterDroughtImage from "./assets/After drought.png"; // Import the after drought image

const Home = () => {
  const handleLoginRedirect = () => {
    // Redirect to the login page for 2FA
    window.location.href = 'http://localhost:5173'; 
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero bg-dark text-white text-center py-5">
        <Container>
          <h1 className="display-4">Welcome to EarthAnalytics</h1>
          <p className="lead">
            A Drought Prediction Software for the Natural Disaster Risk Management
          </p>
          <Button 
            onClick={handleLoginRedirect} // Trigger the manual redirect
            className="btn btn-primary btn-lg"
          >
            Login / Signup
          </Button>
        </Container>
      </section>

      {/* Information Section */}
      <section className="info-section py-5">
        <Container>
          <Row>
            <Col md={6}>
              <Card className="mb-4">
                <Card.Body>
                  <h4>About</h4>
                  <p>
                    This is a natural disaster app that assists to predict
                    drought. Drought can lead to widespread damage to assets and
                    the environment supporting human activities.
                  </p>
                  <Button variant="info" href="#flood-info">
                    Learn More
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="mb-4">
                <Card.Body>
                  <h4>Drought Risk</h4>
                  <p>
                    Droughts occur when there is a prolonged shortage of water.
                    This can affect agriculture, water supply, and ecosystems.
                    Drought analysis helps to predict drought risks based on
                    current weather patterns.
                  </p>
                  <Button variant="info" href="#drought-info">
                    See More
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Learning Resources */}
      <section id="flood-info" className="py-5 bg-light">
        <Container>
          <h2 className="text-center mb-4">Learning Resources</h2>
          <Row>
            <Col md={6}>
              <a href="https://tnfd.global/" target="_blank" rel="noopener noreferrer">
                <img
                  src="https://via.placeholder.com/600x100?text=TNFD"
                  alt="TNFD"
                  className="img-fluid"
                />
              </a>
            </Col>
            <Col md={6}>
              <a href="https://www.fsb-tcfd.org/" target="_blank" rel="noopener noreferrer">
                <img
                  src="https://via.placeholder.com/600x100?text=TCFD"
                  alt="TCFD"
                  className="img-fluid"
                />
              </a>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Before and After Drought Area Section with Carousel */}
      <section id="drought-info" className="py-5">
        <Container>
          <h2 className="text-center mb-4">Before and After Drought</h2>
          <Row>
            <Col md={12}>
              <Carousel>
                <Carousel.Item>
                  <img
                    src={BeforeDroughtImage} // Use the imported image
                    alt="Before Drought"
                    className="d-block w-100"
                  />
                  <Carousel.Caption>
                    <h3>Before Drought</h3>
                  </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item>
                  <img
                    src={AfterDroughtImage} // Use the imported image
                    alt="After Drought"
                    className="d-block w-100"
                  />
                  <Carousel.Caption>
                    <h3>After Drought</h3>
                  </Carousel.Caption>
                </Carousel.Item>
              </Carousel>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Call to Action */}
      <section className="cta-section bg-primary text-white text-center py-5">
        <Container>
          <h2>Drought Risk Management</h2>
          <p className="lead">
            Predict drought risks based on the tailored data.
          </p>
          {/* Updated button to pinpoint SGX Building */}
          <Button 
            href="https://www.google.com/maps?q=2+Shenton+Way,+Singapore+068804" 
            className="btn btn-light btn-lg"
            target="_blank" // Opens Google Maps in a new tab
          >
            View Our Address
          </Button>
        </Container>
      </section>

      {/* Footer */}
      <footer className="footer bg-dark text-white py-4 text-center">
        <p>&copy; 2024 Drought Prediction. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Home; 
