
const API_URL = "http://127.0.0.1:5000/api";

// AUTH ELEMENTS
const authSection = document.getElementById("authSection");
const appSection = document.getElementById("appSection");
const authForm = document.getElementById("authForm");
const authTitle = document.getElementById("authTitle");
const authSubmitBtn = document.getElementById("authSubmitBtn");
const authMessage = document.getElementById("authMessage");
const authSwitch = document.getElementById("authSwitch");
const switchAuthBtn = document.getElementById("switchAuthBtn");
const usernameGroup = document.getElementById("usernameGroup");
const welcomeUser = document.getElementById("welcomeUser");
const logoutBtn = document.getElementById("logoutBtn");

// RESOURCE ELEMENTS
const loadResourcesBtn = document.getElementById("loadResourcesBtn");
const resourcesContainer = document.getElementById("resourcesContainer");
const resourceForm = document.getElementById("resourceForm");
const formMessage = document.getElementById("formMessage");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

let isRegisterMode = false;
let allResources = [];


// --------------------------------
// SWITCH LOGIN / REGISTER
// --------------------------------

switchAuthBtn.addEventListener("click", () => {
    isRegisterMode = !isRegisterMode;

    authTitle.textContent = isRegisterMode
        ? "Create your account"
        : "Sign in to DevConnect";

    authSubmitBtn.textContent = isRegisterMode
        ? "Create account"
        : "Sign in";

    usernameGroup.hidden = !isRegisterMode;

    document.getElementById("username").required = isRegisterMode;

    authMessage.textContent = "";

    authSwitch.replaceChildren();

    const text = document.createTextNode(
        isRegisterMode
            ? "Already have an account? "
            : "Don't have an account? "
    );

    const button = document.createElement("button");
    button.type = "button";
    button.id = "switchAuthBtn";
    button.textContent = isRegisterMode ? "Login" : "Register";

    button.addEventListener("click", () => {
        switchAuthBtn.click();
    });

    authSwitch.append(text, button);
});


// --------------------------------
// REGISTER AND LOGIN
// --------------------------------

authForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    authMessage.textContent = "Please wait...";
    authSubmitBtn.disabled = true;

    try {
        const endpoint = isRegisterMode ? "/register" : "/login";

        const body = isRegisterMode
            ? { username, email, password }
            : { email, password };

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Authentication failed");
        }

        if (isRegisterMode) {
            authMessage.textContent =
                "Registration successful! Please log in.";

            authForm.reset();
            switchAuthBtn.click();
            authMessage.textContent =
                "Registration successful! Please log in.";

        } else {
            // Demonstration-only browser login state.
            // Not a secure authentication session.
            sessionStorage.setItem(
                "devconnectUser",
                JSON.stringify(result.user)
            );

            showApplication(result.user);
        }

    } catch (error) {
        console.error(error);
        authMessage.textContent = error.message;

    } finally {
        authSubmitBtn.disabled = false;
    }
});


// --------------------------------
// SHOW APPLICATION
// --------------------------------

function showApplication(user) {
    authSection.hidden = true;
    appSection.hidden = false;

    welcomeUser.textContent = `Welcome, ${user.username}!`;

    loadResources();
}


// --------------------------------
// LOGOUT
// --------------------------------

logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("devconnectUser");

    appSection.hidden = true;
    authSection.hidden = false;

    authForm.reset();
    authMessage.textContent = "You have logged out.";
});


// --------------------------------
// LOAD RESOURCES
// --------------------------------

async function loadResources() {
    resourcesContainer.innerHTML = '<p class="empty-state">Loading resources...</p>';

    try {
        const response = await fetch(`${API_URL}/resources`);

        if (!response.ok) {
            throw new Error("Failed to fetch resources");
        }

        allResources = await response.json();

        updateCategoryFilter();
        filterResources();

    } catch (error) {
        console.error(error);
        resourcesContainer.innerHTML = '<p class="empty-state">Unable to load resources.</p>';
    }
}


// --------------------------------
// CATEGORY FILTER
// --------------------------------

function updateCategoryFilter() {
    const selectedCategory = categoryFilter.value;

    const categories = [
        ...new Set(
            allResources
                .map(resource => resource.category)
                .filter(Boolean)
        )
    ];

    categoryFilter.replaceChildren();

    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All Categories";
    categoryFilter.appendChild(allOption);

    categories.sort().forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    categoryFilter.value = categories.includes(selectedCategory)
        ? selectedCategory
        : "all";
}


// --------------------------------
// SEARCH AND FILTER
// --------------------------------

function filterResources() {
    const searchText = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryFilter.value;

    const filteredResources = allResources.filter(resource => {
        const title = (resource.title || "").toLowerCase();
        const category = (resource.category || "").toLowerCase();
        const description = (resource.description || "").toLowerCase();

        const matchesSearch =
            title.includes(searchText) ||
            category.includes(searchText) ||
            description.includes(searchText);

        const matchesCategory =
            selectedCategory === "all" ||
            resource.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    displayResources(filteredResources);
}


// --------------------------------
// DISPLAY RESOURCES
// --------------------------------

function displayResources(resources) {
    resourcesContainer.replaceChildren();

    if (resources.length === 0) {
        const emptyState = document.createElement("p");
        emptyState.className = "empty-state";
        emptyState.textContent = "No matching resources found.";
        resourcesContainer.appendChild(emptyState);
        return;
    }

    resources.forEach(resource => {
        const card = document.createElement("div");
        card.className = "resource-card";

        const title = document.createElement("h3");
        title.textContent = resource.title;

        const category = document.createElement("p");
        category.className = "resource-category";
        category.textContent = resource.category;

        const description = document.createElement("p");
        description.className = "resource-description";
        description.textContent =
            resource.description || "No description available.";

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit-btn";
        editButton.addEventListener("click", () => editResource(resource));

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.addEventListener("click", () => deleteResource(resource));

        const actions = document.createElement("div");
        actions.className = "card-actions";
        actions.append(editButton, deleteButton);

        card.append(
            title,
            category,
            description,
            actions
        );

        resourcesContainer.appendChild(card);
    });
}


// --------------------------------
// ADD RESOURCE
// --------------------------------

async function addResource(event) {
    event.preventDefault();

    const title = document.getElementById("title").value.trim();
    const category = document.getElementById("category").value.trim();
    const description = document.getElementById("description").value.trim();

    if (!title || !category) {
        formMessage.textContent = "Title and category are required.";
        return;
    }

    formMessage.textContent = "Adding resource...";

    try {
        const response = await fetch(`${API_URL}/resources`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title, category, description })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Unable to add resource");
        }

        formMessage.textContent = "Resource added successfully!";
        resourceForm.reset();

        await loadResources();

    } catch (error) {
        console.error(error);
        formMessage.textContent = error.message;
    }
}


// --------------------------------
// EDIT RESOURCE
// --------------------------------

async function editResource(resource) {
    const title = prompt("Enter new title:", resource.title);
    if (title === null) return;

    const category = prompt("Enter new category:", resource.category);
    if (category === null) return;

    const description = prompt(
        "Enter new description:",
        resource.description || ""
    );
    if (description === null) return;

    if (!title.trim() || !category.trim()) {
        alert("Title and category are required.");
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/resources/${resource.id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: title.trim(),
                    category: category.trim(),
                    description: description.trim()
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Unable to update resource");
        }

        alert("Resource updated successfully!");
        await loadResources();

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}


// --------------------------------
// DELETE RESOURCE
// --------------------------------

async function deleteResource(resource) {
    const confirmed = confirm(
        `Are you sure you want to delete "${resource.title}"?`
    );

    if (!confirmed) return;

    try {
        const response = await fetch(
            `${API_URL}/resources/${resource.id}`,
            { method: "DELETE" }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Unable to delete resource");
        }

        alert("Resource deleted successfully!");
        await loadResources();

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}


// --------------------------------
// EVENT LISTENERS
// --------------------------------

loadResourcesBtn.addEventListener("click", loadResources);
resourceForm.addEventListener("submit", addResource);

searchInput.addEventListener("input", filterResources);
categoryFilter.addEventListener("change", filterResources);


// --------------------------------
// RESTORE DEMO LOGIN STATE
// --------------------------------

const savedUser = sessionStorage.getItem("devconnectUser");

if (savedUser) {
    try {
        showApplication(JSON.parse(savedUser));
    } catch {
        sessionStorage.removeItem("devconnectUser");
    }
}
