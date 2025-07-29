import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [message, setMessage] = useState('');
  const [newUser, setNewUser] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users');
      setUsers(res.data);
      if (res.data.length > 0) setSelectedUserId(res.data[0]._id);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const handleClaimPoints = async () => {
    try {
      const res = await axios.post(`http://localhost:5000/api/claim/${selectedUserId}`);
      const claimedUser = res.data.user;
      const gained = res.data.points;
      setMessage(`${claimedUser.name} gained ${gained} points!`);
      fetchUsers();
    } catch (err) {
      console.error("Claim failed", err);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.trim()) return;
    try {
      await axios.post('http://localhost:5000/api/users', { name: newUser });
      setNewUser('');
      fetchUsers();
    } catch (err) {
      console.error("Add user failed", err);
    }
  };

  return (
    <div className="container">
      <h1>🏆 Leaderboard</h1>
      <div className="controls">
        <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
          {users.map((u) => (
            <option key={u._id} value={u._id}>{u.name}</option>
          ))}
        </select>
        <button onClick={handleClaimPoints}>Claim Points</button>
        <input
          value={newUser}
          onChange={(e) => setNewUser(e.target.value)}
          placeholder="New user name"
        />
        <button onClick={handleAddUser}>Add User</button>
      </div>
      {message && <p className="message">{message}</p>}
      <ol className="leaderboard">
        {[...users].sort((a, b) => b.totalPoints - a.totalPoints).map((u, i) => (
          <li key={u._id}>
            <span>{i + 1}. {u.name}</span>
            <span className="score">{u.totalPoints} pts</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default App;
