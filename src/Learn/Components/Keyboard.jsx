function Keyboard(){
  return (
    <section className="wiki-section">
      <div className="card-content"> 
        <p className="card-title">Keyboard</p>
        <p className="Card-Desc">Input device for typing and commands</p>
        
        <p className="card-text">
          Keyboards allow you to input text, commands, and shortcuts. 
          Mechanical or membrane, wired or wireless—choose one that suits 
          your typing style and usage.
        </p>

        <div className="specs-section">
          <p className="Key">Key Specifications:</p>
          <ul className="Specs"> 
            <li>Type: Mechanical or membrane</li>
            <li>Layout: Full-size, TKL (Tenkeyless), or 60%</li>
            <li>Connectivity: Wired or wireless (Bluetooth/USB receiver)</li>
            <li>Backlighting: RGB or single-color (optional)</li>
            <li>Switch Type: Tactile, linear, or clicky (for mechanical)</li>
          </ul>
        </div>
        <button
  className="card-button" onClick=
  {() => window.open('https://www.computerhope.com/jargon/k/keyboard.htm', '_blank')}>
  Browse Processors
</button>
      </div>
    </section>
  );
}

export default Keyboard