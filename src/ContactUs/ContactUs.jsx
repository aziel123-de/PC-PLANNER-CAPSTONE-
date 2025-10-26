import './ContactUs.css';

function ContactUs() {
  return (
    <div className="contact-container">
      <div className="contact-header">
        <div className="badge">Built with Passion</div>
        <h1 className='Footer-title'>PC Planner</h1>
        <p className='footer-text'>Crafted by a dedicated team of developers and designers passionate about helping you build the perfect PC setup. We're committed to innovation and excellence.</p>
      </div>

      <div className="team-section">
        <h2 className='team-text'>Meet the Team</h2>
        <div className="team-grid">
          <div className="team-card">
            <div className="avatar"></div>
            <h3 className='name-dev'>Sebastian Maligaya</h3>
            <p className="role">Lead Developer</p>
            <div className="social-icons">
              <span>🔗</span>
            
            </div>
            <p className="email">✉ email here</p>
          </div>

          <div className="team-card">
            <div className="avatar"></div>
            <h3 className='name-dev'>Rolando Manuel Jr.</h3>
            <p className="role">Full Stack Developer</p>
            <div className="social-icons">
              <span>🔗</span>
           
            </div>
            <p className="email">✉ email here</p>
          </div>

     

          <div className="team-card">
            <div className="avatar"></div>
            <h3 className='name-dev'>Hazel Ann Sadangsal</h3>
            <p className="role">UI/UX Designer | Front-end Developer</p>
            <div className="social-icons">
              <span>🔗</span>
            
            </div>
            <p className="email">✉ email here</p>
          </div>

          <div className="team-card">
            <div className="avatar"></div>
            <h3 className='name-dev'>Julian August Verecio</h3>
            <p className="role">UI/UX Designer</p>
            <div className="social-icons">
              <span>🔗</span>
              
            </div>
            <p className="email">✉ email here</p>
          </div>
        </div>
      </div>

      <div className="contact-section">
        <h2>Get in Touch</h2>
        <div className="contact-info">
          <div className="contact-item">
            <div className="icon-wrapper email-icon">✉</div>
            <h3>Email</h3>
            <p className='email-pcplanner'>pcplanner@gmail.com</p>
          </div>
          <div className="contact-item">
            <div className="icon-wrapper location-icon">📍</div>
            <h3 className='loc'>Location</h3>
            <p className='locpcplanner'>Taguig City</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;
