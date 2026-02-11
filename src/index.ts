import { IProject, ProjectStatus, UserRole } from "./classes/Project"
import { ProjectsManager } from "./classes/ProjectsManager"

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
    const projectData: IProject = {
      name: formData.get("name") as string,
      description: formData.get("description") as string, // Retrieves the value of the "description" field from the form data.
      status: formData.get("status") as ProjectStatus,
      userRole: formData.get("userRole") as UserRole,
      finishDate: new Date(formData.get("finishDate") as string)
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

const backBtn = document.getElementById("back-to-projects-btn")
if (backBtn) {
  backBtn.addEventListener("click", () => {
    const projectsPage = document.getElementById("projects-page")
    const detailsPage = document.getElementById("project-details")
    if (projectsPage && detailsPage) {
      detailsPage.style.display = "none"
      projectsPage.style.display = "flex"
    }
  })
} else {
  console.warn("Back button not found")
}