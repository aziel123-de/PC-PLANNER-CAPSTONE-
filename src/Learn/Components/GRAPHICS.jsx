function GRAPHICS() {
  return (
    <section className="wiki-section">
      <div className="card-content">
        <p className="card-title">Graphics Card (GPU)</p>
        <p className="Card-Desc">Handles visual processing and display</p>
        
        <p className="card-text">
          The Graphics Processing Unit (GPU) renders images, videos, 
          and animations. It's crucial for gaming, video editing, and 
          other visual tasks.
        </p>

        <div className="specs-section"> 
          <p className="Key">Key Specifications:</p>
          <ul className="Specs">
            <li>VRAM: Video memory for textures and graphics data (e.g., 8GB)</li>
            <li>Core Clock: Base speed of the GPU (e.g., 1500MHz)</li>
            <li>CUDA/Stream Processors: More means better parallel processing</li>
            <li>TDP: Power consumption, affects PSU requirements</li>
          </ul>
        </div>
        <button
  className="card-button" onClick=
  {() => window.open('https://support.microsoft.com/en-us/windows/all-about-graphics-processing-units-gpus-e159bedb-80b7-4738-a0c1-76d2a05beab4', '_blank')}>
  Browse →
</button>
      </div>
    </section>
  );
}

export default GRAPHICS