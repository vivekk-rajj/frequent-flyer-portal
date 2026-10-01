* {
  box-sizing: border-box;
}

:root {
  --bg: #f3f7fb;
  --panel: #ffffff;
  --primary: #173a72;
  --secondary: #0f9d8d;
  --accent: #f7b267;
  --text: #1a2433;
  --muted: #5c6b7c;
  --border: #dfe8f3;
}

body {
  margin: 0;
  background: linear-gradient(180deg, #edf4ff 0%, var(--bg) 35%, #eef5f4 100%);
  color: var(--text);
  font-family: Inter, "Segoe UI", sans-serif;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 auto;
  padding: 2rem 3rem 1rem;
  max-width: 1200px;
}

h1, h2, p {
  margin: 0;
}

.eyebrow {
  color: var(--secondary);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h1 {
  margin-top: 0.35rem;
  font-size: clamp(2rem, 4vw, 3rem);
}

.layout {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 3rem 3rem;
}

.panel {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 18px;
  box-shadow: 0 16px 32px rgba(23, 58, 114, 0.08);
  padding: 1.5rem;
  margin-top: 1.5rem;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: linear-gradient(135deg, rgba(23, 58, 114, 0.96), rgba(15, 157, 141, 0.92));
  color: white;
  padding: 1.25rem;
  border-radius: 18px;
  min-height: 120px;
}

.stat-card p {
  opacity: 0.8;
  margin-bottom: 0.5rem;
}

.stat-card strong {
  font-size: 2rem;
  display: block;
}

.stack {
  display: grid;
  gap: 1rem;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

label {
  display: grid;
  gap: 0.35rem;
  color: var(--muted);
  font-size: 0.92rem;
  font-weight: 600;
}

input, select, button {
  font: inherit;
}

input, select {
  min-height: 42px;
  padding: 0.7rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: #f8fbff;
  color: var(--text);
}

button {
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.15s ease;
}

button:hover {
  transform: translateY(-1px);
}

.primary-button {
  background: linear-gradient(135deg, var(--primary), #2557a8);
  color: white;
  padding: 0.85rem 1.2rem;
  font-weight: 700;
}

.secondary-button {
  background: linear-gradient(135deg, var(--secondary), #18a49d);
  color: white;
  padding: 0.85rem 1.2rem;
  font-weight: 700;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.traveler-card,
.workflow-item {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1rem;
  background: #fbfcff;
}

.badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.25rem 0.6rem;
  background: rgba(15, 157, 141, 0.12);
  color: var(--secondary);
  font-weight: 700;
  margin-top: 0.75rem;
  font-size: 0.74rem;
}

.status-active {
  background: rgba(9, 142, 70, 0.12);
  color: #0a7f3f;
}

.status-paused {
  background: rgba(245, 158, 11, 0.12);
  color: #b66900;
}

.status-inactive {
  background: rgba(148, 163, 184, 0.12);
  color: #4b5563;
}

.workflow-list {
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
}

.workflow-meta {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: 0.5rem;
  color: var(--muted);
  font-size: 0.85rem;
}

.wide-panel {
  min-width: 0;
}

@media (max-width: 700px) {
  .topbar,
  .layout {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .topbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
