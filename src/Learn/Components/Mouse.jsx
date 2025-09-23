function Mouse() {
  return (
    <section className="wiki-section">
      <div className="card-content">
        <p className="card-title">Mouse</p>
        <p className="Card-Desc">Pointing device for navigation and control</p>
        
        <p className="card-text">
          The mouse helps you interact with your system through 
          precise cursor movement. Ergonomics, sensitivity, and button 
          configuration are key for comfort and performance.

        </p>

        <div className="specs-section">
          <p className="Key">Key Specifications:</p>
          <ul className="Specs">
            <li>Sensor: Optical or laser</li>
            <li>DPI: Sensitivity rating (e.g., 800–16000 DPI)</li>
            <li>Buttons: Standard (2–3) or customizable (5+ for gaming/work)</li>
            <li>Connectivity: Wired or wireless</li>
            <li>Ergonomics: Ambidextrous or hand-specific shape</li>
          </ul>
        </div>
        <button
  className="card-button" onClick=
  {() => window.open('https://www.techtarget.com/whatis/definition/mouse', '_blank')}>
  Browse →
</button>
      </div>
    </section>
  );
}

export default Mouse