import { v4 as uuidv4 } from "uuid";

export type UserRole = "admin" | "editor" | "viewer";

export interface IUser {
  name: string;
  email: string;
  role: UserRole;
}

export class User implements IUser {
  // Data / Properties
  name: string;
  email: string;
  role: UserRole;
  id: string;

  // Visual element
  ui!: HTMLDivElement; // TypeScript throws an error because 'this.ui' is not initialized directly in the constructor, and it doesn't detect assignment inside helper methods like 'setUI()'.

  constructor(data: IUser) {
    this.name = data.name;
    this.email = data.email;
    this.role = data.role;
    this.id = uuidv4();
    this.setUI(); // // TypeScript now assumes 'ui' is definitely assigned
  }

  setUI() {
    // Create a row-style container
    this.ui = document.createElement("div");
    this.ui.className = "user-item"; // User-specific CSS class
    this.ui.innerHTML = `
      <div style="display: flex; gap: 15px; align-items: center;">
        <div style="width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: #686868; font-size: 16px; font-weight: 600;">
            ${this.name[0].toUpperCase()}
        </div>
        <div style="display: flex; flex-direction: column;">
            <p style="font-weight: 500; font-size: 14px;">${this.name}</p>
            <p style="color: #969696; font-size: 12px;">${this.email}</p>
        </div>
      </div>
      
      <div style="display: flex; gap: 20px; align-items: center;">
        <p style="padding: 5px 15px; background-color: #3b3c3f; border-radius: 100px; font-size: 12px; text-transform: capitalize;">
            ${this.role}
        </p>
        <span class="material-icons-round delete-user-btn" style="cursor: pointer; color: #c34040;">delete</span>
      </div>
    `;

    // Attach logic to the delete button within this class
    const deleteBtn = this.ui.querySelector(".delete-user-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        // For now, just remove it from the HTML (DOM)
        // (Ideally, call the Manager to remove it from the data list too)
        this.ui.remove();
      });
    }
  }
}
