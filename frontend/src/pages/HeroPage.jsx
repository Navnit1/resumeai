import { Link } from "react-router-dom";
import "../styles/HeroPage.css";

function HeroPage() {
  return (
    <div className="hero-page">
      <nav className="hero-navbar">
        <Link to="/" className="hero-brand">
          <span className="brand-icon">⚡</span>
          <span className="brand-name">
            NextRole <span>AI</span>
          </span>
        </Link>

        <div className="hero-nav-links">
          <Link to="/login" className="nav-login">
            Login
          </Link>
          <Link to="/register" className="nav-signup">
            Sign Up Free
          </Link>
        </div>
      </nav>

      <main className="hero-content">
        <div className="hero-badge">
          AI-Powered Career Platform
        </div>

        <h1>
          Build Your Resume.
          <br />
          <span>Build Your Future.</span>
        </h1>

        <p className="hero-description">
          Create professional resumes, optimize them for ATS,
          and take the next step toward your dream career
          with NextRole AI.
        </p>

        <div className="hero-actions">
          <Link to="/register" className="hero-primary-btn">
            Get Started Free <span>→</span>
          </Link>

          <Link to="/login" className="hero-secondary-btn">
            Sign In
          </Link>
        </div>

        <div className="hero-features">
          <div className="feature-card">
            <span className="feature-icon">✦</span>
            <h3>AI Resume Builder</h3>
            <p>Create a polished, professional resume in less time.</p>
          </div>

          <div className="feature-card">
            <span className="feature-icon">✓</span>
            <h3>ATS Optimization</h3>
            <p>Improve your resume for applicant tracking systems.</p>
          </div>

          <div className="feature-card">
            <span className="feature-icon">↗</span>
            <h3>Career Growth</h3>
            <p>Prepare for new opportunities with more confidence.</p>
          </div>
        </div>

        <p className="hero-footer">
          Your next opportunity starts here.
        </p>
      </main>
    </div>
  );
}

export default HeroPage;