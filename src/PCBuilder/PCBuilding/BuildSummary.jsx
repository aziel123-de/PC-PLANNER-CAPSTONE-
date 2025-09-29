import './BuildSummary.css';
import ComponentSpecs from './ComponentSpecs';
import React from 'react';
import analyzeBuild from './analyzeBuild';
import { FiLock } from 'react-icons/fi';

function BuildSummary({ selectedParts, onSaveBuild, onClearBuild, isLoggedIn, dataLookup }) {
  // Convert selectedParts object to a flat array of all selected parts (filter out null/undefined)
  const allParts = Object.values(selectedParts).flat().filter(Boolean).map(p => p._raw ? p : p);
  const TOTAL_PART_COUNT = 14; // configurable expected parts count (includes 4 peripherals)
  const selectedCount = allParts.length;
  const progress = Math.min(Math.round((selectedCount / TOTAL_PART_COUNT) * 100), 100);
  const basePrice = allParts.reduce((total, part) => part?.price ? total + part.price : total, 0);
  const upperPrice = Math.round(basePrice * 1.2); // 20% increase for price variation

  // Centralized analysis
  const analysis = analyzeBuild(selectedParts);
  const { compatSeverity, bottleneckNote, upgradeRecommendation, ram, power } = analysis;
  const { ramBottleneck, ramBottleneckNote } = ram;
  const { showPowerWarning, powerWarningText, psuWatt, requiredWithHeadroom, cpuTDP, gpuPowerTotal, totalRequiredPower, powerCause } = {
    showPowerWarning: power.showPowerWarning,
    powerWarningText: power.powerWarningText,
    psuWatt: power.psuWatt,
    requiredWithHeadroom: power.requiredWithHeadroom,
    cpuTDP: power.cpuTDP,
    gpuPowerTotal: power.gpuPowerTotal,
    totalRequiredPower: power.totalRequiredPower,
    powerCause: power.powerCause
  };
  const psuSelected = psuWatt > 0;
  const hasCpuGpu = analysis.cpuIndex > 0 && analysis.combinedGpuIndex > 0;

  return (
    <div className='BuildSummary'>
      <h1>Build Summary</h1>

      <p>Build Completion: {progress}%</p>
      <div className="ProgressBar">
        <div className="ProgressFill" style={{ width: `${progress}%` }}></div>
      </div>

      <div className='SelectedComponentsBox'>
        {allParts.map((part, index) =>
          part ? (
            <div className="ComponentCard" key={index}>
              <ComponentSpecs
                part={part}
                type={part.type || part.componentType || "Component"}
              />
            </div>
          ) : null
        )}
      </div>

      <h1 className='Price'>Estimated Price: ₱{basePrice.toLocaleString()} - ₱{upperPrice.toLocaleString()}</h1>
      
      {/* Enhanced Compatibility Section */}
      <div className="compatibility-section">
        <div className="compatibility-header">
          <h2 className="compatibility-title">System Compatibility</h2>
        </div>
        
        {/* Performance Balance Check */}
        <div className="compat-card">
          <div className="compat-card-header">
            <div className="compat-card-title">
              <span>Performance Balance</span>
            </div>
            <div
              className={`compat-badge ${!hasCpuGpu ? 'compat-unknown' : (compatSeverity === 'good' ? 'compat-good' : compatSeverity === 'warn' ? 'compat-warn' : 'compat-bad')}`}
            >
              {!hasCpuGpu ? 'NO DATA' : (compatSeverity === 'good' ? 'BALANCED' : compatSeverity === 'warn' ? 'WARNING' : 'BOTTLENECK')}
            </div>
          </div>
          <div className="compat-card-content">
            <p className="compat-description">{!hasCpuGpu ? 'NO DATA' : bottleneckNote}</p>
            {ramBottleneck && (
              <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                <div className="compat-badge compat-warn compat-secondary">RAM BOTTLENECK</div>
                <div style={{ color: '#7f1d1d', fontWeight: 600 }}>{ramBottleneckNote}</div>
              </div>
            )}
            {upgradeRecommendation && (
              <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
                <div className="compat-badge compat-warn compat-secondary">RECOMMENDATION</div>
                <div style={{ color: '#334155', fontWeight: 600 }}>{upgradeRecommendation}</div>
              </div>
            )}
            
          </div>
        </div>

        {/* Power Supply Check */}
        {(showPowerWarning || (process.env.NODE_ENV !== 'production')) && (
          <div className="compat-card">
            <div className="compat-card-header">
              <div className="compat-card-title">
                <span>Power Supply</span>
              </div>
              <div className="compat-badges">
                <div
                  className={`compat-badge ${!psuSelected ? 'compat-unknown' : (showPowerWarning ? 'compat-bad' : 'compat-good')}`}
                >
                    {!psuSelected ? 'NO DATA' : (showPowerWarning ? 'INSUFFICIENT' : 'SUFFICIENT')}
                  </div>
                {showPowerWarning && (
                  <div className={`compat-badge compat-warn compat-secondary`}>
                    {powerCause === 'cpu' ? 'CPU' : powerCause === 'gpu' ? 'GPU' : powerCause === 'both' ? 'CPU+GPU' : 'N/A'}
                  </div>
                )}
                {process.env.NODE_ENV !== 'production' && psuSelected && !showPowerWarning && (
                  <div className={`compat-badge compat-info compat-secondary`}>
                    INFO
                  </div>
                )}
              </div>
            </div>
            <div className="compat-card-content">
              <p className="compat-description">
                {!psuSelected
                  ? 'PSU not selected.'
                  : showPowerWarning
                    ? powerWarningText
                    : process.env.NODE_ENV !== 'production'
                      ? `Power Check: PSU ${psuWatt || 'N/A'}W vs required ${requiredWithHeadroom}W (CPU ${cpuTDP || 0}W + GPUs ${gpuPowerTotal || 0}W = ${totalRequiredPower}W). ${psuWatt ? (requiredWithHeadroom > psuWatt ? 'Not enough.' : 'Sufficient.') : 'PSU not selected.'}`
                      : ''
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Save Build and Clear Buttons */}
      <div style={{ marginTop: 20, display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {isLoggedIn ? (
          <>
            <button 
              id="save-build-btn-builderpage"
              onClick={onSaveBuild} 
              disabled={!dataLookup} 
              className="save-build-btn-builderpage"
            >
              Save Build
            </button>
            <button 
              onClick={onClearBuild}
              style={{
                background: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#b91c1c'}
              onMouseOut={(e) => e.target.style.background = '#dc2626'}
            >
              Clear All
            </button>
          </>
        ) : (
          <div>
            <p className='pcBuilderNotetoSign'>
              <FiLock size={18} />
              Log in to save your build.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BuildSummary;
