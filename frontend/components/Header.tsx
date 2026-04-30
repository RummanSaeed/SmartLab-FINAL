import React from 'react';
import Link from "next/link";

const Header: React.FC = () => {
  return (
    <header className="sl-header">
      <div className="container" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div className="brand" style={{display:'flex',alignItems:'center',gap:12}}>
          <div className="sl-brand-mark" />
          <div style={{fontWeight:800,fontSize:18,color:'#e6eef8'}}>SmartLab</div>
        </div>

        <div style={{display:'flex',alignItems:'center',gap:24}}>
          <nav className="nav-links" style={{marginRight:18}}>
            <Link href="/">Home</Link>
            <Link href="/experiments">Experiments</Link>
            <Link href="/docs">Docs</Link>
          </nav>

          <div style={{display:'flex',gap:12,alignItems:'center'}}>
            <Link href="/login/student" style={{color:'var(--muted)',textDecoration:'none',fontWeight:700}}>Sign in</Link>
            <Link href="/signup" className="nav-cta" style={{background:'linear-gradient(90deg,#8b5cf6,#ec4899)'}}>Start for free</Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
