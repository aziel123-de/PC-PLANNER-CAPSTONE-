function Headset(){
  return (
    <section className="wiki-section">
      <div className="card-content"> 
        <p className="card-title">Headset</p>
        <p className="Card-Desc">Audio output and input device for gaming and communication</p>
        
        <p className="card-text">
          Headsets provide audio output and microphone input for gaming, 
          communication, and multimedia. Choose between wired or wireless 
          options based on your setup and preferences.
        </p>

        <div className="specs-section">
          <p className="Key">Key Specifications:</p>
          <ul className="Specs"> 
            <li>Type: Over-ear, on-ear, or in-ear</li>
            <li>Connectivity: Wired (3.5mm, USB) or wireless (Bluetooth, USB receiver)</li>
            <li>Microphone: Built-in or detachable</li>
            <li>Frequency Response: 20Hz - 20kHz (typical)</li>
            <li>Features: Noise cancellation, surround sound, RGB lighting</li>
          </ul>
        </div>
        <button
  className="card-button" onClick=
  {() => window.open('https://www.computerhope.com/jargon/h/headset.htm', '_blank')}>
  Browse →
</button>
      </div>
    </section>
  );
}

export default Headset