import React from 'react';

const CTAButtons: React.FC = () => {
  return (
    <div style={{display:'flex',flexWrap:'wrap',gap:12}}>
      <a href="/login/student" style={{textDecoration:'none'}}>
        <button className="btn-primary">Login / Signup</button>
      </a>
      <a href="/experiments" style={{textDecoration:'none'}}>
        <button className="btn-ghost">View Experiments</button>
      </a>
    </div>
  );
}

export default CTAButtons;
