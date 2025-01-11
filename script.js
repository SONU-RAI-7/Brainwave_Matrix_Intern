const taskInput = document.querySelector("#taskInput");
const taskDeadline = document.querySelector("#taskDeadline");
const taskStatus = document.querySelector("#taskStatus");
const addTaskButton = document.querySelector("#addTaskButton");
const taskList = document.querySelector("#taskList");
const clearAllButton = document.querySelector("#clearAllButton");
const totalTasks = document.querySelector("#totalTasks");
const completedTasks = document.querySelector("#completedTasks");
const themeToggle = document.querySelector("#themeToggle");
const sortSelect = document.querySelector("#sortSelect");
const filterSelect = document.querySelector("#filterSelect");

document.addEventListener("DOMContentLoaded", loadTasks);

addTaskButton.addEventListener("click", () => {
    const taskText = taskInput.value.trim();
    const deadline = taskDeadline.value;
    const status = taskStatus.value;

    if (taskText === "" || !deadline || !status) {
        alert("Task, deadline, and status cannot be empty.");
        return;
    }

    addTask(taskText, deadline, status);
    saveTask(taskText, deadline, status);
    taskInput.value = "";
    taskDeadline.value = "";
    taskStatus.value = "pending";
});

clearAllButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all tasks?")) {
        taskList.innerHTML = "";
        localStorage.removeItem("tasks");
        updateTaskInfo();
    }
});

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
});

function addTask(taskText, deadline, status, isCompleted = false) {
    const listItem = document.createElement("li");
    if (isCompleted) listItem.classList.add("completed");

    const taskSpan = createTaskElement("span", taskText);
    const taskDeadlineSpan = createTaskElement("span", deadline, "deadline");
    const taskStatusSpan = createTaskElement("span", status, "status");

    const completeButton = createTaskButton("✔", "complete", () => {
        listItem.classList.toggle("completed");
        toggleCompletion(taskText, listItem.classList.contains("completed"));
        updateTaskInfo();
    });

    const editButton = createTaskButton("Edit", "edit", () => {
        editTask(listItem, taskSpan, taskText);
    });

    const deleteButton = createTaskButton("Delete", "delete", () => {
        taskList.removeChild(listItem);
        deleteTask(taskText);
        updateTaskInfo();
    });

    appendElements(listItem, taskSpan, taskDeadlineSpan, taskStatusSpan, completeButton, editButton, deleteButton);
    taskList.appendChild(listItem);

    updateTaskInfo();
}

function createTaskElement(elementType, textContent, className) {
    const element = document.createElement(elementType);
    element.textContent = textContent;
    if (className) {
        element.classList.add(className);
    }
    return element;
}

function createTaskButton(textContent, className, onClick) {
    const button = document.createElement("button");
    button.textContent = textContent;
    button.classList.add(className);
    button.addEventListener("click", onClick);
    return button;
}

function appendElements(parent, ...children) {
    children.forEach(child => {
        parent.appendChild(child);
    });
}

function saveTask(taskText, deadline, status, isCompleted = false) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push({ text: taskText, deadline: deadline, status: status, completed: isCompleted });
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach(task => addTask(task.text, task.deadline, task.status, task.completed));
    updateTaskInfo();
}

function deleteTask(taskText) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const updatedTasks = tasks.filter(task => task.text !== taskText);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
}

function toggleCompletion(taskText, isCompleted) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const task = tasks.find(task => task.text === taskText);
    if (task) {
        task.completed = isCompleted;
        updateTaskStatus(taskText, isCompleted);
    }
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateTaskStatus(taskText, isCompleted) {
    const taskElements = document.querySelectorAll("#taskList li");
    taskElements.forEach(taskElement => {
        const taskSpan = taskElement.querySelector("span:first-child");
        if (taskSpan.textContent === taskText) {
            const statusSpan = taskElement.querySelector(".status");
            statusSpan.textContent = isCompleted ? "Completed" : getDefaultStatus(taskText);
        }
    });
}

function getDefaultStatus(taskText) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const task = tasks.find(task => task.text === taskText);
    return task ? task.status : "Pending";

    function editTask(listItem, taskSpan, oldTaskText) {
        const inputTask = createEditableInput(taskSpan.textContent);

        const finishEditing = () => {
            const newTaskText = inputTask.value.trim();

            if (newTaskText === "") {
                alert("Task cannot be empty.");
                return;
            }

            taskSpan.textContent = newTaskText;
            listItem.replaceChild(taskSpan, inputTask);

            updateTaskText(oldTaskText, newTaskText);
        };

        listItem.replaceChild(inputTask, taskSpan);

        inputTask.addEventListener("blur", finishEditing);

        inputTask.focus();
    }

    function createEditableInput(value) {
        const input = document.createElement("input");
        input.type = "text";
        input.value = value;
        return input;
    }

    function updateTaskText(oldTaskText, newTaskText) {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        const task = tasks.find(task => task.text === oldTaskText);
        if (task) {
            task.text = newTaskText;
            localStorage.setItem("tasks", JSON.stringify(tasks));
        }
    }

    function updateTaskInfo() {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        totalTasks.textContent = tasks.length;
        completedTasks.textContent = tasks.filter(task => task.completed).length;
    }

    sortSelect.addEventListener("change", () => {
        const sortBy = sortSelect.value;
        sortTasks(sortBy);
    });

    filterSelect.addEventListener("change", () => {
        const filterBy = filterSelect.value;
        filterTasks(filterBy);
    });

    function sortTasks(sortBy) {
        const tasks = Array.from(taskList.children);
        tasks.sort((a, b) => {
            let aValue, bValue;
            switch (sortBy) {
                case "az":
                    aValue = a.querySelector("span:first-child").textContent.toLowerCase();
                    bValue = b.querySelector("span:first-child").textContent.toLowerCase();
                    return aValue.localeCompare(bValue);
                case "za":
                    aValue = a.querySelector("span:first-child").textContent.toLowerCase();
                    bValue = b.querySelector("span:first-child").textContent.toLowerCase();
                    return bValue.localeCompare(aValue);
                case "deadline-asc":
                    aValue = new Date(a.querySelector(".deadline").textContent);
                    bValue = new Date(b.querySelector(".deadline").textContent);
                    return aValue - bValue;
                case "deadline-desc":
                    aValue = new Date(a.querySelector(".deadline").textContent);
                    bValue = new Date(b.querySelector(".deadline").textContent);
                    return bValue - aValue;
                case "status":
                    aValue = a.querySelector(".status").textContent.toLowerCase();
                    bValue = b.querySelector(".status").textContent.toLowerCase();
                    return aValue.localeCompare(bValue);
                default:
                    return 0;
            }
        });

        tasks.forEach(task => taskList.appendChild(task));
    }

    function filterTasks(filterBy) 
    {
        const tasks = Array.from(taskList.children);
        tasks.forEach(task => {
            const status = task.querySelector(".status").textContent.toLowerCase();
            if (filterBy === "all" || status === filterBy) {
                task.style.display = "flex";
            } else {
                task.style.display = "none";
            }
        });
    }
}
