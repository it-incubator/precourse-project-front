import React from "react";
import { useBaseUrl } from "../store/useBaseUrl";
import { Link, NavLink } from "react-router-dom";

export default function Header() {
  const { baseUrl, setBaseUrl } = useBaseUrl();
  return (
    <div className="header">
      <div className="header-inner">
        <Link to="/" style={{fontWeight:700, color:"white"}}>Projects UI</Link>
        <nav className="row" style={{gap:16}}>
          <NavLink to="/" style={({isActive})=>({color:isActive?"#fff":"#9fb0d3"})}>Projects</NavLink>
        </nav>
        <div style={{flex:1}} />
        <label className="row" style={{gap:8, alignItems:"center"}}>
          <span className="badge">Base URL</span>
          <input
            className="input"
            style={{width: 320}}
            placeholder="http://localhost:3000"
            value={baseUrl}
            onChange={e=>setBaseUrl(e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}
