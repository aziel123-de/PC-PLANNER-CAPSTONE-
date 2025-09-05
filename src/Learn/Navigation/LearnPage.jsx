import React from 'react';
import { Navigate } from 'react-router-dom';

// Lightweight landing page that redirects to the first Learn section
export default function LearnPage() {
  return <Navigate to="/learn/components" replace />;
}
