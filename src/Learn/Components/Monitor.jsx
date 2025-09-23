function Monitor(){
  return (
    <section className="wiki-section">
      <div className="card-content"> 
        <p className="card-title">Monitor</p>
        <p className="Card-Desc">Visual display for your computer</p>
        
        <p className="card-text">
          Monitors display the graphical output from your computer. 
          A good monitor enhances your experience whether you're working, 
          gaming, or watching media. Consider size, resolution, and refresh 
          rate for your needs.

        </p>

        <div className="specs-section">
          <p className="Key">Key Specifications:</p>
          <ul className="Specs">
            <li>Size: Screen diagonal in inches (e.g., 24", 27")</li>
            <li>Resolution: Image clarity (e.g., 1080p, 1440p, 4K)</li>
            <li>Refresh Rate: Measured in Hz (e.g., 60Hz, 144Hz, 240Hz)</li>
            <li>Panel Type: IPS, VA, or TN (affects color and viewing angles)</li>
            <li>Ports: HDMI, DisplayPort, USB-C (check compatibility)</li>
          </ul>
        </div>
        <button
  className="card-button" onClick=
  {() => window.open('https://www.itamg.com/it-asset/hardware/monitor/', '_blank')}>
  Browse →
</button>
      </div>
    </section>
  );

}
export default Monitor