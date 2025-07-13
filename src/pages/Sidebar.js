import React from 'react';
import { FiLogOut } from 'react-icons/fi';

const Sidebar = ({ navItems, location, onNavigate }) => {
  return (
    <nav style={{
      width: '250px',
      backgroundColor: '#FFFFFF',
      padding: '20px 0',
      boxShadow: '2px 0 4px rgba(0,0,0,0.1)',
      borderRight: '1px solid #E0E0E0',
      position: 'fixed',
      top: '60px',
      bottom: 0,
      overflowY: 'auto',
      fontFamily: 'sans-serif'
    }}>
      <ul style={{
        listStyle: 'none',
        padding: 0,
        margin: 0
      }}>
        {navItems.map(item => (
          <li key={item.path} style={{
            marginBottom: '5px'
          }}>
            <button
              onClick={() => onNavigate(item.path)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '12px 20px',
                border: 'none',
                borderRadius: '0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s',
                fontSize: '16px',
                backgroundColor: location.pathname === `/student/${item.path}` ? '#D4A017' : 'transparent',
                color: location.pathname === `/student/${item.path}` ? '#000000' : '#4B5320',
                fontWeight: location.pathname === `/student/${item.path}` ? 'bold' : 'normal',
                borderLeft: location.pathname === `/student/${item.path}` ? '4px solid #4B5320' : '4px solid transparent'
              }}
              onMouseOver={e => {
                if (location.pathname !== `/student/${item.path}`) {
                  e.currentTarget.style.backgroundColor = '#F5F5F5';
                }
              }}
              onMouseOut={e => {
                if (location.pathname !== `/student/${item.path}`) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{
                fontSize: '18px'
              }}>{item.icon}</span>
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;