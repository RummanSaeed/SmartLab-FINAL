import React from 'react';

const LabShapes: React.FC = () => (
  <svg width="320" height="150" viewBox="0 0 320 150" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'block',margin:'0 auto 3em auto'}}>
    <ellipse cx="56" cy="60" rx="40" ry="18" fill="#0ea5e9" opacity="0.38"/>
    <rect x="140" y="50" width="58" height="38" rx="14" fill="#7dd3fc" stroke="#0ea5e9" strokeWidth="3"/>
    <circle cx="240" cy="50" r="24" fill="#38bdf8" stroke="#0ea5e9" strokeWidth="3"/>
    <polygon points="270,110 295,140 245,140" fill="#2563eb" opacity=".37"/>
    <ellipse cx="80" cy="120" rx="24" ry="12" fill="#1e293b" opacity="0.42"/>
  </svg>
);

export default LabShapes;
