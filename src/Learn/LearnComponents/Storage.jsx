function Storage() {
  return (
    <section className="wiki-section">
      <div className="card-content"> 
        <p className="card-title">Storage</p>
        <p className="Card-Desc">Permanent data storage for your files</p>
        
        <p className="card-text">
          The Graphics Processing Unit (GPU) renders images, videos, 
          and animations. It's crucial for gaming, video editing, and 
          other visual tasks.
        </p>

        <div className="specs-section"> 
          <p className="Key">Key Specifications:</p>
          <ul className="Specs">
            <li>Type: SSD (faster) or HDD (more affordable per TB)</li>
            <li>Interface: NVMe (fastest), SATA, or M.2</li>
            <li>Capacity: Total storage space (e.g., 1TB, 2TB)</li>
            <li>Read/Write Speeds: Higher is better for performance</li>
          </ul>
        </div>
        <button
  className="card-button" onClick=
  {() => window.open('https://www.techtarget.com/searchstorage/definition/storage', '_blank')}>
  Browse →
</button>
      </div>
    </section>
  );
}

export default Storage