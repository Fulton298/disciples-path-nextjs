"use client";

import { useEffect, useState } from 'react';

// Define the list of themes shown on the Today page.  These mirror the spiritual
// focuses used in the richer React prototype (charity, humility, mercy, etc.).
const THEMES = [
  'Charity (Love of Neighbor)',
  'Humility & Hiddenness',
  'Forgiveness & Mercy',
  'Prayer & Trust',
  'Witness & Mission',
  'Fasting/Almsgiving',
  'Truthfulness',
  'Patience & Perseverance',
];

// Define a handful of default tasks that reflect the Beatitudes and works of mercy.
const DEFAULT_TASKS = [
  {
    title: 'Pray for someone difficult',
    description: 'Lift a specific person to the Lord for 3 minutes. Bless; do not curse.',
    virtue: 'Charity',
  },
  {
    title: 'Read today\'s Gospel aloud',
    description: 'Proclaim the Gospel reading to yourself or to a family member.',
    virtue: 'Faith',
  },
  {
    title: 'Offer an anonymous act of kindness',
    description: 'Do something good without anyone knowing. Give God the glory.',
    virtue: 'Humility',
  },
  {
    title: 'Fast from a small comfort',
    description: 'Skip a snack, social media, or other convenience and offer it up.',
    virtue: 'Temperance',
  },
  {
    title: 'Reach out to someone lonely',
    description: 'Send a message or call a person who may feel isolated.',
    virtue: 'Justice',
  },
];

// Define a simple temptation encounter.  In a production app you would randomize and
// vary these each day; here we include one for demonstration.
const TEMPTATION = {
  prompt: 'Pray Now or Later?',
  description:
    'A nudge to pray crosses your mind. Do you pray now for 2 minutes or postpone?',
  options: [
    {
      label: 'Pray now (2 min)',
      virtue: 'Fortitude',
      outcome: 'You chose to pray immediately. Fortitude grows!',
    },
    {
      label: 'Later (maybe)',
      virtue: null,
      outcome: 'You postponed prayer. Be attentive to God\'s invitations.',
    },
  ],
};

// Initial virtue scores.  These correspond loosely to the theological and cardinal
// virtues.  Additional virtues (Prudence, Hope, etc.) could be added here.
const INITIAL_VIRTUES: Record<string, number> = {
  Faith: 0,
  Hope: 0,
  Charity: 0,
  Justice: 0,
  Fortitude: 0,
  Temperance: 0,
  Prudence: 0,
};

type Task = {
  title: string;
  description: string;
  virtue: string;
  hidden?: boolean;
  done?: boolean;
};

export default function HomePage() {
  // Track which tab is active: 'today', 'virtues' or 'examen'.
  const [activeTab, setActiveTab] = useState<'today' | 'virtues' | 'examen'>('today');
  // Current list of tasks for the day.
  const [tasks, setTasks] = useState<Task[]>(() => {
    // Try to restore tasks from localStorage if present.
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('disciples-tasks');
      if (saved) {
        try {
          return JSON.parse(saved) as Task[];
        } catch (e) {
          // fall through to default tasks
        }
      }
    }
    return DEFAULT_TASKS.map((t) => ({ ...t, hidden: false, done: false }));
  });
  // Chosen theme tag.
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  // Virtue progress.  Stored as counts.
  const [virtues, setVirtues] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('disciples-virtues');
      if (saved) {
        try {
          return JSON.parse(saved) as Record<string, number>;
        } catch (e) {
          /* ignore */
        }
      }
    }
    return { ...INITIAL_VIRTUES };
  });
  // Examen notes for the day.
  const [examenNotes, setExamenNotes] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('disciples-examen') || '';
    }
    return '';
  });
  // Temptation outcome message once a choice is made.
  const [temptationOutcome, setTemptationOutcome] = useState<string | null>(null);
  // Track whether the temptation choice has been answered.
  const [temptationAnswered, setTemptationAnswered] = useState<boolean>(false);

  // Persist tasks and virtues to localStorage when they change.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('disciples-tasks', JSON.stringify(tasks));
    }
  }, [tasks]);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('disciples-virtues', JSON.stringify(virtues));
    }
  }, [virtues]);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('disciples-examen', examenNotes);
    }
  }, [examenNotes]);

  // Generate a new set of tasks (randomly pick 5 from DEFAULT_TASKS).
  function regenerateTasks() {
    const shuffled = [...DEFAULT_TASKS].sort(() => 0.5 - Math.random());
    const newTasks: Task[] = shuffled.slice(0, 5).map((t) => ({ ...t, hidden: false, done: false }));
    setTasks(newTasks);
    setTemptationOutcome(null);
    setTemptationAnswered(false);
  }

  // Toggle whether a task is hidden (secret).
  function toggleHidden(index: number) {
    setTasks((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], hidden: !updated[index].hidden };
      return updated;
    });
  }
  // Mark a task as done and award virtue points.  Hidden tasks give double points.
  function markDone(index: number) {
    setTasks((prev) => {
      const updated = [...prev];
      if (updated[index].done) return updated;
      updated[index] = { ...updated[index], done: true };
      const virtueName = updated[index].virtue;
      setVirtues((v) => {
        const current = v[virtueName] || 0;
        const bonus = updated[index].hidden ? 2 : 1;
        return { ...v, [virtueName]: current + bonus };
      });
      return updated;
    });
  }
  // Handle temptation choice.  Award virtue and display outcome.
  function handleTemptation(optionIndex: number) {
    if (temptationAnswered) return;
    const option = TEMPTATION.options[optionIndex];
    if (option.virtue) {
      setVirtues((v) => ({ ...v, [option.virtue!]: (v[option.virtue!] || 0) + 1 }));
    }
    setTemptationOutcome(option.outcome);
    setTemptationAnswered(true);
  }
  // Save the examen notes and reset tasks/temptation for the next day.
  function saveExamen() {
    // In a real app you might also send this to a backend or generate a PDF.
    setExamenNotes(examenNotes.trim());
  }

  return (
    <div className="max-w-4xl mx-auto w-full p-4 flex flex-col flex-grow">
      {/* Header with logo and holiness level */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Disciple&apos;s Path</h1>
          <p className="text-sm text-gray-600">Growth in virtue and daily fidelity — by grace.</p>
        </div>
        <div className="mt-2 sm:mt-0">
          <span className="text-sm font-medium">Holiness Lv 0</span>
        </div>
      </header>
      {/* Tab navigation */}
      <nav className="flex space-x-4 border-b mb-4">
      {['today', 'virtues', 'examen'].map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab as 'today' | 'virtues' | 'examen')}
          className={`px-3 py-2 -mb-px border-b-2 transition-colors ${
            activeTab === tab
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-600'
          }`}
        >
          {tab === 'today' ? 'Today' : tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
      </nav>
      {/* Today tab */}
      {activeTab === 'today' && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Today&apos;s Gospel &amp; Quests</h2>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Gospel reference</label>
            <input
              type="text"
              className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
              placeholder="e.g. Luke 10:25–37 (Good Samaritan)"
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
            <div className="flex flex-wrap gap-2">
              {THEMES.map((theme) => (
                <button
                  key={theme}
                  className={`px-2 py-1 text-sm rounded-full border ${
                    selectedTheme === theme ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
                  }`}
                  onClick={() => setSelectedTheme(selectedTheme === theme ? null : theme)}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">One-line insight</label>
            <textarea
              className="w-full p-2 border rounded h-20 focus:outline-none focus:ring focus:border-blue-300"
              placeholder="What is Jesus inviting you to today?"
            />
          </div>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => { /* The Lectio timer could be implemented with a countdown */ }}
              className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Start Lectio (6 min)
            </button>
            <button
              onClick={regenerateTasks}
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Regenerate Quests
            </button>
          </div>
          {/* Task list */}
          <div className="space-y-3">
            {tasks.map((task, idx) => (
              <div key={idx} className="p-3 border rounded bg-white shadow-sm">
                <h3 className="font-medium text-gray-800 mb-1">{task.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={task.hidden || false}
                      onChange={() => toggleHidden(idx)}
                      className="rounded"
                    />
                    <span>Hidden</span>
                  </label>
                  <button
                    onClick={() => markDone(idx)}
                    disabled={task.done}
                    className={`px-2 py-1 rounded ${
                      task.done ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {task.done ? 'Done' : 'Mark done'}
                  </button>
                </div>
                {task.done && (
                  <p className="text-xs text-green-600 mt-1">Virtue +{task.hidden ? 2 : 1} ({task.virtue})</p>
                )}
              </div>
            ))}
          </div>
          {/* Temptation encounter */}
          <div className="mt-6 p-4 border rounded bg-white shadow-sm">
            <h3 className="font-medium mb-2">Temptation Encounter</h3>
            <p className="mb-2 font-semibold">{TEMPTATION.prompt}</p>
            <p className="mb-4 text-sm text-gray-600">{TEMPTATION.description}</p>
            <div className="flex gap-2">
              {TEMPTATION.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTemptation(idx)}
                  disabled={temptationAnswered}
                  className={`px-3 py-2 rounded flex-1 text-center ${
                    temptationAnswered
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : idx === 0
                      ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {temptationOutcome && (
              <p className="mt-3 text-sm text-indigo-600">{temptationOutcome}</p>
            )}
          </div>
        </section>
      )}
      {/* Virtues tab */}
      {activeTab === 'virtues' && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Virtue Progress</h2>
          <p className="text-sm text-gray-600 mb-4">
            Each completed act increases the associated virtue. Hidden acts earn an
            extra point. Remember that grace, not your own effort, ultimately makes
            you holy.
          </p>
          <div className="space-y-2">
            {Object.keys(virtues).map((name) => {
              const value = virtues[name];
              const width = Math.min(value * 10, 100); // each point =10%
              return (
                <div key={name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{name}</span>
                    <span className="text-sm text-gray-600">{value}</span>
                  </div>
                    <div className="w-full bg-gray-200 rounded h-3">
                      <div
                        className="bg-blue-600 h-3 rounded"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
      {/* Examen tab */}
      {activeTab === 'examen' && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Nightly Examen</h2>
          <p className="text-sm text-gray-600 mb-4">
            Take a moment to review your day with God. Thank Him for the ways He
            worked, notice where you grew and where you fell short, and invite
            grace for tomorrow. Your notes stay on your device.
          </p>
          <textarea
            value={examenNotes}
            onChange={(e) => setExamenNotes(e.target.value)}
            className="w-full p-3 border rounded h-40 focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Write your examen reflections here..."
          />
          <button
            onClick={saveExamen}
            className="mt-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save Examen
          </button>
        </section>
      )}
    </div>
  );
}