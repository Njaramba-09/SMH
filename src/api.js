// Handles all API requests to json-server

const BASE = 'http://localhost:3000/goals'

export async function fetchGoals() {
  const res = await fetch(BASE)
  return res.json()
}

export async function addGoal(goal) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(goal)
  })
  return res.json()
}

export async function updateGoal(id, updates) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  })
  return res.json()
}

export async function deleteGoal(id) {
  await fetch(`${BASE}/${id}`, { method: 'DELETE' })
}

export async function depositToGoal(id, amount) {
  // Fetch current goal
  const goal = await (await fetch(`${BASE}/${id}`)).json()
  // Update savedAmount
  return updateGoal(id, { savedAmount: Number(goal.savedAmount) + Number(amount) })
}
