import { useState, useEffect } from "react";
import { useNavigate, Link } from 'react-router-dom';
import './Section.css';
import { FaArrowRight, FaBookOpen, FaCheckCircle, FaGlobe } from 'react-icons/fa';
import { PiSignInBold } from "react-icons/pi";
import { FaUserPlus } from "react-icons/fa";
import PC1 from '../assets/PC1.jpg';
import PC2 from '../assets/PC2.webp';
import PC3 from '../assets/PC3.jpg';


function Section() {
  const images = [
    { src: PC1, alt: 'Gaming PC Setup 1' },
    { src: PC2, alt: 'Gaming PC Setup 2' },
    { src: PC3, alt: 'Gaming PC Setup 3' }
  ];
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  const navigate = useNavigate();
  // read token and normalize common falsey string values
  const rawToken = (localStorage.getItem('token') || '').trim();
  const isLoggedIn = !!rawToken && rawToken !== 'null' && rawToken !== 'undefined';

  return (
    <div className="main-content" style={{ paddingTop: 100 }}>
      <main className="three-sections">

        {/* Hero Section */}
        <section 
          className="hero"
          style={{
            backgroundImage: `url(${images[currentImage].src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="hero-overlay"></div>
          <div className="hero-text">
            <h2 className="hero-title">Build Your Perfect PC</h2>
            <p className="hero-description">
              Smart component compatibility, build optimization, and performance insights for your custom PC build.
            </p>

            <div className="hero-buttons">
              <button className="start-building" onClick={() => navigate('/builder')}>
                Start Building
                <FaArrowRight style={{ marginLeft: 5, verticalAlign: 'middle', display: 'inline-block' }} />
              </button>
              <button className="view-pcs" onClick={() => navigate('/prebuilt')}>View Pre-built PCs</button>
            </div>

            <div className="feature-badges">
              <div className="badge">
                <div className="badge-icon">
                  <FaGlobe />
                </div>
                <div className="badge-content">
                  <h4 className="badge-title">Local Market</h4>
                  <p className="badge-subtitle">Philippines</p>
                </div>
              </div>
              <div className="badge">
                <div className="badge-icon">
                  <FaCheckCircle />
                </div>
                <div className="badge-content">
                  <h4 className="badge-title">Available Parts</h4>
                  <p className="badge-subtitle">Locally Sourced</p>
                </div>
              </div>
              <div className="badge">
                <div className="badge-icon">
                  <FaBookOpen />
                </div>
                <div className="badge-content">
                  <h4 className="badge-title">User Friendly</h4>
                  <p className="badge-subtitle">Beginner Guide</p>
                </div>
              </div>
            </div>
          </div>

          {/* Image Carousel Indicators */}
          <div className="carousel-indicators">
            {images.map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${index === currentImage ? 'active' : ''}`}
                onClick={() => setCurrentImage(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </section>

        {/* Key Features Section */}
        <section className="key-features-section">
          <div className="key-features-container">
            <div className="key-features-header">
              <h2 className="key-features-title">Key Features</h2>
              <p className="key-features-subtitle">Everything you need to build the perfect PC for your needs</p>
            </div>

            <div className="cards-grid">
              <div
                className="card green"
                style={{ position: 'relative', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.12)' }}
              >
                <div className="card-header">
                  <div className="icon green">✓</div>
                  <h2 className="card-title">Smart Compatibility</h2>
                </div>
                <p className="card-description">
                  Automatically check if your selected components work together seamlessly.
                </p>
                <p className="card-details">
                  Our system verifies socket types, chipset compatibility, power requirements, and more to ensure a hassle-free build.
                </p>
              </div>

              <div
                className="card orange"
                style={{ position: 'relative', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.12)' }}
              >
                <div className="card-header">
                  <div className="icon orange">⚡</div>
                  <h2 className="card-title">Performance Insights</h2>
                </div>
                <p className="card-description">
                  Get detailed analysis on how your components will perform together.
                </p>
                <p className="card-details">
                  Identify potential bottlenecks, power consumption, cooling requirements, and get recommendations for better alternatives.
                </p>
              </div>

              <div
                className="card purple"
                style={{ position: 'relative', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.12)' }}
              >
                <div className="card-header">
                  <div className="icon purple">🔧</div>
                  <h2 className="card-title">Build Optimization</h2>
                </div>
                <p className="card-description">
                  Optimize your build for your specific needs and budget.
                </p>
                <p className="card-details">
                  Whether you're building for gaming, productivity, or general use, get recommendations tailored to your requirements.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="containerr">
            <div className="features-grid">
              <div className="feature-card">
                <h2 className="feature-title">For Beginners & Experts</h2>
                <p className="feature-description">
                  Whether you're building your first PC or your fiftieth, PC Planner has features designed for you.
                </p>
                <ul className="feature-list">
                  <li>Beginner-friendly explanations</li>
                  <li>Budget recommendations</li>
                  <li>Local pricing availability</li>
                </ul>
              </div>

              <div className="feature-card">
                <h2 className="feature-title">Local Market Focus</h2>
                <p className="feature-description">
                  PC Planner is specifically designed for the Philippine market.
                </p>
                <ul className="feature-list">
                  <li>Components available in the Philippine market</li>
                  <li>Budget recommendations in Philippine Peso (₱)</li>
                  <li>Local pricing and availability information</li>
                </ul>
                <p className="note">
                  Note:PC Planner focuses on currently available components in the Philippine market.
                  Some older or specific Chinese-brand components may not be included due to local availability issues.
                  
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="cta-section">
          <div className="container-homepage">
            <div className="cta-content">
              <h1 className="cta-title">Ready to build your PC?</h1>
              <p className="cta-subtitle">
                Start your journey to a perfectly balanced PC build today.
              </p>
              <div className="cta-buttons">
                <button type="button" className="btn btn-primary" onClick={() => navigate('/builder')}>
                  Start Building <FaArrowRight style={{ marginLeft: 2, verticalAlign: 'middle', display: 'inline-block' }} />
                </button>
                {!isLoggedIn && (
                  <Link to="/signup" className="btn btn-secondary" role="button">
                    Create an Account <FaUserPlus style={{ marginLeft: 2, verticalAlign: 'middle', display: 'inline-block' }} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

export default Section;
