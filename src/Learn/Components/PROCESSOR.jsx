function PROCESSOR() {
  return (
    <section className="wiki-section">
      <div className="card-content"> 
        <p className="card-title">Processor (CPU)</p>
        <p className="Card-Desc">The brain of your computer</p>
        
        <p className="card-text">
          The Central Processing Unit (CPU) handles most calculations and instructions 
          that make your computer work. It's crucial for overall performance.
        </p>

        <div className="specs-section">
          <p className="Key">Key Specifications:</p>
          <ul className="Specs"> 
            <li>Cores & Threads: More cores enable better multitasking</li>
            <li>Clock Speed: Higher GHz means faster processing (e.g., 3.6GHz)</li>
            <li>Socket Type: Must match your motherboard (e.g., AM4, LGA1700)</li>
            <li>Cache: Temporary storage for frequently accessed data</li>
          </ul>
        </div>
        <button
  className="card-button" onClick=
  {() => window.open('https://www.arm.com/glossary/cpu', '_blank')}>
  Browse Processors
</button>

      </div>
    </section>
  );
}

export default PROCESSOR;