const taskForm = document.getElementById("taskForm");
const taskIdInput = document.getElementById("taskId");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const priorityInput = document.getElementById("priority");
const categoryInput = document.getElementById("category");
const dueDateInput = document.getElementById("dueDate");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const priorityFilter = document.getElementById("priorityFilter");

const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");

const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");

const cancelEditBtn = document.getElementById("cancelEditBtn");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateSummary() {
  totalTasks.textContent = tasks.length;
  pendingTasks.textContent = tasks.filter(task => !task.completed).length;
  completedTasks.textContent = tasks.filter(task => task.completed).length;
}

function formatDate(dateString) {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

function renderTasks() {
  const searchTerm = searchInput.value.toLowerCase();
  const statusValue = statusFilter.value;
  const priorityValue = priorityFilter.value;

  let filteredTasks = tasks.filter(task => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm) ||
      task.category.toLowerCase().includes(searchTerm);

    const matchesStatus =
      statusValue === "all" ||
      (statusValue === "completed" && task.completed) ||
      (statusValue === "pending" && !task.completed);

    const matchesPriority =
      priorityValue === "all" || task.priority === priorityValue;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  taskList.innerHTML = "";

  if (filteredTasks.length === 0) {
    emptyMessage.style.display = "block";
  } else {
    emptyMessage.style.display = "none";
  }

  filteredTasks.forEach(task => {
    const taskCard = document.createElement("div");
    taskCard.classList.add("task-card");
    if (task.completed) {
      taskCard.classList.add("completed");
    }

    taskCard.innerHTML = `
      <div class="task-top">
        <div>
          <div class="task-title">${task.title}</div>
          <p>${task.description || "Sem descrição."}</p>
        </div>
      </div>

      <div class="task-meta">
        <span class="badge priority-${task.priority}">${task.priority}</span>
        <span class="badge category-badge">${task.category}</span>
        <span class="badge date-badge">Entrega: ${formatDate(task.dueDate)}</span>
      </div>

      <div class="task-actions">
        <button class="complete-btn" onclick="toggleTask(${task.id})">
          ${task.completed ? "Reabrir" : "Concluir"}
        </button>
        <button class="edit-btn" onclick="editTask(${task.id})">Editar</button>
        <button class="delete-btn" onclick="deleteTask(${task.id})">Excluir</button>
      </div>
    `;

    taskList.appendChild(taskCard);
  });

  updateSummary();
}

taskForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const id = taskIdInput.value;
  const newTask = {
    id: id ? Number(id) : Date.now(),
    title: titleInput.value.trim(),
    description: descriptionInput.value.trim(),
    priority: priorityInput.value,
    category: categoryInput.value.trim(),
    dueDate: dueDateInput.value,
    completed: false
  };

  if (id) {
    const oldTask = tasks.find(task => task.id === Number(id));
    newTask.completed = oldTask.completed;
    tasks = tasks.map(task => task.id === Number(id) ? newTask : task);
  } else {
    tasks.push(newTask);
  }

  saveTasks();
  taskForm.reset();
  taskIdInput.value = "";
  cancelEditBtn.classList.add("hidden");
  renderTasks();
});

function deleteTask(id) {
  if (confirm("Deseja realmente excluir esta tarefa?")) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
  }
}

function toggleTask(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
}

function editTask(id) {
  const task = tasks.find(task => task.id === id);
  if (!task) return;

  taskIdInput.value = task.id;
  titleInput.value = task.title;
  descriptionInput.value = task.description;
  priorityInput.value = task.priority;
  categoryInput.value = task.category;
  dueDateInput.value = task.dueDate;

  cancelEditBtn.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

cancelEditBtn.addEventListener("click", () => {
  taskForm.reset();
  taskIdInput.value = "";
  cancelEditBtn.classList.add("hidden");
});

searchInput.addEventListener("input", renderTasks);
statusFilter.addEventListener("change", renderTasks);
priorityFilter.addEventListener("change", renderTasks);

renderTasks();