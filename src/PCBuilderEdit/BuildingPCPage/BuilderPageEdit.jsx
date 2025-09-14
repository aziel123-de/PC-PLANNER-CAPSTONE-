import React from 'react';
import BuilderPage from '../../PCBuilder/BuildingPCPage/BuilderPage';
import '../BuildingPCPage/BuilderPage.css';

// Wrapper that can later diverge for edit-specific behaviors
export default function BuilderPageEdit(){
  return (
    <>
      <div className="EditModeBanner">Editing Saved Build (changes can be re-saved under a new name)</div>
      <BuilderPage />
    </>
  );
}
