function PSU(){
  return (
    <section className="wiki-section">
      <div className="card-content"> 
        <p className="card-title">Power Supply (PSU)</p>
        <p className="Card-Desc">Provide power to all components</p>
        
        <p className="card-text">
          Storage devices hold your operating system, programs, 
          and files. Faster storage means quicker boot times and program 
          loading.
        </p>

        <div className="specs-section">
          <p className="Key">Key Specifications:</p>
          <ul className="Specs">
            <li>Wattage: Total power output (e.g., 650W, 750W)</li>
            <li>Efficiency Rating: 80+ Bronze, Gold, Platinum (higher is better)</li>
            <li>Modularity: Fully, semi, or non-modular cable management</li>
            <li>Protection Features: OVP, UVP, OCP, OPP, SCP</li>
          </ul>
        </div>
        <button
  className="card-button" onClick=
  {() => window.open('https://www.actpower.com/blog/what-is-a-power-supply-and-how-does-it-work/', '_blank')}>
  Browse →
</button>
      </div>
    </section>
  );
}

export default PSU