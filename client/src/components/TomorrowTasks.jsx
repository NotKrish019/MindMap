import React, { useState, useEffect } from 'react';

const TomorrowTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem('tomorrowTasks') || '[]');
    setTasks(savedTasks);
  }, []);

  const saveTasks = (newTasks) => {
    setTasks(newTasks);
    localStorage.setItem('tomorrowTasks', JSON.stringify(newTasks));
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const task = { id: Date.now(), text: newTask, completed: false };
    saveTasks([...tasks, task]);
    setNewTask('');
  };

  const toggleTask = (id) => {
    const newTasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveTasks(newTasks);
  };

  const deleteTask = (id) => {
    const newTasks = tasks.filter(t => t.id !== id);
    saveTasks(newTasks);
  };

  return (
    <div className="neobrutal-card neobrutal-shadow p-8 bg-white rounded-3xl h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h3 className="font-h3 text-2xl text-zinc-900">Tomorrow's Focus</h3>
        <span className="material-symbols-outlined text-zinc-300">event_repeat</span>
      </div>
      
      <form onSubmit={addTask} className="flex gap-2 mb-6">
        <input 
          type="text" 
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="What's next?"
          className="flex-grow bg-zinc-50 border-2 border-zinc-900 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 font-body-md"
        />
        <button 
          type="submit"
          className="bg-primary text-white border-2 border-zinc-900 p-2 rounded-xl hover:translate-y-[-2px] transition-transform active:translate-y-0"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
      </form>

      <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
        {tasks.map(task => (
          <div 
            key={task.id}
            className={`flex items-center gap-3 p-3 border-2 border-zinc-900 rounded-xl transition-all ${task.completed ? 'bg-zinc-50 border-zinc-200 opacity-60' : 'bg-white'}`}
          >
            <button 
              onClick={() => toggleTask(task.id)}
              className={`w-6 h-6 border-2 border-zinc-900 rounded-md flex items-center justify-center transition-colors ${task.completed ? 'bg-green-500 border-green-600 text-white' : 'bg-white'}`}
            >
              {task.completed && <span className="material-symbols-outlined text-xs">check</span>}
            </button>
            <span className={`flex-grow font-body-md text-sm ${task.completed ? 'line-through text-zinc-400' : 'text-zinc-900'}`}>
              {task.text}
            </span>
            <button 
              onClick={() => deleteTask(task.id)}
              className="material-symbols-outlined text-zinc-300 hover:text-red-500 transition-colors text-sm"
            >
              delete
            </button>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-zinc-300 italic text-sm">
            No tasks for tomorrow yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default TomorrowTasks;
