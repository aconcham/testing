import { v4 as uuidv4 } from "uuid"

export type ProjectStatus = "active" | "paused" | "completed" | "cancelled"
export type UserRole = "engineer" | "architect" | "manager" | "supervisor"

// An Interface is like a contract or a data schema. It defines what properties an object MUST have to be considered a valid project. The convention is to use a capital 'I' prefix (e.g., IProject).
export interface IProject {
  name: string
  description: string
  status: ProjectStatus
  userRole: UserRole
  cost: number
  progress: number
  finishDate: Date
}

export class Project implements IProject { // By convention, classes always start with a capital letter (PascalCase).
  // To satisfy IProject
  name: string
  description: string
  status: ProjectStatus
  userRole: UserRole
  finishDate: Date

  // Class internals
  ui!: HTMLDivElement
  cost: number
  progress: number
  id: string
  backgroundColor: string // Property to store the color

  // New method to dynamically get initials.
  get initials() {
    const words = this.name.split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return this.name.substring(0, 2).toUpperCase();
  }

  // Properties: Declares the data structure for each project. Defaults to undefined.
  constructor(data: IProject) { // Constructor: A special method that runs when a new object is created from this class.

    // Project data definition
    this.name = data.name // "Take the 'name' value from the data package and save it into the 'name' property of this specific new object."
    this.description = data.description
    this.status = data.status
    this.userRole = data.userRole
    this.cost = data.cost
    this.progress = data.progress
    this.finishDate = data.finishDate

    /* for (const key in data) {
      this[key] = data[key]
    } */

    this.id = uuidv4() // Generates a unique identifier for the project using the uuid library.
    this.backgroundColor = this.getRandomColor() // Generate the color when creating the project
    this.setUI() // Calls the setUI method to create the UI representation of the project.
  }

  // Helper method to get a random color
  getRandomColor() {
    const colors = [
      "#CA8134", // Orange (Original)
      "#8739FA", // Violet
      "#396AFA", // Royal Blue
      "#FA3939", // Soft Red
      "#2E7D32", // Forest Green
      "#9B870C", // Dark Yellow
      "#E62E91"  // Pink
    ]
    const randomIndex = Math.floor(Math.random() * colors.length)
    return colors[randomIndex]
  }

  // Creates the project card UI
  setUI() {
    if (this.ui) { return } // If the UI element already exists, do nothing.
    this.ui = document.createElement("div") // Creates a new <div> element to represent the project in the UI.
    this.ui.className = "project-card" // Assigns a CSS class for styling.
    // Sets the inner HTML of the project card using template literals to insert project data.
    this.ui.innerHTML = `
      <div class="card-header">
        <p style="background-color: ${this.backgroundColor}; padding: 10px; border-radius: 8px; aspect-ratio: 1;">
          ${this.initials}
        </p>
        <div>
          <h5>${this.name}</h5>
          <p>${this.description}</p>
        </div>
      </div>
      <div class="card-content">
        <div class="card-property">
          <p style="color: #969696;">Status</p>
          <p style="text-transform: capitalize;">${this.status}</p>
        </div>
        <div class="card-property">
          <p style="color: #969696;">Role</p>
          <p style="text-transform: capitalize;">${this.userRole}</p>
        </div>
        <div class="card-property">
          <p style="color: #969696;">Cost</p>
          <p>$${this.cost}</p>
        </div>
        <div class="card-property">
          <p style="color: #969696;">Estimated Progress</p>
          <p>${this.progress * 100}%</p>
        </div>
      </div>`
  }
}