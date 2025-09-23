function Case(){
  return (
    <section className="wiki-section">
      <div className="card-content">
        <p className="card-title">PC Case</p>
        <p className="Card-Desc">Protective housing for your computer components</p>
        
        <p className="card-text">
          A PC case houses and protects your computer's components. 
          It affects cooling, airflow, and upgrades. Choose one based on 
          size, airflow, and expansion needs.
        </p>

        <div className="specs-section">
          <p className="Key">Key Specifications:</p>
          <ul className="Specs">
            <li>Form Factor: Size compatibility (e.g., ATX, microATX, Mini-ITX)</li>
            <li>Cooling Support: Number of fans and radiator support for airflow</li>
            <li>Drive Bays: Slots for SSDs, HDDs, and optical drives (if needed)</li>
            <li>Front Panel Ports: USB 3.0, USB-C, audio jack, power/reset buttons</li>
            <li>Build Material: Steel, tempered glass, plastic (affects durability and aesthetics)</li>
            <li>Cable Management: Features for organizing and hiding cables</li>

          </ul>
        </div>
        <button
  className="card-button" onClick=
  {() => window.open('https://www.lifewire.com/what-is-a-computer-case-2618149', '_blank')}>
  Browse →
</button>
      </div>
    </section>
  );
}

export default Case