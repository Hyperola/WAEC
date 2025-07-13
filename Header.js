import React from 'react';

const Header = ({ user, testsCount }) => {
  return (
    <header style={{
      backgroundColor: '#4B7043',
      padding: '1.5rem 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h1 style={{
            color: 'white',
            fontSize: '1.8rem',
            fontWeight: '700',
            margin: 0,
          }}>
            Welcome back, {user.name}!
          </h1>
          <p style={{
            color: 'white',
            fontSize: '1rem',
            margin: '0.5rem 0 0 0',
          }}>
            Your WAEC prep journey continues at Sanniville Academy
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <div style={{
            backgroundColor: '#A8B5A2',
            color: '#333333',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: '600',
          }}>
            {testsCount} Tests Available
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '0.5rem 1rem',
            borderRadius: '25px',
            border: '1px solid #A8B5A2',
          }}>
            <span style={{
              color: '#333333',
              fontSize: '1rem',
              fontWeight: '500',
            }}>
              {user.name}
            </span>
            <img
              src={user.profileImage || '/images/default1.png'}
              alt="Profile"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '2px solid #4B7043',
                objectFit: 'cover',
              }}
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM0QjcwNDMiLz4KPHRleHQgeD0iMjAiIHk9IjI2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNiIgZm9udC1mYW1pbHk9IlBvcHBpbnMsIHNhbnMtc2VyaWYiPnt1c2VyLm5hbWVbMF19PC90ZXh0Pgo8L3N2Zz4=';
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;