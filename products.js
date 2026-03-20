/* ===== PRODUCTS SCRIPTS ===== */

(function(){
  const s = JSON.parse(localStorage.getItem('smart_retail_settings')||'{}');
  const theme  = s.theme  || 'dark';
  const accent = s.accent || '#3b82f6';
  if(theme==='light'){
    document.documentElement.style.setProperty('--bg','#f1f5f9');
    document.documentElement.style.setProperty('--text','#0f172a');
    document.documentElement.style.setProperty('--card','#ffffff');
    document.documentElement.style.setProperty('--border','#e2e8f0');
    document.documentElement.style.setProperty('--sidebar','rgba(241,245,249,0.98)');
  } else if(theme==='blue'){
    document.documentElement.style.setProperty('--bg','#0d1f3c');
    document.documentElement.style.setProperty('--text','#e5e7eb');
    document.documentElement.style.setProperty('--card','rgba(13,31,60,0.9)');
    document.documentElement.style.setProperty('--border','rgba(59,130,246,0.2)');
    document.documentElement.style.setProperty('--sidebar','rgba(10,20,50,0.98)');
  } else {
    document.documentElement.style.setProperty('--bg','#0a0e1a');
    document.documentElement.style.setProperty('--text','#e5e7eb');
    document.documentElement.style.setProperty('--card','rgba(15,23,42,0.8)');
    document.documentElement.style.setProperty('--border','rgba(148,163,184,0.2)');
    document.documentElement.style.setProperty('--sidebar','rgba(15,23,42,0.95)');
  }
  document.documentElement.style.setProperty('--accent', accent);
})();