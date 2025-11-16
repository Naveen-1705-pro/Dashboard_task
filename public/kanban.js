// Initial sample tasks
const initialTasks = [
    {
        id: '1',
        title: 'Design new landing page',
        description: 'Create mockups for the new product landing page with modern design',
        priority: 'high',
        status: 'in-progress',
        assignee: 'Sarah',
        dueDate: '2025-11-20',
        tags: ['design', 'ui/ux'],
        createdAt: new Date().toISOString()
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
        createdAt: new Date().toISOString()
    },
    {
        id: '3',
        title: 'Write API documentation',
        description: 'Document all REST API endpoints with examples',
        priority: 'medium',
        status: 'todo',
        assignee: 'Mike',
        tags: ['documentation'],
        createdAt: new Date().toISOString()
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
        createdAt: new Date().toISOString()
    },
    {
        id: '5',
        title: 'Setup CI/CD pipeline',
        description: 'Configure automated testing and deployment',
        priority: 'low',
        status: 'done',
        assignee: 'Alex',
        tags: ['devops'],
        createdAt: new Date().toISOString()
    }
];

// State management
let tasks = JSON.parse(localStorage.getItem('kanban-tasks')) || initialTasks;
let draggedTaskId = null;
let currentEditingTask = null;
let defaultStatus = 'todo';

// DOM elements
const searchInput = document.getElementById('searchInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskModal = document.getElementById('taskModal');
const closeModalBtn = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const taskForm = document.getElementById('taskForm');
const deleteTaskBtn = document.getElementById('deleteTaskBtn');

// Initialize app
function init() {
    renderTasks();
    attachEventListeners();
}

// Attach event listeners
function attachEventListeners() {
    searchInput.addEventListener('input', handleSearch);
    addTaskBtn.addEventListener('click', () => openModal());
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    taskForm.addEventListener('submit', handleFormSubmit);
    deleteTaskBtn.addEventListener('click', handleDeleteTask);
    
    // Add task buttons in columns
    document.querySelectorAll('.add-task-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const status = e.currentTarget.dataset.status;
            openModal(status);
        });
    });
    
    // Close modal on backdrop click
    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) {
            closeModal();
        }
    });
}

// Render tasks
function renderTasks(searchQuery = '') {
    const columns = {
        'todo': document.querySelector('[data-status="todo"]'),
        'in-progress': document.querySelector('[data-status="in-progress"]'),
        'done': document.querySelector('[data-status="done"]')
    };
    
    // Clear columns
    Object.values(columns).forEach(column => {
        column.innerHTML = '';
    });
    
    // Filter tasks
    const filteredTasks = tasks.filter(task => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            task.title.toLowerCase().includes(query) ||
            task.description.toLowerCase().includes(query) ||
            task.tags?.some(tag => tag.toLowerCase().includes(query))
        );
    });
    
    // Group tasks by status
    const tasksByStatus = {
        'todo': [],
        'in-progress': [],
        'done': []
    };
    
    filteredTasks.forEach(task => {
        tasksByStatus[task.status].push(task);
    });
    
    // Render tasks in columns
    Object.entries(tasksByStatus).forEach(([status, statusTasks]) => {
        const column = columns[status];
        
        if (statusTasks.length === 0) {
            column.innerHTML = '<div class="empty-state">No tasks yet</div>';
        } else {
            statusTasks.forEach(task => {
                const taskCard = createTaskCard(task);
                column.appendChild(taskCard);
            });
        }
        
        // Update task count
        const countElement = document.querySelector(`[data-column="${status}"]`);
        countElement.textContent = statusTasks.length;
        
        // Add drag and drop listeners
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('drop', (e) => handleDrop(e, status));
        column.addEventListener('dragleave', handleDragLeave);
    });
}

// Create task card element
function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.draggable = true;
    card.dataset.taskId = task.id;
    
    card.innerHTML = `
        <div class="task-header">
            <h3 class="task-title">${escapeHtml(task.title)}</h3>
            <div class="priority-indicator priority-${task.priority}"></div>
        </div>
        ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
        ${task.tags && task.tags.length > 0 ? `
            <div class="task-tags">
                ${task.tags.map(tag => `
                    <span class="task-tag">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path>
                            <path d="M7 7h.01"></path>
                        </svg>
                        ${escapeHtml(tag)}
                    </span>
                `).join('')}
            </div>
        ` : ''}
        <div class="task-footer">
            ${task.assignee ? `
                <div class="task-info">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span>${escapeHtml(task.assignee)}</span>
                </div>
            ` : '<div></div>'}
            ${task.dueDate ? `
                <div class="task-info">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                        <line x1="16" x2="16" y1="2" y2="6"></line>
                        <line x1="8" x2="8" y1="2" y2="6"></line>
                        <line x1="3" x2="21" y1="10" y2="10"></line>
                    </svg>
                    <span>${formatDate(task.dueDate)}</span>
                </div>
            ` : '<div></div>'}
        </div>
    `;
    
    // Event listeners
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
    card.addEventListener('click', () => openModal(null, task));
    
    return card;
}

// Drag and drop handlers
function handleDragStart(e) {
    draggedTaskId = e.currentTarget.dataset.taskId;
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    draggedTaskId = null;
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    if (e.currentTarget === e.target) {
        e.currentTarget.classList.remove('drag-over');
    }
}

function handleDrop(e, newStatus) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    if (!draggedTaskId) return;
    
    // Update task status
    const taskIndex = tasks.findIndex(t => t.id === draggedTaskId);
    if (taskIndex !== -1) {
        tasks[taskIndex].status = newStatus;
        saveTasks();
        renderTasks(searchInput.value);
    }
}

// Modal handlers
function openModal(status = 'todo', task = null) {
    currentEditingTask = task;
    defaultStatus = status;
    
    const modalTitle = document.getElementById('modalTitle');
    const submitBtnText = document.getElementById('submitBtnText');
    
    if (task) {
        // Edit mode
        modalTitle.textContent = 'Edit Task';
        submitBtnText.textContent = 'Update';
        deleteTaskBtn.style.display = 'inline-flex';
        
        // Populate form
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskStatus').value = task.status;
        document.getElementById('taskAssignee').value = task.assignee || '';
        document.getElementById('taskDueDate').value = task.dueDate || '';
        document.getElementById('taskTags').value = task.tags?.join(', ') || '';
    } else {
        // Create mode
        modalTitle.textContent = 'Create New Task';
        submitBtnText.textContent = 'Create';
        deleteTaskBtn.style.display = 'none';
        
        // Reset form
        taskForm.reset();
        document.getElementById('taskStatus').value = defaultStatus;
        document.getElementById('taskPriority').value = 'medium';
    }
    
    taskModal.classList.add('active');
    document.getElementById('taskTitle').focus();
}

function closeModal() {
    taskModal.classList.remove('active');
    taskForm.reset();
    currentEditingTask = null;
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        title: document.getElementById('taskTitle').value.trim(),
        description: document.getElementById('taskDescription').value.trim(),
        priority: document.getElementById('taskPriority').value,
        status: document.getElementById('taskStatus').value,
        assignee: document.getElementById('taskAssignee').value.trim(),
        dueDate: document.getElementById('taskDueDate').value,
        tags: document.getElementById('taskTags').value
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0)
    };
    
    if (!formData.title) return;
    
    if (currentEditingTask) {
        // Update existing task
        const taskIndex = tasks.findIndex(t => t.id === currentEditingTask.id);
        if (taskIndex !== -1) {
            tasks[taskIndex] = {
                ...tasks[taskIndex],
                ...formData
            };
        }
    } else {
        // Create new task
        const newTask = {
            id: `task-${Date.now()}`,
            ...formData,
            createdAt: new Date().toISOString()
        };
        tasks.push(newTask);
    }
    
    saveTasks();
    renderTasks(searchInput.value);
    closeModal();
}

function handleDeleteTask() {
    if (!currentEditingTask) return;
    
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== currentEditingTask.id);
        saveTasks();
        renderTasks(searchInput.value);
        closeModal();
    }
}

// Search handler
function handleSearch(e) {
    renderTasks(e.target.value);
}

// Utility functions
function saveTasks() {
    localStorage.setItem('kanban-tasks', JSON.stringify(tasks));
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize app on load
document.addEventListener('DOMContentLoaded', init);
