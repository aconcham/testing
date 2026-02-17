import { IProject, Project, IToDo } from "./Project"
import { v4 as uuidv4 } from "uuid"

export class ProjectsManager {
  list: Project[] = [] // Array to hold Project instances
  ui: HTMLElement // It is the reference to the <div id="projects-list"> in the HTML. The Manager needs to know where to inject the new cards.

  constructor(container: HTMLElement) {
    this.ui = container
    // Create a default project on initialization
    this.newProject({
      name: "Default Project",
      description: "This is just a default app project",
      status: "active",
      userRole: "engineer",
      cost: 10000,
      progress: 0.5,
      finishDate: new Date(),
    })
  }

  // Method to create a new project
  newProject(data: IProject) {
    // If the name is shorter than 5 characters, throw an error and halt execution.
    if (data.name.length < 5) {
      throw new Error("Project name must be at least 5 characters long!")
    }
    
    // Extract all existing names
    const projectNames = this.list.map((project) => {
      return project.name
    })

    // Check if the new name already exists
    const nameInUse = projectNames.includes(data.name)
    // Throw the error
    if (nameInUse) {
      throw new Error(`A project with the name "${data.name}" already exists`)
    }

    const project = new Project(data) // Create a new Project instance
    project.ui.addEventListener("click", () => {
      const projectsPage = document.getElementById("projects-page")
      const detailsPage = document.getElementById("project-details")
      if (!(projectsPage && detailsPage)) { return }
      projectsPage.style.display = "none"
      detailsPage.style.display = "flex"
      this.setDetailsPage(project)
    })
    this.ui.append(project.ui) // Append the project's UI to the manager's UI container
    this.list.push(project) // Add the new project to the list
    return project
  }

  // Private method to set up the project details page
  // Change: from private to public
  public setDetailsPage(project: Project) {
    const detailsPage = document.getElementById("project-details")
    if (!detailsPage) { return }

    /* // Querying elements using custom data attributes (data-*).
    const name = detailsPage.querySelector("[data-project-info='name']")
    if (name) { name.textContent = project.name } */

    // Query all elements containing the 'data-project-info' attribute
    const infoElements = detailsPage.querySelectorAll("[data-project-info]")

    infoElements.forEach((el) => {
      const key = el.getAttribute("data-project-info")

      // Handle each special case
      if (key === "initials") {
        el.textContent = project.initials
        // --- ADD THIS TO MATCH THE COLOR ---
        if (el instanceof HTMLElement) {
          el.style.backgroundColor = project.backgroundColor
        }
        // -----------------------------------
      } else if (key === "cost") {
        el.textContent = `$${project.cost}`
      } else if (key === "progress") {
        const progressPercent = project.progress * 100
        el.textContent = `${progressPercent}%` // Update text content (e.g., "23%")
        if (el instanceof HTMLElement) {
          el.style.width = `${progressPercent}%` // Update the green bar width
        }
      } else if (key === "finishDate") {
        const date = new Date(project.finishDate)
        el.textContent = date.toLocaleDateString("es-PE", { // "en-US"
          dateStyle: "medium",
          timeZone: "UTC"
        })
      } else if (key === "status" || key === "userRole") {
        const value = (project as any)[key] as string
        // Logic: Capitalize first letter + rest of the word
        el.textContent = value.charAt(0).toUpperCase() + value.slice(1)
      } else if (key && key in project) {
        el.textContent = (project as any)[key]
      }
    })

    // --- TO-DO LIST LOGIC ---
    const todoList = document.getElementById("todo-list")
    if (todoList) {
      // 1. Clear the list to prevent duplicates when re-entering
      todoList.innerHTML = ""

      // 2. Iterate through project tasks and render them
      project.todoList.forEach(todo => {
        const todoItem = document.createElement("div")
        todoItem.className = "todo-item"

        // Format date
        const date = new Date(todo.date)
        const dateStr = date.toLocaleDateString("es-PE", { dateStyle: "medium", timeZone: "UTC" })

        todoItem.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center">
          <div style="display: flex; column-gap: 15px; align-items: center;">
            <span class="material-icons-round" style="padding: 10px; background-color: #686868; border-radius: 10px;">construction</span>
            <p>${todo.text}</p>
          </div>
          <p style="text-wrap: nowrap; margin-left: 10px;">${dateStr}</p>
        </div>
        `
        todoList.appendChild(todoItem)
      })
    }

    // --- "ADD TO-DO" BUTTON LOGIC ---
    const addTodoBtn = document.getElementById("add-todo-btn")
    if (addTodoBtn) {
      addTodoBtn.onclick = () => {
        const modal = document.getElementById("new-todo-modal")
        const inputProjectId = document.querySelector("#new-todo-form input[name='projectId']") as HTMLInputElement

        if (modal && modal instanceof HTMLDialogElement && inputProjectId) {
          inputProjectId.value = project.id // Store the current project ID
          modal.showModal()
        }
      }
    }

    // --- NEW BLOCK: Edit Button Logic ---
    const editBtn = document.getElementById("edit-project-btn")
    if (editBtn) {
      // Use 'onclick' to override previous event handlers when switching projects
      editBtn.onclick = () => {
        const modal = document.getElementById("edit-project-modal")
        const form = document.getElementById("edit-project-form")

        if (modal && modal instanceof HTMLDialogElement && form && form instanceof HTMLFormElement) {
          // Populate inputs with current project data
          const nameInput = form.querySelector("[name='name']") as HTMLInputElement
          const descInput = form.querySelector("[name='description']") as HTMLTextAreaElement
          const statusInput = form.querySelector("[name='status']") as HTMLSelectElement
          const roleInput = form.querySelector("[name='userRole']") as HTMLSelectElement
          const costInput = form.querySelector("[name='cost']") as HTMLInputElement
          const progressInput = form.querySelector("[name='progress']") as HTMLInputElement
          const dateInput = form.querySelector("[name='finishDate']") as HTMLInputElement
          const idInput = form.querySelector("[name='id']") as HTMLInputElement

          nameInput.value = project.name
          descInput.value = project.description
          statusInput.value = project.status
          roleInput.value = project.userRole
          costInput.value = project.cost.toString()
          progressInput.value = (project.progress * 100).toString()
          idInput.value = project.id // Very important!

          // Date formatting for input type="date" (YYYY-MM-DD)
          const date = new Date(project.finishDate)
          const year = date.getFullYear()
          const month = (date.getMonth() + 1).toString().padStart(2, '0')
          const day = date.getDate().toString().padStart(2, '0')
          dateInput.value = `${year}-${month}-${day}`

          // Show the modal
          modal.showModal()
        }
      }
    }
  }

  // Method to get a project by its ID
  getProject(id: string) {
    const project = this.list.find((project) => {
      return project.id === id
    })
    return project
  }

  // Method to delete a project by its ID
  deleteProject(id: string) {
    const project = this.getProject(id)
    if (!project) { return } // If the project doesn't exist, exit the method
    project.ui.remove(); // Remove the project's UI from the DOM
    // Filter out the deleted project from the list
    const remaining = this.list.filter((project) => {
      return project.id !== id
    })
    this.list = remaining; // Update the list to only include remaining projects
  }

  exportToJSON(fileName: string = "projects") {
    // 1. Serialization (Converting Objects to Strings)
    const json = JSON.stringify(this.list, null, 2)
    // 2. Creating a Blob (Binary Large Object)
    const blob = new Blob([json], { type: "application/json" })
    // 3. Creating a Object URL
    const url = URL.createObjectURL(blob)
    // 4. The "Invisible Link" Trick
    const a = document.createElement("a") // Create an <a> (anchor) element
    a.href = url; // Attach the Blob URL to the link
    a.download = fileName // Set the filename for the download
    a.click(); // Simulate a human click
    // 5. Cleanup
    URL.revokeObjectURL(url) // Revoke the URL to free up memory
  }

  importFromJSON() {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "application/json"
    const reader = new FileReader()
    reader.addEventListener("load", () => {
      const json = reader.result
      if (!json) { return }
      const projects: IProject[] = JSON.parse(json as string)
      for (const project of projects) {
        try {
          this.newProject(project)
        } catch (error) {
          // Ignore errors (e.g., duplicate project names)
        }
      }
    })
    input.addEventListener("change", () => {
      const filesList = input.files
      if (!filesList) { return }
      reader.readAsText(filesList[0])
    })
    input.click()
  }
}