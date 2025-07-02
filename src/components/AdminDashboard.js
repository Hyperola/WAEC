import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="container mt-4">
      <h2>Admin Dashboard</h2>
      <p>Welcome, {user.name}!</p>
      <div className="row">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Manage Users</h5>
              <p className="card-text">Add or edit teachers and students.</p>
              <a href="/users" className="btn btn-primary">Go to Users</a>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">View Results</h5>
              <p className="card-text">Check test results and edit if needed.</p>
              <a href="/results" className="btn btn-primary">View Results</a>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Analytics</h5>
              <p className="card-text">View school-wide performance.</p>
              <a href="/analytics" className="btn btn-primary">View Analytics</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;