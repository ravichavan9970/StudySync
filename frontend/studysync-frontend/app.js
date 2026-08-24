// ---------- helpers ----------
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $all = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const pad = (n) => String(n).padStart(2, '0');
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function isoDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
function todayISO() {
  return isoDate(new Date());
}
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day; // Monday as start
  return addDays(d, diff);
}
function formatDueLabel(iso) {
  const today = todayISO();
  const tomorrow = isoDate(addDays(new Date(), 1));
  if (iso === today) return 'Today';
  if (iso === tomorrow) return 'Tomorrow';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

// ---------- storage ----------
const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
};

// ---------- state ----------
let tasks = store.get(CONFIG.storageKeys.tasks, null);
if (!tasks) {
  tasks = CONFIG.seedTasks.map((t) => ({
    id: uid(),
    title: t.title,
    subject: t.subject,
    priority: t.priority,
    done: t.done,
    date: isoDate(addDays(new Date(), t.dayOffset)),
  }));
  store.set(CONFIG.storageKeys.tasks, tasks);
}

let notes = store.get(CONFIG.storageKeys.notes, null);
if (!notes) {
  notes = CONFIG.seedNotes.map((n) => ({
    id: uid(),
    title: n.title,
    body: n.body,
    createdAt: Date.now() - n.daysAgo * 86400000,
  }));
  store.set(CONFIG.storageKeys.notes, notes);
}

let sessions = store.get(CONFIG.storageKeys.sessions, []);
let completions = store.get(CONFIG.storageKeys.completions, []); // array of ISO dates a task was completed on
let auth = store.get(CONFIG.storageKeys.auth, null);
let currentFilter = 'all';
let registering = false;

function saveTasks() { store.set(CONFIG.storageKeys.tasks, tasks); }
function saveNotes() { store.set(CONFIG.storageKeys.notes, notes); }
function saveSessions() { store.set(CONFIG.storageKeys.sessions, sessions); }
function saveCompletions() { store.set(CONFIG.storageKeys.completions, completions); }

// ---------- navigation ----------
function switchSection(id) {
  $all('.view').forEach((v) => v.classList.toggle('active', v.id === id));
  $all('.nav-link').forEach((b) => b.classList.toggle('active', b.dataset.section === id));
  if (id === 'analytics') renderAnalytics();
}

function bindNav() {
  $all('.nav-link').forEach((btn) => {
    btn.addEventListener('click', () => switchSection(btn.dataset.section));
  });
  $all('[data-section-target]').forEach((btn) => {
    btn.addEventListener('click', () => switchSection(btn.dataset.sectionTarget));
  });
}

// ---------- greeting ----------
function renderGreeting() {
  const hour = new Date().getHours();
  const part = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  const name = auth?.name || CONFIG.user.name;
  $('#pageTitle').innerHTML = `Good ${part}, ${name} <span>✦</span>`;
  $('#todayLabel').textContent = new Date()
    .toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
    .toUpperCase();
}

// ---------- task rendering ----------
function taskRowHTML(task) {
  return `
    <div class="task" data-id="${task.id}">
      <button class="check${task.done ? ' done' : ''}" data-action="toggle">${task.done ? '✓' : ''}</button>
      <div>
        <div class="task-name${task.done ? ' done' : ''}">${escapeHTML(task.title)}</div>
        <div class="task-meta">${escapeHTML(task.subject || 'General')} · ${formatDueLabel(task.date)}</div>
      </div>
      <span class="tag ${task.priority}">${task.priority}</span>
    </div>`;
}

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

const priorityRank = { high: 0, medium: 1, low: 2 };

function renderPriorityTasks() {
  const upcoming = tasks
    .filter((t) => !t.done)
    .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority] || a.date.localeCompare(b.date))
    .slice(0, 4);
  $('#priorityTasks').innerHTML = upcoming.length
    ? upcoming.map(taskRowHTML).join('')
    : '<p class="muted">Nothing urgent — nice work!</p>';
}

function renderAllTasks() {
  const today = todayISO();
  let list = tasks.slice().sort((a, b) => a.date.localeCompare(b.date));
  if (currentFilter === 'today') list = list.filter((t) => t.date === today);
  else if (currentFilter === 'upcoming') list = list.filter((t) => t.date > today && !t.done);
  else if (currentFilter === 'done') list = list.filter((t) => t.done);
  $('#allTasks').innerHTML = `<div class="task-list">${
    list.length ? list.map(taskRowHTML).join('') : '<p class="muted">No tasks here yet.</p>'
  }</div>`;
}

function bindFilters() {
  $all('.filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      $all('.filter').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderAllTasks();
    });
  });
}

// delegate check-clicks for both task lists
function bindTaskDelegation() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="toggle"]');
    if (!btn) return;
    const id = btn.closest('.task').dataset.id;
    toggleTask(id);
  });
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  task.done = !task.done;
  if (task.done) {
    const today = todayISO();
    if (!completions.includes(today)) completions.push(today);
    saveCompletions();
  }
  saveTasks();
  renderAll();
}

function addTask({ title, subject, date, priority }) {
  tasks.push({ id: uid(), title, subject, date, priority, done: false });
  saveTasks();
  renderAll();
}

// ---------- goal / subjects ----------
function renderGoal() {
  const today = todayISO();
  const todaysTasks = tasks.filter((t) => t.date === today);
  const pool = todaysTasks.length ? todaysTasks : tasks;
  const done = pool.filter((t) => t.done).length;
  const total = pool.length || 1;
  const percent = Math.round((done / total) * 100);
  $('#goalDone').textContent = done;
  $('#goalTotal').textContent = pool.length;
  $('#progressBar').style.width = `${percent}%`;
  $('#goalPercent').textContent = `${percent}%`;
  $('#goalMessage').textContent =
    percent >= 100 ? 'All done for today — excellent work!' :
    percent >= 50 ? 'Great momentum, keep it up.' :
    'A focused start — you\u2019re doing great.';
}

function renderSubjectCards() {
  const html = CONFIG.subjects.map((s) => {
    const subjectTasks = tasks.filter((t) => t.subject === s.name);
    const total = subjectTasks.length;
    const done = subjectTasks.filter((t) => t.done).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    return `
      <div class="subject" style="background:${s.bg}">
        <h4 style="color:${s.color}">${escapeHTML(s.name)}</h4>
        <p class="muted">${done}/${total} tasks</p>
        <div class="mini-progress"><span style="width:${pct}%;background:${s.color}"></span></div>
      </div>`;
  }).join('');
  $('#subjectCards').innerHTML = html;

  const weekMinutes = sessions
    .filter((s) => new Date(s.at) >= startOfWeek(new Date()))
    .reduce((sum, s) => sum + s.minutes, 0);
  $('#weekHours').textContent = weekMinutes >= 60
    ? `${(weekMinutes / 60).toFixed(1)}h studied`
    : `${weekMinutes}m studied`;
}

// ---------- notes ----------
function renderNotes() {
  const html = notes
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((n) => {
      const days = Math.floor((Date.now() - n.createdAt) / 86400000);
      const time = days <= 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago`;
      return `
        <div class="note">
          <h3>${escapeHTML(n.title)}</h3>
          <p>${escapeHTML(n.body)}</p>
          <time>${time}</time>
        </div>`;
    })
    .join('');
  $('#notesGrid').innerHTML = html || '<p class="muted">No notes yet — add your first one.</p>';
}

function addNote({ title, body }) {
  notes.push({ id: uid(), title, body, createdAt: Date.now() });
  saveNotes();
  renderNotes();
}

// ---------- planner ----------
function renderPlanner() {
  const monday = startOfWeek(new Date());
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const html = dayNames.map((label, i) => {
    const dayDate = isoDate(addDays(monday, i));
    const dayTasks = tasks.filter((t) => t.date === dayDate);
    return `
      <div class="planner-day">
        <h3>${label}</h3>
        <small>${dayTasks.length} task${dayTasks.length === 1 ? '' : 's'}</small>
        ${dayTasks.map((t) => `<div class="planner-task">${escapeHTML(t.title)}</div>`).join('')}
      </div>`;
  }).join('');
  $('#plannerDays').innerHTML = html;
}

// ---------- focus timer ----------
const timerState = { minutes: 25, remaining: 25 * 60, running: false, intervalId: null };

function updateTimerDisplay() {
  const m = Math.floor(timerState.remaining / 60);
  const s = timerState.remaining % 60;
  $('#timerDisplay').textContent = `${pad(m)}:${pad(s)}`;
  $('#miniMinutes').textContent = Math.ceil(timerState.remaining / 60);
}

function setTimerMode(minutes) {
  pauseTimer();
  timerState.minutes = minutes;
  timerState.remaining = minutes * 60;
  $all('.mode').forEach((b) => b.classList.toggle('active', Number(b.dataset.minutes) === minutes));
  $('#startTimer').textContent = 'Start session';
  updateTimerDisplay();
}

function startTimer() {
  if (timerState.running) {
    pauseTimer();
    return;
  }
  timerState.running = true;
  $('#startTimer').textContent = 'Pause session';
  timerState.intervalId = setInterval(() => {
    timerState.remaining -= 1;
    updateTimerDisplay();
    if (timerState.remaining <= 0) {
      finishTimer();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerState.intervalId);
  timerState.running = false;
  if ($('#startTimer')) $('#startTimer').textContent = 'Resume session';
}

function finishTimer() {
  clearInterval(timerState.intervalId);
  timerState.running = false;
  sessions.push({ at: Date.now(), minutes: timerState.minutes });
  saveSessions();
  timerState.remaining = timerState.minutes * 60;
  $('#startTimer').textContent = 'Start session';
  updateTimerDisplay();
  renderSubjectCards();
  if ($('#analytics').classList.contains('active')) renderAnalytics();
}

function resetTimer() {
  pauseTimer();
  timerState.remaining = timerState.minutes * 60;
  $('#startTimer').textContent = 'Start session';
  updateTimerDisplay();
}

function bindTimer() {
  $all('.mode').forEach((btn) => {
    btn.addEventListener('click', () => setTimerMode(Number(btn.dataset.minutes)));
  });
  $('#startTimer').addEventListener('click', startTimer);
  $('#resetTimer').addEventListener('click', resetTimer);
  updateTimerDisplay();
}

function populateFocusSelect() {
  const select = $('#focusTaskSelect');
  const active = tasks.filter((t) => !t.done);
  select.innerHTML =
    '<option value="">General focus session</option>' +
    active.map((t) => `<option value="${t.id}">${escapeHTML(t.title)}</option>`).join('');
}

function bindFocusNote() {
  const key = 'studysync_focus_note';
  $('#focusNote').value = localStorage.getItem(key) || '';
  $('#saveFocusNote').addEventListener('click', () => {
    localStorage.setItem(key, $('#focusNote').value);
    const btn = $('#saveFocusNote');
    const original = btn.textContent;
    btn.textContent = 'Saved!';
    setTimeout(() => (btn.textContent = original), 1200);
  });
}

// ---------- analytics ----------
let chartInstance = null;

function renderAnalytics() {
  const completed = tasks.filter((t) => t.done).length;
  const focusMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0);
  const score = Math.min(
    100,
    Math.round((completed / Math.max(tasks.length, 1)) * 60 + Math.min(40, focusMinutes / 5))
  );
  $('#completedStat').textContent = completed;
  $('#focusStat').textContent = focusMinutes >= 60 ? `${Math.floor(focusMinutes / 60)}h ${focusMinutes % 60}m` : `${focusMinutes}m`;
  $('#scoreStat').textContent = score;
  $('#analyticsSummary').textContent = `Week of ${startOfWeek(new Date()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
  renderChart();
}

function renderChart() {
  const canvas = $('#productivityChart');
  if (!canvas || typeof Chart === 'undefined') return;
  const monday = startOfWeek(new Date());
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const minutesByDay = labels.map((_, i) => {
    const dayISO = isoDate(addDays(monday, i));
    return sessions
      .filter((s) => isoDate(new Date(s.at)) === dayISO)
      .reduce((sum, s) => sum + s.minutes, 0);
  });
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Minutes focused',
        data: minutesByDay,
        backgroundColor: '#7259ef',
        borderRadius: 6,
        maxBarThickness: 34,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 15 } } },
    },
  });
}

// ---------- streak ----------
function renderStreak() {
  const days = new Set(completions);
  let streak = 0;
  let cursor = new Date();
  while (days.has(isoDate(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  $('#streakCount').textContent = `${streak} day streak`;
}

// ---------- dialogs: task ----------
function bindTaskDialog() {
  const dialog = $('#taskDialog');
  const open = () => {
    $('#taskTitle').value = '';
    $('#taskSubject').value = '';
    $('#taskDate').value = todayISO();
    $('#taskPriority').value = 'medium';
    dialog.showModal();
  };
  $('#newTaskBtn').addEventListener('click', open);
  $('#newTaskBtn2').addEventListener('click', open);

  $('#taskForm').addEventListener('submit', (e) => {
    if (e.submitter && e.submitter.value === 'cancel') return; // let it close naturally
    e.preventDefault();
    const title = $('#taskTitle').value.trim();
    const date = $('#taskDate').value;
    if (!title || !date) return;
    addTask({
      title,
      subject: $('#taskSubject').value.trim() || 'General',
      date,
      priority: $('#taskPriority').value,
    });
    dialog.close();
  });
}

// ---------- dialogs: note ----------
function bindNoteDialog() {
  const dialog = $('#noteDialog');
  $('#newNoteBtn').addEventListener('click', () => {
    $('#noteTitle').value = '';
    $('#noteContent').value = '';
    dialog.showModal();
  });

  $('#noteForm').addEventListener('submit', (e) => {
    if (e.submitter && e.submitter.value === 'cancel') return;
    e.preventDefault();
    const title = $('#noteTitle').value.trim();
    if (!title) return;
    addNote({ title, body: $('#noteContent').value.trim() });
    dialog.close();
  });
}

// ---------- dialogs: auth ----------
function setAuthMode(isRegistering) {
  registering = isRegistering;
  const dialog = $('#authDialog');
  dialog.classList.toggle('registering', registering);
  $('#authTitle').textContent = registering ? 'Create account' : 'Sign in';
  $('.eyebrow', $('.dialog-head', dialog)).textContent = registering ? 'GET STARTED' : 'WELCOME BACK';
  $('#authSubmit').textContent = registering ? 'Create account' : 'Sign in';
  $('#authSwitch').textContent = registering ? 'Already have an account? Sign in' : 'New here? Create an account';
  $('#authError').textContent = '';
}

function bindAuthDialog() {
  const dialog = $('#authDialog');

  const openDialog = (asRegister) => {
    $('#authName').value = auth?.name || '';
    $('#authEmail').value = auth?.email || '';
    $('#authPassword').value = '';
    setAuthMode(asRegister);
    dialog.showModal();
  };

  $('#profileBtn').addEventListener('click', () => openDialog(!auth));
  $('#logoutBtn').addEventListener('click', () => {
    auth = null;
    localStorage.removeItem(CONFIG.storageKeys.auth);
    $('#profileName').textContent = 'Guest';
    $('#avatarInitial').textContent = '?';
    renderGreeting();
    openDialog(false);
  });

  $('#authSwitch').addEventListener('click', () => setAuthMode(!registering));

  $('#authForm').addEventListener('submit', (e) => {
    if (e.submitter && e.submitter.value === 'cancel') return;
    e.preventDefault();
    const name = $('#authName').value.trim();
    const email = $('#authEmail').value.trim();
    const password = $('#authPassword').value;

    if (registering && !name) {
      $('#authError').textContent = 'Please enter your name.';
      return;
    }
    if (!email || !password || password.length < 8) {
      $('#authError').textContent = 'Enter a valid email and an 8+ character password.';
      return;
    }

    auth = { name: name || auth?.name || CONFIG.user.name, email };
    store.set(CONFIG.storageKeys.auth, auth);
    $('#profileName').textContent = auth.name;
    $('#avatarInitial').textContent = auth.name.charAt(0).toUpperCase();
    $('#authError').textContent = '';
    renderGreeting();
    dialog.close();
  });
}

// ---------- render all ----------
function renderAll() {
  renderGreeting();
  renderGoal();
  renderPriorityTasks();
  renderAllTasks();
  renderSubjectCards();
  renderNotes();
  renderPlanner();
  populateFocusSelect();
  renderStreak();
}

// ---------- init ----------
document.addEventListener('DOMContentLoaded', () => {
  if (auth) {
    $('#profileName').textContent = auth.name;
    $('#avatarInitial').textContent = auth.name.charAt(0).toUpperCase();
  }

  bindNav();
  bindFilters();
  bindTaskDelegation();
  bindTimer();
  bindFocusNote();
  bindTaskDialog();
  bindNoteDialog();
  bindAuthDialog();

  renderAll();
});
