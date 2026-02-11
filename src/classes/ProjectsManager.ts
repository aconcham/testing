import { IProject, Project } from "./Project"

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
      finishDate: new Date(),
    })
  }

  // Method to create a new project
  newProject(data: IProject) {
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
  private setDetailsPage(project: Project) {
    const detailsPage = document.getElementById("project-details")
    if (!detailsPage) { return }

    /* // Querying elements using custom data attributes (data-*).
    const name = detailsPage.querySelector("[data-project-info='name']")
    if (name) { name.textContent = project.name } */

    const infoElements = detailsPage.querySelectorAll("[data-project-info]")

    infoElements.forEach((el) => {
      const key = el.getAttribute("data-project-info")

      if (key === "initials") {
        el.textContent = project.initials
      } else if (key === "finishDate") {
        el.textContent = project.finishDate.toLocaleDateString()
      } else if (key && key in project) {
        el.textContent = (project as any)[key]
      }
    })
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