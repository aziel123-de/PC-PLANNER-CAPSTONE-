function Mobo() {
  return (
    <section className="wiki-section">
      <div className="card-content"> 
        <p className="card-title">Motherboard</p>
        <p className="Card-Desc">The foundation that connects everything</p>
        
        <p className="card-text">
          The motherboard connects all your components together. 
          It contains slots and connectors for your CPU, RAM, storage, 
          and expansion cards
        </p>

        <div className="specs-section"> 
          <p className="Key">Key Specifications:</p>
          <ul className="Specs"> 
            <li>Socket Type: Must match your CPU (e.g., AM4, LGA1700)</li>
            <li>Chipset: Determines features and compatibility (e.g., B550, Z690)</li>
            <li>Form Factor: Size of the board (ATX, Micro-ATX, Mini-ITX)</li>
            <li>Expansion Slots: PCIe slots for graphics cards and other add-on</li>
          </ul>
        </div>
        <button
  className="card-button" onClick=
  {() => window.open('https://www.spiceworks.com/tech/hardware/articles/what-is-motherboard/', '_blank')}>
  Browse →
</button>
      </div>
    </section>
  );
}

export default Mobo