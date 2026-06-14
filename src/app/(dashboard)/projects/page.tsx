'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  ListTodo,
  Plus,
  Calendar,
  Clock,
  User,
  ArrowRight,
  Trash2,
  Check
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  column: 'todo' | 'in-progress' | 'review' | 'done';
  dueDate: string;
  assignee: string;
}

export default function ProjectsPage() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'task-1',
      title: 'Design Swiss Grid IG Templates',
      description: 'Establish typography and container border margins for the launch campaign.',
      column: 'todo',
      dueDate: '2026-06-15',
      assignee: 'Sarah Connor'
    },
    {
      id: 'task-2',
      title: 'Write VSL Script hooks',
      description: 'Write PAS and AIDA framework variations for TikTok paid ads.',
      column: 'in-progress',
      dueDate: '2026-06-13',
      assignee: 'Alex Mercer'
    },
    {
      id: 'task-3',
      title: 'Setup Outbound Webhooks listener',
      description: 'Audit JSON payloads and response codes in the developer console.',
      column: 'review',
      dueDate: '2026-06-12',
      assignee: 'Dev Ops'
    }
  ]);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAssignee, setNewAssignee] = useState('Sarah Connor');
  const [newDueDate, setNewDueDate] = useState('2026-06-15');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTitle,
      description: newDesc,
      column: 'todo',
      dueDate: newDueDate,
      assignee: newAssignee
    };

    setTasks((prev) => [...prev, newTask]);
    setNewTitle('');
    setNewDesc('');
    setShowAddForm(false);
  };

  const handleMoveTask = (id: string, nextCol: 'todo' | 'in-progress' | 'review' | 'done') => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, column: nextCol } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const renderColumn = (colName: 'todo' | 'in-progress' | 'review' | 'done', title: string) => {
    const filteredTasks = tasks.filter((t) => t.column === colName);

    return (
      <div className="bg-surface border border-border-custom rounded-card p-4 space-y-4 min-h-[500px] flex flex-col">
        {/* Column Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-border-custom/60">
          <span className="font-display font-bold text-xs uppercase tracking-wider text-text-primary">
            {title}
          </span>
          <span className="font-mono text-[9px] bg-background border border-border-custom px-2 py-0.5 rounded font-bold text-text-muted">
            {filteredTasks.length}
          </span>
        </div>

        {/* Task list */}
        <div className="flex-1 space-y-3 overflow-y-auto">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-background border border-border-custom rounded-sm p-4 space-y-3 group hover:border-accent/40 transition-colors"
            >
              <div className="space-y-1">
                <h5 className="font-sans font-bold text-xs text-text-primary leading-snug">
                  {task.title}
                </h5>
                <p className="font-sans text-[10px] text-text-muted leading-relaxed">
                  {task.description}
                </p>
              </div>

              {/* Task metadata */}
              <div className="pt-2 border-t border-border-custom/40 flex flex-wrap gap-2 text-[9px] font-mono text-text-muted">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3 text-zinc-500" />
                  <span>{task.assignee}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-zinc-500" />
                  <span>{task.dueDate}</span>
                </div>
              </div>

              {/* Quick column controls */}
              <div className="pt-2 border-t border-border-custom/40 flex items-center justify-between">
                <div className="flex gap-1">
                  {colName !== 'todo' && (
                    <button
                      onClick={() => {
                        const flow: Record<string, 'todo' | 'in-progress' | 'review'> = {
                          'in-progress': 'todo',
                          'review': 'in-progress',
                          'done': 'review'
                        };
                        handleMoveTask(task.id, flow[colName]);
                      }}
                      className="p-1 bg-zinc-900 border border-border-custom text-text-muted hover:text-text-primary rounded-sm cursor-pointer"
                      title="Move Left"
                    >
                      <span className="font-mono text-[8px] uppercase font-bold">&lt;</span>
                    </button>
                  )}
                  {colName !== 'done' && (
                    <button
                      onClick={() => {
                        const flow: Record<string, 'in-progress' | 'review' | 'done'> = {
                          'todo': 'in-progress',
                          'in-progress': 'review',
                          'review': 'done'
                        };
                        handleMoveTask(task.id, flow[colName]);
                      }}
                      className="p-1 bg-zinc-900 border border-border-custom text-text-muted hover:text-text-primary rounded-sm cursor-pointer"
                      title="Move Right"
                    >
                      <span className="font-mono text-[8px] uppercase font-bold">&gt;</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1 bg-zinc-900 border border-border-custom text-red-400 hover:text-red-500 rounded-sm cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete Task"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <PageHeader
          title="Project Management"
          description="Collaborate with designers, copywriters, and clients to track campaign tasks on Swiss Modernist Kanban boards."
        />

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="self-start sm:self-center bg-accent hover:bg-accent-hover text-white font-mono text-xs uppercase tracking-wider py-2 px-4 rounded-badge flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Deliverable</span>
        </button>
      </div>

      {/* Task Creation Form Slider */}
      {showAddForm && (
        <div className="bg-surface border border-border-custom p-6 rounded-card max-w-xl animate-fade-in">
          <form onSubmit={handleAddTask} className="space-y-4 font-sans text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-border-custom">
              <ListTodo className="w-4 h-4 text-accent" />
              <span className="font-bold text-xs uppercase tracking-wider text-text-primary font-display">Create Task</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Task Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Draft Meta Ad copy"
                className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary rounded-sm focus:outline-none focus:border-accent font-sans"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Description</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Details about standard parameters..."
                className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary rounded-sm focus:outline-none focus:border-accent font-sans resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Assignee</label>
                <select
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary rounded-sm focus:outline-none"
                >
                  <option value="Sarah Connor">Sarah Connor (Designer)</option>
                  <option value="Alex Mercer">Alex Mercer (Copywriter)</option>
                  <option value="Dev Ops">Dev Ops (Developer)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Due Date</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary rounded-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-border-custom text-text-primary rounded-sm hover:bg-zinc-800 uppercase font-mono tracking-wider font-bold text-[10px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-sm uppercase font-mono tracking-wider font-bold text-[10px]"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderColumn('todo', 'To Do')}
        {renderColumn('in-progress', 'In Progress')}
        {renderColumn('review', 'In Review')}
        {renderColumn('done', 'Done')}
      </div>
    </div>
  );
}
