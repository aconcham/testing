import { IProject, ProjectStatus, UserRole, IToDo, ToDoStatus } from "./classes/Project"
import { ProjectsManager } from "./classes/ProjectsManager"
import { UsersManager } from "./classes/UsersManager"
import { IUser, UserRole as SystemRole } from "./classes/User"
import { v4 as uuidv4 } from "uuid"

// You are defining a Custom Command.
function showModal(id: string) { // id variable is assigned a value only when the function is called.
  const modal = document.getElementById(id)
  if (modal && modal instanceof HTMLDialogElement) { // Check if this element is specifically a <dialog> tag.
    modal.showModal()
  } else {
    console.warn("The provided modal wasn't found. ID: ", id)
  }
}

function closeModal(id: string) {
  const modal = document.getElementById(id)
  if (modal && modal instanceof HTMLDialogElement) {
    modal.close()
  } else {
    console.warn("The provided modal wasn't found. ID: ", id)
  }
}

const projectsListUI = document.getElementById("projects-list") as HTMLElement // We are telling TypeScript: "Trust me, I know this element exists and it's an HTMLElement."
const projectsManager = new ProjectsManager(projectsListUI)

// This document object is provided by the browser, and its main purpose is to help us interact with the DOM.
const newProjectBtn = document.getElementById("new-project-btn")
if (newProjectBtn) {
  newProjectBtn.addEventListener("click", () => { showModal("new-project-modal") }) // It's a wrapper function. You're telling the button: 'When clicked, execute this function. And inside that function is where we call showModal with its parameters'.
} else {
  console.warn("New projects button was not found") // This is a safety check. If the button isn't found, we log a warning to the console.
}

const cancelBtn = document.getElementById("cancel-btn")
if (cancelBtn) {
  cancelBtn.addEventListener("click", () => { closeModal("new-project-modal") })
} else {
  console.warn("Cancel button was not found")
}

const projectForm = document.getElementById("new-project-form")
if (projectForm && projectForm instanceof HTMLFormElement) { // Safety check to ensure the element is indeed a form.
  projectForm.addEventListener("submit", (e) => {
    e.preventDefault() // Prevents the default form submission behavior (which would reload the page).
    const formData = new FormData(projectForm) // Creates a FormData object from the form, allowing easy access to its fields.

    // Capture the form date in a separate variable
    const dateInput = formData.get("finishDate") as string

    // Define date logic
    // If 'dateInput' has a value, create that specific date.
    // If it's empty (false), create a new date object (defaults to today).
    const finalDate = dateInput ? new Date(dateInput) : new Date()

    const projectData: IProject = {
      name: formData.get("name") as string,
      description: formData.get("description") as string, // Retrieves the value of the "description" field from the form data.
      status: formData.get("status") as ProjectStatus,
      userRole: formData.get("userRole") as UserRole,
      cost: Number(formData.get("cost")),
      progress: Number(formData.get("progress")) / 100,
      // finishDate: new Date(formData.get("finishDate") as string)
      finishDate: finalDate
    }

    // console.log("Description:", formData.get("description")) // Logs the value of the "description" field to the console.
    
    /* const project = new Project(projectData) // Creates a new Project instance using the collected form data.
    console.log(project) // Logs the entire project object to the console. */

    try {
      const project = projectsManager.newProject(projectData) // Uses the ProjectsManager to create and manage the new project.
      console.log(project)
      projectForm.reset() // Resets the form fields to their default values.
      closeModal("new-project-modal") // Closes the modal dialog after form submission.
    } catch (err) {
      alert(err)
    }
  })
} else {
  console.warn("The project form was not found. Check the ID!") // Another safety check for the form element.
}

// --- TO-DO LIST LOGIC ---

const todoForm = document.getElementById("new-todo-form")
if (todoForm && todoForm instanceof HTMLFormElement) {
  todoForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const formData = new FormData(todoForm)

    // 1. Get the project ID from the hidden input field
    const projectId = formData.get("projectId") as string
    const project = projectsManager.getProject(projectId)

    if (project) {
      // 2. Create the task (todo item)
      const todoText = formData.get("text") as string
      const todoDateStr = formData.get("date") as string
      const todoStatus = formData.get("status") as ToDoStatus

      // Basic validation
      if(todoText) {
        const todo: IToDo = {
          id: uuidv4(),
          text: todoText,
          // If no date is provided, default to today. Otherwise, parse the date.
          date: todoDateStr ? new Date(todoDateStr) : new Date(),
          status: todoStatus
        }

        // 3. Add the task to the project list
        project.todoList.push(todo)

        // 4. Update the details view
        projectsManager.setDetailsPage(project)
      }
    }
    todoForm.reset()
    closeModal("new-todo-modal")
  })
}

const closeTodoBtn = document.getElementById("close-todo-modal-btn")
if (closeTodoBtn) {
  closeTodoBtn.addEventListener("click", () => {
    closeModal("new-todo-modal")
  })
}

// ------------------------

// --- NEW CODE FOR USERS ---

const usersListUI = document.getElementById("users-list")
if (usersListUI) {
  const usersManager = new UsersManager(usersListUI)

  // "Add User" button (opens the modal)
  const newUserBtn = document.getElementById("new-user-btn")
  if (newUserBtn) {
    newUserBtn.addEventListener("click", () => {
      showModal("new-user-modal")
    })
  }

  // New User Form
  const userForm = document.getElementById("new-user-form")
  if (userForm && userForm instanceof HTMLFormElement) {
    userForm.addEventListener("submit", (e) => {
      e.preventDefault()
      const formData = new FormData(userForm)

      usersManager.newUser({
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        role: formData.get("role") as SystemRole
      })

      userForm.reset()
      closeModal("new-user-modal")
    })
  }

  // Cancel button on user form
  const closeUserBtn = document.getElementById("close-user-modal-btn")
  if (closeUserBtn) {
    closeUserBtn.addEventListener("click", () => {
      closeModal("new-user-modal")
    })
  }
}

// ---

const exportProjectsBtn = document.getElementById("export-projects-btn")
if (exportProjectsBtn) {
  exportProjectsBtn.addEventListener("click", () => {
    projectsManager.exportToJSON()
  })
}

const importProjectsBtn = document.getElementById("import-projects-btn")
if (importProjectsBtn) {
  importProjectsBtn.addEventListener("click", () => {
    projectsManager.importFromJSON()
  })
}

// const projectsNavBtn = document.getElementById("projects-nav-btn")
// if (projectsNavBtn) {
//   projectsNavBtn.addEventListener("click", () => {
//     const projectsPage = document.getElementById("projects-page")
//     const detailsPage = document.getElementById("project-details")
//     if (projectsPage && detailsPage) {
//       detailsPage.style.display = "none"
//       projectsPage.style.display = "flex"
//     }
//   })
// } else {
//   console.warn("Projects navigation button not found")
// }

// --- NAVIGATION UPDATE (SIDEBAR) ---

const projectsNavBtn = document.getElementById("projects-nav-btn")
const usersNavBtn = document.getElementById("users-nav-btn")

// Pages
const projectsPage = document.getElementById("projects-page")
const usersPage = document.getElementById("users-page")
const detailsPage = document.getElementById("project-details")

// Auxiliary function for clean page changes
function switchPage(pageId: string) {
    if (projectsPage) projectsPage.style.display = "none"
    if (usersPage) usersPage.style.display = "none"
    if (detailsPage) detailsPage.style.display = "none"

    const activePage = document.getElementById(pageId)
    if (activePage) {
        activePage.style.display = "flex"
    }
}

// Event Listeners for the Sidebar
if (projectsNavBtn) {
    projectsNavBtn.addEventListener("click", () => {
        switchPage("projects-page")
    })
}

if (usersNavBtn) {
    usersNavBtn.addEventListener("click", () => {
        switchPage("users-page")
    })
}

// ---

// --- EDIT LOGIC ---

const editProjectForm = document.getElementById("edit-project-form")
if (editProjectForm && editProjectForm instanceof HTMLFormElement) {
  editProjectForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const formData = new FormData(editProjectForm)

    // 1. Get the ID of the project we are editing
    const projectId = formData.get("id") as string
    const project = projectsManager.getProject(projectId)

    if (project) {
      // 2. Update object properties
      project.name = formData.get("name") as string
      project.description = formData.get("description") as string
      project.status = formData.get("status") as ProjectStatus
      project.userRole = formData.get("userRole") as UserRole
      project.cost = Number(formData.get("cost"))
      project.progress = Number(formData.get("progress")) / 100

      const dateInput = formData.get("finishDate") as string
      if (dateInput) {
        project.finishDate = new Date(dateInput)
      }

      // 3. Update the UI (Dashboard Card + Details Page)
      project.setUI() // Refreshes the dashboard card
      projectsManager.setDetailsPage(project) // Refreshes the current details page
    }

    closeModal("edit-project-modal")
  })
}

const closeEditBtn = document.getElementById("close-edit-modal-btn")
if (closeEditBtn) {
  closeEditBtn.addEventListener("click", () => {
    closeModal("edit-project-modal")
  })
}