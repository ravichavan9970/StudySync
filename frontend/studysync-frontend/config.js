// Configuration for StudySync
const CONFIG = {
  user: {
    name: 'Ravin',
  },
  
  storageKeys: {
    tasks: 'studysync_tasks',
    notes: 'studysync_notes',
    sessions: 'studysync_sessions',
    completions: 'studysync_completions',
    auth: 'studysync_auth',
  },
  
  seedTasks: [
    { title: 'Review calculus chapter 4', subject: 'Mathematics', priority: 'high', done: false, dayOffset: 0 },
    { title: 'Complete Python assignment', subject: 'Computer Science', priority: 'high', done: true, dayOffset: -1 },
    { title: 'Read history textbook pages 120-140', subject: 'History', priority: 'medium', done: false, dayOffset: 1 },
    { title: 'Practice French vocabulary', subject: 'Languages', priority: 'low', done: false, dayOffset: 2 },
    { title: 'Chemistry lab report', subject: 'Chemistry', priority: 'medium', done: false, dayOffset: 3 },
  ],
  
  seedNotes: [
    { title: 'Algebra Tips', body: 'Remember PEMDAS and always combine like terms first', daysAgo: 2 },
    { title: 'Shakespeare Notes', body: 'Romeo and Juliet themes: fate, love, and family conflict', daysAgo: 5 },
    { title: 'Study Ideas', body: 'Try the Pomodoro technique for better focus', daysAgo: 7 },
  ],
  
  subjects: [
    { name: 'Mathematics', icon: '∑', color: '#7259ef', bg: '#f0eeff' },
    { name: 'Physics', icon: '⚛', color: '#40c79a', bg: '#e8f8f5' },
    { name: 'Chemistry', icon: '⚗', color: '#ff9f43', bg: '#fff5e6' },
    { name: 'Biology', icon: '🧬', color: '#26de81', bg: '#e8f8f5' },
    { name: 'History', icon: '📜', color: '#fd79a8', bg: '#ffe6f0' },
    { name: 'Languages', icon: '🌐', color: '#6c5ce7', bg: '#f0eeff' },
    { name: 'Computer Science', icon: '💻', color: '#0984e3', bg: '#e6f2ff' },
    { name: 'Literature', icon: '📖', color: '#e17055', bg: '#ffe6d9' },
  ],
};
