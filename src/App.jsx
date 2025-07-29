
import { useEffect, useState } from 'react';
import './App.css';
import GoalForm from './GoalForm';
import DepositForm from './DepositForm';
import ProgressBar from './progressbar.jsx';

// API helpers
const BASE = 'http://localhost:3000/goals';
async function fetchGoals() {
  const res = await fetch(BASE);
  return res.json();
}
async function addGoal(goal) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(goal)
  });
  return res.json();
}
async function updateGoal(id, updates) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  return res.json();
}
async function deleteGoal(id) {
  await fetch(`${BASE}/${id}`, { method: 'DELETE' });
}
async function depositToGoal(id, amount) {
  const goal = await (await fetch(`${BASE}/${id}`)).json();
  return updateGoal(id, { savedAmount: Number(goal.savedAmount) + Number(amount) });
}

function Overview({ goals }) {
  const totalGoals = goals.length;
  const totalSaved = goals.reduce((sum, g) => sum + Number(g.savedAmount), 0);
  const completed = goals.filter(g => g.savedAmount >= g.targetAmount).length;
  function daysLeft(deadline) {
    const d = new Date(deadline);
    const now = new Date();
    return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
  }
  return (
    <div style={{marginBottom:24}}>
      <h2>Overview</h2>
      <div>Total Goals: {totalGoals}</div>
      <div>Total Saved: ${totalSaved}</div>
      <div>Goals Completed: {completed}</div>
      <ul>
        {goals.map(g => {
          const days = daysLeft(g.deadline);
          const complete = g.savedAmount >= g.targetAmount;
          const overdue = days < 0 && !complete;
          const warning = days <= 30 && days > 0 && !complete;
          return (
            <li key={g.id}>
              {g.name}: {complete ? 'Complete' : overdue ? 'Overdue' : `${days} days left`}
              {warning && <span style={{color:'orange'}}> (Deadline soon!)</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function GoalItem({ goal, onDelete, onEdit }) {
  const complete = goal.savedAmount >= goal.targetAmount;
  const left = goal.targetAmount - goal.savedAmount;
  const days = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
  const overdue = days < 0 && !complete;
  const warning = days <= 30 && days > 0 && !complete;
  return (
    <div className={`goal-card${overdue ? ' overdue' : warning ? ' warning' : ''}`}>
      <h3>{goal.name} {complete && <span style={{color:'green'}}>✔</span>} {overdue && <span style={{color:'red'}}>Overdue</span>}</h3>
      <div>Category: {goal.category}</div>
      <div>Target: ${goal.targetAmount}</div>
      <div>Saved: ${goal.savedAmount}</div>
      <div>Remaining: ${left > 0 ? left : 0}</div>
      <div>Deadline: {goal.deadline} ({days >= 0 ? `${days} days left` : `${-days} days overdue`})</div>
      <ProgressBar value={goal.savedAmount} max={goal.targetAmount} />
      <button onClick={() => onEdit(goal)}>Edit</button>
      <button onClick={() => onDelete(goal.id)} style={{marginLeft:8}}>Delete</button>
    </div>
  );
}

function GoalList({ goals, onDelete, onEdit }) {
  return (
    <div>
      {goals.map(goal =>
        <GoalItem key={goal.id} goal={goal} onDelete={onDelete} onEdit={onEdit} />
      )}
    </div>
  );
}

function EditGoalForm({ goal, onUpdate, onCancel }) {
  const [form, setForm] = useState({
    name: goal.name,
    targetAmount: goal.targetAmount,
    category: goal.category,
    deadline: goal.deadline,
  });
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  function handleSubmit(e) {
    e.preventDefault();
    onUpdate({
      ...form,
      targetAmount: Number(form.targetAmount),
    });
  }
  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24, background: '#f0f0f0', padding: 12, borderRadius: 8 }}>
      <h3>Edit Goal</h3>
      <input name="name" value={form.name} onChange={handleChange} />
      <input name="targetAmount" type="number" value={form.targetAmount} onChange={handleChange} />
      <input name="category" value={form.category} onChange={handleChange} />
      <input name="deadline" type="date" value={form.deadline} onChange={handleChange} />
      <button type="submit">Save</button>
      <button type="button" onClick={onCancel} style={{marginLeft:8}}>Cancel</button>
    </form>
  );
}

function App() {
  const [goals, setGoals] = useState([]);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchGoals().then(setGoals);
  }, []);

  function handleAdd(goal) {
    addGoal(goal).then(newGoal => setGoals(g => [...g, newGoal]));
  }

  function handleDelete(id) {
    deleteGoal(id).then(() => setGoals(g => g.filter(goal => goal.id !== id)));
  }

  function handleDeposit(id, amount) {
    depositToGoal(id, amount).then(updated => setGoals(g => g.map(goal => goal.id === id ? updated : goal)));
  }

  function handleEdit(goal) {
    setEditing(goal);
  }

  function handleUpdate(updates) {
    updateGoal(editing.id, updates).then(updated => {
      setGoals(g => g.map(goal => goal.id === editing.id ? updated : goal));
      setEditing(null);
    });
  }

  return (
    <div>
      <h1>Smart Goal Planner</h1>
      <Overview goals={goals} />
      <GoalForm onAdd={handleAdd} />
      <DepositForm goals={goals} onDeposit={handleDeposit} />
      {editing && (
        <EditGoalForm goal={editing} onUpdate={handleUpdate} onCancel={() => setEditing(null)} />
      )}
      <GoalList goals={goals} onDelete={handleDelete} onEdit={handleEdit} />
    </div>
  );
}

export default App;
