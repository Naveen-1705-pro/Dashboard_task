import { useState, useEffect } from 'react';
import { Task, Status, Column } from '@/types/kanban';
import { KanbanColumn } from './KanbanColumn';
import { TaskModal } from './TaskModal';
import { Search, Filter, Plus } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Design new landing page',
    description: 'Create mockups for the new product landing page with modern design',
    priority: 'high',
    status: 'in-progress',
    assignee: 'Sarah',
    dueDate: '2025-11-20',
    tags: ['design', 'ui/ux'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Implement authentication',
    description: 'Add JWT-based authentication system',
    priority: 'high',
    status: 'todo',
    assignee: 'John',
    dueDate: '2025-11-18',
    tags: ['backend', 'security'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Write API documentation',
    description: 'Document all REST API endpoints with examples',
    priority: 'medium',
    status: 'todo',
    assignee: 'Mike',
    tags: ['documentation'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Fix mobile responsive issues',
    description: 'Resolve layout problems on mobile devices',
    priority: 'high',
    status: 'in-progress',
    assignee: 'Sarah',
    dueDate: '2025-11-17',
    tags: ['frontend', 'bug'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Setup CI/CD pipeline',
    description: 'Configure automated testing and deployment',
    priority: 'low',
    status: 'done',
    assignee: 'Alex',
    tags: ['devops'],
    createdAt: new Date().toISOString(),
  },
];

export const KanbanBoard = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [defaultStatus, setDefaultStatus] = useState<Status>('todo');

  const columns: Column[] = [
    {
      id: 'todo',
      title: 'To Do',
      tasks: tasks.filter((t) => t.status === 'todo'),
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      tasks: tasks.filter((t) => t.status === 'in-progress'),
    },
    {
      id: 'done',
      title: 'Done',
      tasks: tasks.filter((t) => t.status === 'done'),
    },
  ];

  const filteredColumns = columns.map((col) => ({
    ...col,
    tasks: col.tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    ),
  }));

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDraggedOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (!draggedTask) return;

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === draggedTask ? { ...task, status: newStatus as Status } : task
      )
    );

    setDraggedTask(null);
    setDraggedOverColumn(null);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = (task: Task) => {
    setTasks((prevTasks) => {
      const existingIndex = prevTasks.findIndex((t) => t.id === task.id);
      if (existingIndex >= 0) {
        const newTasks = [...prevTasks];
        newTasks[existingIndex] = task;
        return newTasks;
      }
      return [...prevTasks, task];
    });
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((t) => t.id !== taskId));
  };

  const handleAddTask = (status: Status) => {
    setDefaultStatus(status);
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                Kanban Board
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Manage your tasks efficiently
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                onClick={() => handleAddTask('todo')}
                className="bg-primary hover:bg-primary-dark"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Board */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-6 overflow-x-auto pb-4">
          {filteredColumns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onTaskClick={handleTaskClick}
              onAddTask={handleAddTask}
              isDraggedOver={draggedOverColumn === column.id}
            />
          ))}
        </div>
      </main>

      {/* Task Modal */}
      <TaskModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        defaultStatus={defaultStatus}
      />
    </div>
  );
};
