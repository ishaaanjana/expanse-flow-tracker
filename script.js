/**
 * ExpenseFlow - Core Application Logic
 * Implements SPA Router, State Store, SVG Charting Engine, Features logic.
 */

// ==========================================
// 1. STATE MANAGER & INITIAL STORAGE MOCK
// ==========================================

const MOCK_DATA = {
  users: [
    {
      id: "usr-1",
      name: "Vidhan Jain",
      email: "vidhan.jain@gmail.com",
      college: "Parul University",
      password: "password123",
      role: "customer",
      walletBalance: 3420,
      createdAt: "2026-07-01T00:00:00.000Z",
      isBlocked: false
    },
    {
      id: "usr-admin",
      name: "Admin Manager",
      email: "admin@expenseflow.com",
      college: "System Central",
      password: "adminpassword",
      role: "admin",
      createdAt: "2026-07-01T00:00:00.000Z",
      isBlocked: false
    }
  ],
  currentUser: {
    id: "usr-1",
    name: "Vidhan Jain",
    email: "vidhan.jain@gmail.com",
    college: "Parul University",
    role: "customer",
    isAuthenticated: true
  },
  expenses: [
    { id: "exp-1", userId: "usr-1", date: "2026-07-01", category: "Books", description: "Reference books for Semester 3", amount: 1200 },
    { id: "exp-2", userId: "usr-1", date: "2026-07-02", category: "Food", description: "Hostel cafeteria lunch", amount: 180 },
    { id: "exp-3", userId: "usr-1", date: "2026-07-02", category: "Travel", description: "Metro smart card recharge", amount: 200 },
    { id: "exp-4", userId: "usr-1", date: "2026-07-03", category: "Entertainment", description: "Movie ticket with friends", amount: 350 },
    { id: "exp-5", userId: "usr-1", date: "2026-07-03", category: "Food", description: "Maggi & Chai session", amount: 74 },
    { id: "exp-6", userId: "usr-1", date: "2026-07-04", category: "Miscellaneous", description: "Stationery kit purchase", amount: 150 }
  ],
  budgets: {
    "usr-1": {
      monthly: 8000,
      daily: 250,
      weekly: 1800,
      semester: 45000
    }
  },
  savings: [
    { id: "save-1", userId: "usr-1", name: "Coding Laptop", targetAmount: 45000, currentSaved: 12000, date: "2026-12-15", category: "Laptop", completed: false },
    { id: "save-2", userId: "usr-1", name: "Manali College Trip", targetAmount: 8000, currentSaved: 3500, date: "2026-10-10", category: "Trip", completed: false }
  ],
  udhaar: [
    { id: "udh-1", userId: "usr-1", friend: "Kabir Verma", type: "lent", amount: 500, date: "2026-07-15", status: "pending" },
    { id: "udh-2", userId: "usr-1", friend: "Riya Sen", type: "borrowed", amount: 250, date: "2026-07-10", status: "pending" },
    { id: "udh-3", userId: "usr-1", friend: "Siddharth Goel", type: "lent", amount: 300, date: "2026-06-25", status: "paid" }
  ],
  reminders: [
    { id: "rem-1", userId: "usr-1", title: "Hostel Room Rent", amount: 4500, date: "2026-07-10", notified: false },
    { id: "rem-2", userId: "usr-1", title: "Semester Exam Fee", amount: 1500, date: "2026-07-20", notified: false }
  ],
  chaiMaggi: {
    "usr-1": {
      chaiCount: 22,
      maggiCount: 14,
      lastUpdated: "2026-07-04"
    }
  },
  notifications: [
    { id: "notif-1", userId: "usr-1", title: "Budget Warning", body: "You have used 24% of your Monthly Budget.", time: "10 mins ago", read: false },
    { id: "notif-2", userId: "usr-1", title: "Reminder Overdue", body: "Rent payment due in 6 days.", time: "1 hour ago", read: false }
  ],
  services: [
    { id: "srv-1", name: "Financial Health Audit", description: "Get a comprehensive analysis of your expenses, pocket money utilization, and personalized saving tips.", price: 199, category: "Audit" },
    { id: "srv-2", name: "Custom Monthly Budget Plan", description: "Let our smart algorithm automatically distribute your pocket money based on custom goals and college expenses.", price: 99, category: "Budgeting" },
    { id: "srv-3", name: "Udhaar Auto-Reminder Bot", description: "Enable automated email reminders to friends who owe you money, directly from your ledger.", price: 149, category: "Automation" },
    { id: "srv-4", name: "Premium Bill Splitter Hub", description: "Get multi-group bill splitting, split history logs, and instant WhatsApp split notification templates.", price: 299, category: "Premium Utility" },
    { id: "srv-5", name: "Chai & Maggi Optimization Plan", description: "A structured lifestyle expense strategy designed specifically to reduce street food spends by 40%.", price: 49, category: "Strategy" }
  ],
  orders: [
    { id: "ord-1", userId: "usr-1", serviceId: "srv-1", price: 199, status: "completed", date: "2026-07-02T10:00:00.000Z", notes: "Audit complete. We recommend shifting 15% of your Shopping expenses to savings." },
    { id: "ord-2", userId: "usr-1", serviceId: "srv-2", price: 99, status: "pending", date: "2026-08-19T11:00:00.000Z", notes: "Mess expenses are high, request assistance." }
  ],
  activities: [
    { id: "act-1", userId: "usr-1", type: "expense", action: "Logged Expense", details: "Metro smart card recharge (₹200.00)", timestamp: "2026-08-19T10:30:00.000Z" },
    { id: "act-2", userId: "usr-1", type: "order", action: "Purchased Service", details: "Ordered Custom Monthly Budget Plan", timestamp: "2026-08-19T11:00:00.000Z" }
  ],
  settings: {
    "usr-1": {
      darkTheme: false,
      soundAlerts: true
    }
  },
  cookieConsent: false
};

class AppStore {
  constructor() {
    this.data = MOCK_DATA;
    this.undoStack = [];
    this.load();
  }

  load() {
    const saved = localStorage.getItem("expense_flow_store");
    if (saved) {
      try {
        let loadedData = JSON.parse(saved);
        
        // Upgrade database to multi-user relational schema if needed
        if (!loadedData.users) {
          console.log("Migrating database to multi-user schema...");
          const defaultUser = {
            id: "usr-1",
            name: loadedData.currentUser ? (loadedData.currentUser.name || "Vidhan Jain") : "Vidhan Jain",
            email: loadedData.currentUser ? (loadedData.currentUser.email || "vidhan.jain@gmail.com") : "vidhan.jain@gmail.com",
            college: loadedData.currentUser ? (loadedData.currentUser.college || "Parul University") : "Parul University",
            password: "password123",
            role: "customer",
            walletBalance: 3420,
            createdAt: new Date().toISOString(),
            isBlocked: false
          };

          const adminUser = {
            id: "usr-admin",
            name: "Admin Manager",
            email: "admin@expenseflow.com",
            college: "System Central",
            password: "adminpassword",
            role: "admin",
            createdAt: new Date().toISOString(),
            isBlocked: false
          };

          const migratedData = {
            users: [defaultUser, adminUser],
            currentUser: loadedData.currentUser && loadedData.currentUser.isAuthenticated ? {
              id: "usr-1",
              name: defaultUser.name,
              email: defaultUser.email,
              college: defaultUser.college,
              role: "customer",
              isAuthenticated: true
            } : null,
            expenses: [],
            budgets: {},
            savings: [],
            udhaar: [],
            reminders: [],
            chaiMaggi: {},
            notifications: [],
            services: MOCK_DATA.services,
            orders: MOCK_DATA.orders,
            activities: MOCK_DATA.activities,
            settings: {},
            cookieConsent: loadedData.cookieConsent || false
          };

          if (Array.isArray(loadedData.expenses)) {
            migratedData.expenses = loadedData.expenses.map(e => ({ ...e, userId: "usr-1" }));
          }
          if (Array.isArray(loadedData.savings)) {
            migratedData.savings = loadedData.savings.map(s => ({ ...s, userId: "usr-1" }));
          }
          if (Array.isArray(loadedData.udhaar)) {
            migratedData.udhaar = loadedData.udhaar.map(u => ({ ...u, userId: "usr-1" }));
          }
          if (Array.isArray(loadedData.reminders)) {
            migratedData.reminders = loadedData.reminders.map(r => ({ ...r, userId: "usr-1" }));
          }
          if (Array.isArray(loadedData.notifications)) {
            migratedData.notifications = loadedData.notifications.map(n => ({ ...n, userId: "usr-1" }));
          }
          
          if (loadedData.budgets) {
            migratedData.budgets["usr-1"] = loadedData.budgets;
          } else {
            migratedData.budgets["usr-1"] = { monthly: 8000, daily: 250, weekly: 1800, semester: 45000 };
          }
          
          if (loadedData.chaiMaggi) {
            migratedData.chaiMaggi["usr-1"] = loadedData.chaiMaggi;
          } else {
            migratedData.chaiMaggi["usr-1"] = { chaiCount: 22, maggiCount: 14, lastUpdated: "2026-07-04" };
          }
          
          if (loadedData.settings) {
            migratedData.settings["usr-1"] = loadedData.settings;
          } else {
            migratedData.settings["usr-1"] = { darkTheme: false, soundAlerts: true };
          }

          this.data = migratedData;
          this.save();
        } else {
          this.data = loadedData;
          if (!this.data.services) this.data.services = MOCK_DATA.services;
          if (!this.data.orders) this.data.orders = MOCK_DATA.orders;
          if (!this.data.activities) this.data.activities = MOCK_DATA.activities;
          this.save();
        }
      } catch (e) {
        console.error("Failed to parse LocalStorage data. Resetting...", e);
        this.data = MOCK_DATA;
        this.save();
      }
    } else {
      this.data = MOCK_DATA;
      this.save();
    }
  }

  save() {
    localStorage.setItem("expense_flow_store", JSON.stringify(this.data));
  }

  pushUndo(actionName, backupState) {
    this.undoStack.push({ actionName, state: JSON.stringify(backupState) });
    if (this.undoStack.length > 5) this.undoStack.shift();
  }

  undo() {
    if (this.undoStack.length === 0) return false;
    const { actionName, state } = this.undoStack.pop();
    this.data = JSON.parse(state);
    this.save();
    return actionName;
  }
}

const store = new AppStore();

// ==========================================
// 1.5 USER PROFILE AND DATABASE HELPERS
// ==========================================

function getCurUserId() {
  return store.data.currentUser ? store.data.currentUser.id : null;
}

function getCurUserBudget() {
  const uid = getCurUserId();
  if (!uid) return { monthly: 8000, daily: 250, weekly: 1800, semester: 45000 };
  if (!store.data.budgets[uid]) {
    store.data.budgets[uid] = { monthly: 8000, daily: 250, weekly: 1800, semester: 45000 };
    store.save();
  }
  return store.data.budgets[uid];
}

function getCurUserChaiMaggi() {
  const uid = getCurUserId();
  if (!uid) return { chaiCount: 0, maggiCount: 0, lastUpdated: "" };
  if (!store.data.chaiMaggi[uid]) {
    store.data.chaiMaggi[uid] = { chaiCount: 22, maggiCount: 14, lastUpdated: "2026-07-04" };
    store.save();
  }
  return store.data.chaiMaggi[uid];
}

function getCurUserSettings() {
  const uid = getCurUserId();
  if (!uid) return { darkTheme: false, soundAlerts: true };
  if (!store.data.settings[uid]) {
    store.data.settings[uid] = { darkTheme: false, soundAlerts: true };
    store.save();
  }
  return store.data.settings[uid];
}

function updateUserSessionUI() {
  if (!store.data.currentUser || !store.data.currentUser.isAuthenticated) return;
  const user = store.data.currentUser;
  const name = user.name || "User";
  const college = user.college || "";
  const role = user.role || "customer";

  const nameLbl = document.getElementById("user-name-lbl");
  if (nameLbl) nameLbl.textContent = name;

  const collegeLbl = document.getElementById("user-college-lbl");
  if (collegeLbl) collegeLbl.textContent = (role === "admin") ? "System Administrator" : (college || "Campus Student");

  const avatarLbl = document.getElementById("user-avatar-lbl");
  if (avatarLbl) avatarLbl.textContent = name.charAt(0).toUpperCase();

  const profileName = document.getElementById("settings-profile-name");
  if (profileName) profileName.value = name;
  const profileCollege = document.getElementById("settings-profile-college");
  if (profileCollege) profileCollege.value = college;
}

function updateUserAvatarLabels() {
  updateUserSessionUI();
}

function getCurUserExpenses() {
  const uid = getCurUserId();
  return store.data.expenses.filter(e => e.userId === uid);
}

function getCurUserSavings() {
  const uid = getCurUserId();
  return store.data.savings.filter(s => s.userId === uid);
}

function getCurUserUdhaar() {
  const uid = getCurUserId();
  return store.data.udhaar.filter(u => u.userId === uid);
}

function getCurUserReminders() {
  const uid = getCurUserId();
  return store.data.reminders.filter(r => r.userId === uid);
}

function getCurUserNotifications() {
  const uid = getCurUserId();
  return (store.data.notifications || []).filter(n => n.userId === uid || n.userId === "all");
}

function logActivity(userId, type, action, details) {
  const newAct = {
    id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: userId || "system",
    type,
    action,
    details,
    timestamp: new Date().toISOString()
  };
  if (!store.data.activities) store.data.activities = [];
  store.data.activities.push(newAct);
  store.save();
}


// ==========================================
// 2. ROUTER & PAGE NAVIGATOR SYSTEM
// ==========================================

const APP_VIEWS = [
  "dashboard",
  "expense",
  "budget",
  "savings",
  "udhaar",
  "splitter",
  "shop",
  "my-requests",
  "reports",
  "settings",
  
  // Admin views
  "admin-dashboard",
  "admin-users",
  "admin-orders",
  "admin-activities",
  "admin-broadcast",
  "admin-settings",
  
  "404"
];

function checkAuthRedirect() {
  const hash = window.location.hash.replace("#", "") || "home";

  if (store.data.currentUser && store.data.currentUser.isAuthenticated) {
    document.getElementById("landing-page").style.display = "none";
    document.getElementById("app-workspace").style.display = "flex";

    const role = store.data.currentUser.role;
    updateUserSessionUI();

    if (role === 'admin') {
      document.getElementById("sidebar-customer-nav").style.display = "none";
      document.getElementById("sidebar-admin-nav").style.display = "block";

      const adminViews = ["admin-dashboard", "admin-users", "admin-orders", "admin-activities", "admin-broadcast", "admin-settings", "settings"];
      let targetView = hash;
      if (hash === "home" || hash === "" || !adminViews.includes(hash)) {
        targetView = "admin-dashboard";
        if (window.location.hash !== "#admin-dashboard") {
          window.location.hash = "#admin-dashboard";
        }
      }
      activateView(targetView);
    } else {
      document.getElementById("sidebar-customer-nav").style.display = "block";
      document.getElementById("sidebar-admin-nav").style.display = "none";

      const customerViews = ["dashboard", "expense", "budget", "savings", "udhaar", "splitter", "shop", "my-requests", "reports", "settings"];
      let targetView = hash;
      if (hash === "home" || hash === "" || !customerViews.includes(hash)) {
        targetView = "dashboard";
        if (window.location.hash !== "#dashboard") {
          window.location.hash = "#dashboard";
        }
      }
      activateView(targetView);
    }
  } else {
    document.getElementById("app-workspace").style.display = "none";
    document.getElementById("landing-page").style.display = "block";

    if (hash !== "home" && APP_VIEWS.includes(hash)) {
      window.location.hash = "#home";
      showToast("Authentication Required", "Please log in to access the workspace.", "warning");
    }
  }
}

function navigateTo(viewId) {
  window.location.hash = `#${viewId}`;
}

function activateView(viewId) {
  // Synchronize active user labels and avatars immediately across all views
  updateUserSessionUI();

  // Hide all sections
  document.querySelectorAll(".view-section").forEach(sec => sec.classList.remove("active"));
  document.querySelectorAll(".sidebar-link").forEach(link => link.classList.remove("active"));

  const section = document.getElementById(`view-${viewId}`);
  if (section) {
    section.classList.add("active");
  }

  const navLink = document.getElementById(`nav-${viewId}`);
  if (navLink) {
    navLink.classList.add("active");
  }

  // Set View Title
  const titleMap = {
    dashboard: "Student Dashboard",
    expense: "Expense Tracker Ledger",
    budget: "Monthly & Semester Budget",
    savings: "Smart Savings Goals",
    udhaar: "Udhaar Hisab Ledger",
    splitter: "Group Bill Splitter",
    shop: "Services & Products Shop",
    "my-requests": "My Service Requests",
    reports: "Interactive Financial Reports",
    settings: "Workspace Settings",
    
    // Admin Views
    "admin-dashboard": "System Administration Overview",
    "admin-users": "Student User Directory",
    "admin-orders": "Student Service Requests Queue",
    "admin-activities": "System Activity History Logs",
    "admin-broadcast": "Broadcast Alerts & Notifications",
    "admin-settings": "Global System Settings"
  };

  document.getElementById("current-view-title").textContent = titleMap[viewId] || "Page Not Found";

  // Close Sidebar on Mobile navigation
  toggleSidebar(false);

  // Trigger sub-view redraws
  if (viewId === "dashboard") {
    renderDashboard();
  } else if (viewId === "expense") {
    renderExpenseTracker();
  } else if (viewId === "budget") {
    renderBudgetPlanner();
  } else if (viewId === "savings") {
    renderSavingsGoals();
  } else if (viewId === "udhaar") {
    renderUdhaarLedger();
  } else if (viewId === "splitter") {
    renderBillSplitter();
  } else if (viewId === "shop") {
    renderServicesShop();
  } else if (viewId === "my-requests") {
    renderMyRequests();
  } else if (viewId === "reports") {
    generateReport();
  } else if (viewId === "settings") {
    renderSettings();
  } else if (viewId === "admin-dashboard") {
    renderAdminDashboard();
  } else if (viewId === "admin-users") {
    renderAdminUsers();
  } else if (viewId === "admin-orders") {
    renderAdminOrders();
  } else if (viewId === "admin-activities") {
    renderAdminActivities();
  } else if (viewId === "admin-broadcast") {
    renderAdminBroadcast();
  } else if (viewId === "admin-settings") {
    renderAdminSettings();
  }

  // Reset scroll
  document.getElementById("main-view-container").scrollTop = 0;
}

window.addEventListener("hashchange", checkAuthRedirect);
window.addEventListener("DOMContentLoaded", () => {
  // Check theme load if user is logged in
  if (store.data.currentUser && store.data.currentUser.isAuthenticated) {
    const settings = getCurUserSettings();
    if (settings && settings.darkTheme) {
      document.documentElement.setAttribute("data-theme", "dark");
      document.getElementById("theme-icon-sun").style.display = "none";
      document.getElementById("theme-icon-moon").style.display = "block";
      const settingsToggle = document.getElementById("settings-theme-toggle");
      if (settingsToggle) settingsToggle.checked = true;
    }
  }

  // Cookie Consent Load
  if (!store.data.cookieConsent) {
    setTimeout(() => {
      document.getElementById("cookie-consent").classList.add("active");
    }, 1500);
  }

  // Initial router check
  checkAuthRedirect();

  // Add landing page navbar shadow on scroll
  window.addEventListener("scroll", () => {
    const nav = document.querySelector(".landing-nav");
    if (nav) {
      if (window.scrollY > 50) {
        nav.classList.add("scrolled");
      } else {
        nav.classList.remove("scrolled");
      }
    }

    // Back to top indicator check
    const backToTopBtn = document.getElementById("back-to-top");
    if (backToTopBtn) {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add("active");
      } else {
        backToTopBtn.classList.remove("active");
      }
    }
  });
});

function toggleSidebar(open) {
  const sidebar = document.getElementById("app-sidebar");
  if (sidebar) {
    if (open) sidebar.classList.add("active");
    else sidebar.classList.remove("active");
  }
}

// ==========================================
// 3. CORE ANIMATION & CUSTOM TOAST SYSTEM
// ==========================================

function showToast(title, message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  let iconMarkup = "";
  if (type === "success") {
    iconMarkup = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
  } else if (type === "danger") {
    iconMarkup = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>';
  } else if (type === "warning") {
    iconMarkup = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>';
  } else {
    iconMarkup = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>';
  }

  toast.innerHTML = `
    <div class="toast-icon">${iconMarkup}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
    </button>
  `;

  container.appendChild(toast);

  // Auto remove after 4.5 seconds
  setTimeout(() => {
    toast.classList.add("removing");
    setTimeout(() => toast.remove(), 400);
  }, 4500);
}

function showUndoToast(actionName, message) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast toast-info";

  toast.innerHTML = `
    <div class="toast-icon">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
    </div>
    <div class="toast-content">
      <div class="toast-title">Transaction Removed</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="btn btn-sm btn-primary" onclick="triggerUndoAction(this)" style="padding: 4px 8px; font-size: 0.75rem; margin-right: 8px;">Undo</button>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
    </button>
  `;

  container.appendChild(toast);
}

function triggerUndoAction(btnElement) {
  const undone = store.undo();
  if (undone) {
    showToast("Undo Successful", `The action "${undone}" has been reverted.`, "success");
    checkAuthRedirect(); // Refresh view
  } else {
    showToast("Undo Failed", "No undo actions found in memory stack.", "danger");
  }
  btnElement.parentElement.remove();
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// 4. USER AUTHENTICATION & FORM CHECKERS
// ==========================================

function openAuthModal(tabName) {
  document.getElementById("auth-modal-overlay").classList.add("active");
  switchAuthTab(tabName);
}

function closeAuthModal(event) {
  if (event === null || event.target === document.getElementById("auth-modal-overlay")) {
    document.getElementById("auth-modal-overlay").classList.remove("active");
  }
}

function switchAuthTab(tabName) {
  document.getElementById("auth-signin-form-wrapper").style.display = "none";
  document.getElementById("auth-signup-form-wrapper").style.display = "none";
  document.getElementById("auth-forgot-form-wrapper").style.display = "none";

  if (tabName === "signin") {
    document.getElementById("auth-signin-form-wrapper").style.display = "block";
  } else if (tabName === "signup") {
    document.getElementById("auth-signup-form-wrapper").style.display = "block";
  } else if (tabName === "forgot") {
    document.getElementById("auth-forgot-form-wrapper").style.display = "block";
  }
}

function togglePasswordVisibility(fieldId) {
  const field = document.getElementById(fieldId);
  if (field) {
    if (field.type === "password") field.type = "text";
    else field.type = "password";
  }
}

function validatePasswordStrength(password) {
  const bar = document.getElementById("password-strength-bar");
  const fill = document.getElementById("password-strength-fill");
  const text = document.getElementById("strength-text");

  if (!password) {
    bar.style.display = "none";
    text.textContent = "";
    return;
  }

  bar.style.display = "block";
  let score = 0;
  if (password.length >= 6) score++;
  if (password.match(/[A-Z]/)) score++;
  if (password.match(/[0-9]/)) score++;
  if (password.match(/[^A-Za-z0-9]/)) score++;

  const widthPct = (score / 4) * 100;
  fill.style.width = `${widthPct}%`;

  if (score <= 1) {
    fill.style.backgroundColor = "var(--danger)";
    text.textContent = "Weak Password";
    text.style.color = "var(--danger)";
  } else if (score <= 3) {
    fill.style.backgroundColor = "var(--warning)";
    text.textContent = "Medium Security";
    text.style.color = "var(--warning)";
  } else {
    fill.style.backgroundColor = "var(--success)";
    text.textContent = "Strong Password";
    text.style.color = "var(--success)";
  }
}

function quickLogin(role) {
  if (role === 'customer') {
    document.getElementById("signin-email").value = "vidhan.jain@gmail.com";
    document.getElementById("signin-password").value = "password123";
    document.getElementById("signin-role").value = "customer";
  } else {
    document.getElementById("signin-email").value = "admin@expenseflow.com";
    document.getElementById("signin-password").value = "adminpassword";
    document.getElementById("signin-role").value = "admin";
  }
  // Trigger form submit
  const form = document.getElementById("signin-form");
  if (form) {
    const event = new Event('submit', { cancelable: true });
    form.dispatchEvent(event);
  }
}

function handleSignIn(e) {
  e.preventDefault();
  const email = document.getElementById("signin-email").value.trim().toLowerCase();
  const password = document.getElementById("signin-password").value;
  const role = document.getElementById("signin-role").value;

  if (!email.includes("@")) {
    showToast("Invalid Form", "Please fill in a valid email id.", "danger");
    return;
  }

  // Find user in local database
  const user = store.data.users.find(u => u.email.toLowerCase() === email && u.password === password);

  if (!user) {
    showToast("Login Failed", "Incorrect email or password.", "danger");
    return;
  }

  if (user.isBlocked) {
    showToast("Account Blocked", "Your account has been suspended by the administrator.", "danger");
    return;
  }

  // Force align role state
  if (user.role !== role) {
    showToast("Role Swapped", `Routing you to your assigned role: ${user.role.toUpperCase()}`, "warning");
  }

  // Set Auth state
  store.data.currentUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    college: user.college,
    role: user.role,
    isAuthenticated: true
  };
  
  // Set theme preference
  const settings = store.data.settings[user.id] || { darkTheme: false, soundAlerts: true };
  if (settings.darkTheme) {
    document.documentElement.setAttribute("data-theme", "dark");
    document.getElementById("theme-icon-sun").style.display = "none";
    document.getElementById("theme-icon-moon").style.display = "block";
    const settingsToggle = document.getElementById("settings-theme-toggle");
    if (settingsToggle) settingsToggle.checked = true;
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    document.getElementById("theme-icon-sun").style.display = "block";
    document.getElementById("theme-icon-moon").style.display = "none";
    const settingsToggle = document.getElementById("settings-theme-toggle");
    if (settingsToggle) settingsToggle.checked = false;
  }

  store.save();
  logActivity(user.id, "auth", "User Login", `Logged in successfully via ${user.role} portal.`);

  closeAuthModal(null);
  checkAuthRedirect();
  showToast("Logged In", `Welcome back, ${user.name}!`, "success");
}

function handleSignUp(e) {
  e.preventDefault();
  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim().toLowerCase();
  const college = document.getElementById("signup-college").value.trim();
  const role = document.getElementById("signup-role").value;
  const pwd = document.getElementById("signup-password").value;

  if (pwd.length < 6) {
    showToast("Weak Password", "Password must contain at least 6 characters.", "danger");
    return;
  }

  // Check duplicate
  if (store.data.users.find(u => u.email.toLowerCase() === email)) {
    showToast("Duplicate User", "An account with this email address already exists.", "danger");
    return;
  }

  const newUserId = `usr-${Date.now()}`;
  const newUser = {
    id: newUserId,
    name,
    email,
    college,
    password: pwd,
    role,
    walletBalance: role === 'customer' ? 5000 : 0,
    createdAt: new Date().toISOString(),
    isBlocked: false
  };

  store.data.users.push(newUser);
  
  // Set Auth state
  store.data.currentUser = {
    id: newUserId,
    name,
    email,
    college,
    role,
    isAuthenticated: true
  };

  // Seed user budgets
  store.data.budgets[newUserId] = {
    monthly: 8000,
    daily: 250,
    weekly: 1800,
    semester: 45000
  };

  // Seed user counters
  store.data.chaiMaggi[newUserId] = {
    chaiCount: 0,
    maggiCount: 0,
    lastUpdated: new Date().toISOString().substring(0, 10)
  };

  // Seed settings
  store.data.settings[newUserId] = {
    darkTheme: false,
    soundAlerts: true
  };

  store.save();
  logActivity(newUserId, "auth", "User Registration", `Registered new account as ${role}.`);

  closeAuthModal(null);
  checkAuthRedirect();
  showToast("Welcome aboard!", `Your ${role} workspace is ready.`, "success");
}

function handleForgot(e) {
  e.preventDefault();
  const email = document.getElementById("forgot-email").value;
  showToast("Instructions Dispatched", `A reset code has been sent to ${email}`, "success");
  switchAuthTab("signin");
}

function handleLogout() {
  const uid = getCurUserId();
  if (uid) {
    logActivity(uid, "auth", "User Logout", "Logged out of the system.");
  }
  store.data.currentUser = null;
  store.save();
  
  document.getElementById("signin-email").value = "";
  document.getElementById("signin-password").value = "";

  checkAuthRedirect();
  showToast("Signed Out", "You have successfully signed out.", "info");
}

// ==========================================
// 5. CUSTOM SVG CHARTING ENGINE
// ==========================================

function drawDonutChart(svgId, categoriesData) {
  const svg = document.getElementById(svgId);
  if (!svg) return;

  // Clear previous drawings
  svg.innerHTML = "";

  const total = Object.values(categoriesData).reduce((a, b) => a + b, 0);
  if (total === 0) {
    svg.innerHTML = `
      <text x="50%" y="50%" text-anchor="middle" fill="var(--text-muted)" font-size="14" font-weight="600">No transactions recorded yet</text>
    `;
    return;
  }

  const width = svg.clientWidth || 300;
  const height = svg.clientHeight || 280;
  const cx = width / 2 - 40;
  const cy = height / 2;
  const r = 80;
  const thickness = 28;

  let currentAngle = -Math.PI / 2; // Start from top

  // Custom theme colors for categories
  const colorsMap = {
    Food: "#e11d48",
    Travel: "#0369a1",
    Books: "#b45309",
    Shopping: "#7e22ce",
    Entertainment: "#a21caf",
    Hostel: "#047857",
    Medical: "#b91c1c",
    Miscellaneous: "#475569"
  };

  const keys = Object.keys(categoriesData).filter(k => categoriesData[k] > 0);

    // Center total overlay texts
  const textVal = document.createElementNS("http://www.w3.org/2000/svg", "text");
  textVal.setAttribute("x", cx.toString());
  textVal.setAttribute("y", (cy + 4).toString());
  textVal.setAttribute("text-anchor", "middle");
  textVal.setAttribute("fill", "var(--text-main)");
  textVal.setAttribute("font-weight", "800");
  textVal.setAttribute("font-size", "15");
  textVal.textContent = `₹${total.toFixed(0)}`;

  const textLbl = document.createElementNS("http://www.w3.org/2000/svg", "text");
  textLbl.setAttribute("x", cx.toString());
  textLbl.setAttribute("y", (cy - 14).toString());
  textLbl.setAttribute("text-anchor", "middle");
  textLbl.setAttribute("fill", "var(--text-muted)");
  textLbl.setAttribute("font-size", "10");
  textLbl.setAttribute("font-weight", "700");
  textLbl.textContent = "TOTAL";

  // Loop segments
  keys.forEach((key, idx) => {
    const val = categoriesData[key];
    const percentage = val / total;
    const sliceAngle = percentage * 2 * Math.PI;

    // Coordinates
    const x1 = cx + r * Math.cos(currentAngle);
    const y1 = cy + r * Math.sin(currentAngle);

    const x1_inner = cx + (r - thickness) * Math.cos(currentAngle);
    const y1_inner = cy + (r - thickness) * Math.sin(currentAngle);

    currentAngle += sliceAngle;

    const x2 = cx + r * Math.cos(currentAngle);
    const y2 = cy + r * Math.sin(currentAngle);

    const x2_inner = cx + (r - thickness) * Math.cos(currentAngle);
    const y2_inner = cy + (r - thickness) * Math.sin(currentAngle);

    const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

    // Path string
    const d = `
      M ${x1} ${y1}
      A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}
      L ${x2_inner} ${y2_inner}
      A ${r - thickness} ${r - thickness} 0 ${largeArcFlag} 0 ${x1_inner} ${y1_inner}
      Z
    `;

    // Create segment path
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d.trim());
    path.setAttribute("fill", colorsMap[key] || "#94a3b8");
    path.setAttribute("stroke", "var(--bg-secondary)");
    path.setAttribute("stroke-width", "2");
    path.style.transition = "transform 0.2s, opacity 0.2s";
    path.style.cursor = "pointer";

    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.textContent = `${key}: ₹${val.toFixed(2)} (${((val / total) * 100).toFixed(1)}%)`;
    path.appendChild(title);

    // Add dynamic hover updates
    path.addEventListener("mouseenter", () => {
      path.style.transform = `scale(1.05)`;
      path.style.transformOrigin = `${cx}px ${cy}px`;
      textLbl.textContent = key.toUpperCase();
      textVal.textContent = `₹${val.toFixed(0)}`;
      textVal.setAttribute("fill", colorsMap[key] || "var(--primary)");
    });

    path.addEventListener("mouseleave", () => {
      path.style.transform = "none";
      textLbl.textContent = "TOTAL";
      textVal.textContent = `₹${total.toFixed(0)}`;
      textVal.setAttribute("fill", "var(--text-main)");
    });

    svg.appendChild(path);
  });

  // Append center texts on top of slices
  svg.appendChild(textVal);
  svg.appendChild(textLbl);

  // Render Custom Legend column
  const legendX = cx + r + 24;
  let legendY = cy - (keys.length * 18) / 2;

  keys.forEach((key, idx) => {
    const val = categoriesData[key];
    const pct = ((val / total) * 100).toFixed(0);

    // Legend Dot
    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("cx", legendX.toString());
    dot.setAttribute("cy", legendY.toString());
    dot.setAttribute("r", "5");
    dot.setAttribute("fill", colorsMap[key]);
    svg.appendChild(dot);

    // Legend label text
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", (legendX + 12).toString());
    text.setAttribute("y", (legendY + 4).toString());
    text.setAttribute("fill", "var(--text-muted)");
    text.setAttribute("font-size", "11");
    text.setAttribute("font-weight", "600");
    text.textContent = `${key}: ${pct}%`;
    svg.appendChild(text);

    legendY += 20;
  });
}

function drawBarChart(svgId, dataPoints, options = {}) {
  const svg = document.getElementById(svgId);
  if (!svg) return;

  svg.innerHTML = "";

  if (!dataPoints || dataPoints.length === 0) {
    svg.innerHTML = `
      <text x="50%" y="50%" text-anchor="middle" fill="var(--text-muted)" font-size="14" font-weight="600">No comparative metrics available</text>
    `;
    return;
  }

  const width = svg.clientWidth || 360;
  const height = svg.clientHeight || 280;
  const padding = { top: 30, right: 20, bottom: 40, left: 50 };
  const chartWidth = Math.max(100, width - padding.left - padding.right);
  const chartHeight = Math.max(100, height - padding.top - padding.bottom);

  const maxVal = Math.max(...dataPoints.map(d => d.value), 10);
  const barCount = dataPoints.length;
  const barSlotWidth = chartWidth / barCount;
  const barWidth = Math.min(36, barSlotWidth * 0.65);

  // Background Grid Lines
  const gridCount = 4;
  for (let i = 0; i <= gridCount; i++) {
    const yVal = padding.top + (chartHeight / gridCount) * i;
    const gridValue = Math.round(maxVal - (maxVal / gridCount) * i);

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", padding.left);
    line.setAttribute("y1", yVal);
    line.setAttribute("x2", width - padding.right);
    line.setAttribute("y2", yVal);
    line.setAttribute("stroke", "var(--border)");
    line.setAttribute("stroke-dasharray", "3,3");
    svg.appendChild(line);

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", padding.left - 8);
    label.setAttribute("y", yVal + 4);
    label.setAttribute("text-anchor", "end");
    label.setAttribute("fill", "var(--text-muted)");
    label.setAttribute("font-size", "10");
    label.setAttribute("font-weight", "600");
    label.textContent = `₹${gridValue}`;
    svg.appendChild(label);
  }

  // Draw Bars
  dataPoints.forEach((pt, index) => {
    const x = padding.left + (index * barSlotWidth) + (barSlotWidth - barWidth) / 2;
    const barHeight = Math.max(4, (pt.value / maxVal) * chartHeight);
    const y = padding.top + chartHeight - barHeight;

    const bar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bar.setAttribute("x", x);
    bar.setAttribute("y", y);
    bar.setAttribute("width", barWidth);
    bar.setAttribute("height", barHeight);
    bar.setAttribute("rx", "4");
    bar.setAttribute("ry", "4");
    bar.setAttribute("fill", pt.color || "var(--primary)");
    bar.setAttribute("class", "chart-bar");

    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.textContent = `${pt.label}: ₹${pt.value.toFixed(2)}`;
    bar.appendChild(title);

    svg.appendChild(bar);

    // Value text above bar
    if (barWidth >= 22) {
      const valText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      valText.setAttribute("x", x + barWidth / 2);
      valText.setAttribute("y", y - 6);
      valText.setAttribute("text-anchor", "middle");
      valText.setAttribute("fill", "var(--text-main)");
      valText.setAttribute("font-size", "10");
      valText.setAttribute("font-weight", "700");
      valText.textContent = pt.value > 999 ? `₹${(pt.value/1000).toFixed(1)}k` : `₹${pt.value.toFixed(0)}`;
      svg.appendChild(valText);
    }

    // X-axis label
    const xLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    xLabel.setAttribute("x", x + barWidth / 2);
    xLabel.setAttribute("y", height - padding.bottom + 18);
    xLabel.setAttribute("text-anchor", "middle");
    xLabel.setAttribute("fill", "var(--text-muted)");
    xLabel.setAttribute("font-size", "11");
    xLabel.setAttribute("font-weight", "600");
    xLabel.textContent = pt.label;
    svg.appendChild(xLabel);
  });
}


// ==========================================
// 6. STUDENT DASHBOARD CONTROLLER
// ==========================================

function renderDashboard() {
  const uid = getCurUserId();
  if (!uid) return;

  // Update Profile headers
  document.getElementById("user-name-lbl").textContent = store.data.currentUser.name;
  document.getElementById("user-college-lbl").textContent = store.data.currentUser.college;
  document.getElementById("user-avatar-lbl").textContent = store.data.currentUser.name.charAt(0);

  // Calculate expenses
  const expensesList = getCurUserExpenses();
  const currentMonthStr = new Date().toISOString().substring(0, 7); // YYYY-MM
  const currentMonthExpenses = expensesList.filter(e => e.date.substring(0, 7) === currentMonthStr);
  const totalMonthSpent = currentMonthExpenses.reduce((a, b) => a + b.amount, 0);

  // Budgets & Orders
  const monthlyLimit = getCurUserBudget().monthly;
  const ordersList = store.data.orders.filter(o => o.userId === uid);
  const totalOrdersSpent = ordersList.reduce((a, b) => a + b.price, 0);
  const walletBalance = monthlyLimit - totalMonthSpent - totalOrdersSpent;

  // Savings goals
  const activeSavingsTotal = getCurUserSavings().reduce((a, b) => a + b.currentSaved, 0);

  // Render dashboard widgets
  document.getElementById("val-balance").textContent = `₹${walletBalance.toFixed(2)}`;
  document.getElementById("val-budget").textContent = `₹${monthlyLimit.toFixed(2)}`;
  document.getElementById("val-expenses").textContent = `₹${totalMonthSpent.toFixed(2)}`;
  document.getElementById("val-savings").textContent = `₹${activeSavingsTotal.toFixed(2)}`;

  // Check notifications count
  const unreadNotifs = getCurUserNotifications().filter(n => !n.read).length;
  const badge = document.getElementById("notif-badge-count");
  if (unreadNotifs > 0) {
    badge.textContent = unreadNotifs;
    badge.style.display = "flex";
  } else {
    badge.style.display = "none";
  }

  // Exam Alerts Banner Check (November/December/May/June)
  const currentMonth = new Date().getMonth(); // 0-11
  const examAlertWidget = document.getElementById("exam-alert-widget");
  if (examAlertWidget) {
    if ([4, 5, 10, 11].includes(currentMonth)) {
      examAlertWidget.className = "exam-alert-banner exam-alert-banner-danger";
      examAlertWidget.querySelector("h4").textContent = "Semester Exams Imminent!";
      examAlertWidget.querySelector("p").textContent = "Exams are scheduled this month. Minimise entertainment spends to target reference materials and exam deposits.";
      examAlertWidget.style.display = "flex";
    } else if ([3, 9].includes(currentMonth)) {
      examAlertWidget.className = "exam-alert-banner";
      examAlertWidget.querySelector("h4").textContent = "Exam Months Approaching";
      examAlertWidget.querySelector("p").textContent = "Exams start next month. Consider lowering entertainment allocations to preserve your semester cash reserves.";
      examAlertWidget.style.display = "flex";
    } else {
      examAlertWidget.style.display = "none";
    }
  }

  // Quick counter updates
  const chaiMaggiObj = getCurUserChaiMaggi();
  document.getElementById("val-counter-chai").textContent = chaiMaggiObj.chaiCount;
  document.getElementById("val-counter-maggi").textContent = chaiMaggiObj.maggiCount;

  const currentChaiSpends = chaiMaggiObj.chaiCount * 12;
  const currentMaggiSpends = chaiMaggiObj.maggiCount * 25;
  const totalSnackMonthly = currentChaiSpends + currentMaggiSpends;
  document.getElementById("val-spend-monthly").textContent = `₹${totalSnackMonthly.toFixed(2)}`;
  document.getElementById("val-spend-lifetime").textContent = `₹${(totalSnackMonthly * 1.5).toFixed(0)}`; 

  // Custom SVG render
  const categoriesSum = { Food: 0, Travel: 0, Books: 0, Shopping: 0, Entertainment: 0, Hostel: 0, Medical: 0, Miscellaneous: 0 };
  currentMonthExpenses.forEach(e => {
    if (categoriesSum[e.category] !== undefined) {
      categoriesSum[e.category] += e.amount;
    }
  });
  drawDonutChart("dashboard-svg-chart", categoriesSum);

  // Recent transactions table render
  const recentTable = document.getElementById("dash-recent-transactions-tbody");
  recentTable.innerHTML = "";

  const sortedExpenses = [...expensesList].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);

  if (sortedExpenses.length === 0) {
    recentTable.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No logs documented.</td></tr>';
  } else {
    const classMap = {
      Food: "cat-food",
      Travel: "cat-travel",
      Books: "cat-books",
      Shopping: "cat-shopping",
      Entertainment: "cat-entertainment",
      Hostel: "cat-hostel",
      Medical: "cat-medical",
      Miscellaneous: "cat-miscellaneous"
    };

    sortedExpenses.forEach(exp => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${exp.date}</td>
        <td><span class="category-badge ${classMap[exp.category] || "cat-miscellaneous"}">${exp.category}</span></td>
        <td>${exp.description}</td>
        <td style="font-weight: 700;">₹${exp.amount.toFixed(2)}</td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="deleteExpenseConfirm('${exp.id}')">Delete</button>
        </td>
      `;
      recentTable.appendChild(tr);
    });
  }

  // Render Upcoming Reminders
  renderUpcomingRemindersWidget();
}

function renderUpcomingRemindersWidget() {
  const container = document.getElementById("dashboard-reminders-list");
  if (!container) return;

  container.innerHTML = "";

  const activeReminders = [...getCurUserReminders()].sort((a, b) => new Date(a.date) - new Date(b.date));

  if (activeReminders.length === 0) {
    container.innerHTML = '<p style="font-size: 0.8rem; color: var(--text-muted); text-align: center;">No upcoming bills configured.</p>';
    return;
  }

  const today = new Date();

  activeReminders.slice(0, 3).forEach(rem => {
    const dueDate = new Date(rem.date);
    const timeDiff = dueDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    let badgeClass = "badge-tag";
    let badgeText = `${daysDiff} days left`;

    if (daysDiff < 0) {
      badgeClass = "btn-danger";
      badgeText = "OVERDUE";
    } else if (daysDiff <= 3) {
      badgeClass = "btn-danger";
    }

    const div = document.createElement("div");
    div.className = "flex-between";
    div.style.background = "var(--bg-tertiary)";
    div.style.padding = "10px 14px";
    div.style.borderRadius = "var(--radius-xs)";

    div.innerHTML = `
      <div>
        <h4 style="font-size: 0.85rem; font-weight: 700;">${rem.title}</h4>
        <p style="font-size: 0.75rem; color: var(--text-muted);">₹${rem.amount.toFixed(0)} • Due ${rem.date}</p>
      </div>
      <span class="btn btn-sm ${badgeClass}" style="cursor: default; padding: 2px 8px; font-size: 0.7rem;">${badgeText}</span>
    `;

    container.appendChild(div);
  });
}

// ==========================================
// 7. TOOGLE CLOCK EVENTS & CHAI / MAGGI
// ==========================================

function adjustChaiMaggiCounter(type, change) {
  const uid = getCurUserId();
  if (!uid) return;

  const chaiMaggi = getCurUserChaiMaggi();

  if (type === "chai") {
    chaiMaggi.chaiCount = Math.max(0, chaiMaggi.chaiCount + change);

    if (change > 0) {
      const todayStr = new Date().toISOString().substring(0, 10);
      store.data.expenses.push({
        id: `exp-${Date.now()}`,
        userId: uid,
        date: todayStr,
        category: "Food",
        description: "Quick Chai Refill",
        amount: 12
      });
      logActivity(uid, "expense", "Logged Expense", "Quick Chai Refill (₹12.00)");
      showToast("Chai Logged", "Logged 1 cup of Chai (₹12.00) to Food expenses.", "success");
    }
  } else if (type === "maggi") {
    chaiMaggi.maggiCount = Math.max(0, chaiMaggi.maggiCount + change);

    if (change > 0) {
      const todayStr = new Date().toISOString().substring(0, 10);
      store.data.expenses.push({
        id: `exp-${Date.now()}`,
        userId: uid,
        date: todayStr,
        category: "Food",
        description: "Quick Maggi Plate",
        amount: 25
      });
      logActivity(uid, "expense", "Logged Expense", "Quick Maggi Plate (₹25.00)");
      showToast("Maggi Logged", "Logged 1 plate of Maggi (₹25.00) to Food expenses.", "success");
    }
  }

  store.save();
  renderDashboard();
}

// ==========================================
// 8. EXPENSE MODULE CONTROLLERS
// ==========================================

let expenseCurrentPage = 1;
const expenseItemsPerPage = 5;

function renderExpenseTracker() {
  const uid = getCurUserId();
  if (!uid) return;

  // Set default date input
  const dateInput = document.getElementById("expense-date");
  if (dateInput) dateInput.value = new Date().toISOString().substring(0, 10);

  // Reset page and reload list
  expenseCurrentPage = 1;
  filterExpenses();
}

function resetExpensePageAndFilter() {
  expenseCurrentPage = 1;
  filterExpenses();
}

function changeExpensePage(dir) {
  expenseCurrentPage += dir;
  filterExpenses();
}

function filterExpenses() {
  const tableBody = document.getElementById("expense-history-tbody");
  if (!tableBody) return;

  tableBody.innerHTML = "";

  const search = document.getElementById("expense-search-input").value.toLowerCase();
  const filter = document.getElementById("expense-filter-select").value;
  const sort = document.getElementById("expense-sort-select").value;

  let list = getCurUserExpenses();

  // 1. Filter
  if (filter !== "all") {
    list = list.filter(e => e.category === filter);
  }

  if (search) {
    list = list.filter(e => e.description.toLowerCase().includes(search) || e.category.toLowerCase().includes(search));
  }

  // 2. Sort
  list.sort((a, b) => {
    if (sort === "date-desc") return new Date(b.date) - new Date(a.date);
    if (sort === "date-asc") return new Date(a.date) - new Date(b.date);
    if (sort === "amount-desc") return b.amount - a.amount;
    if (sort === "amount-asc") return a.amount - b.amount;
    return 0;
  });

  // 3. Paginate
  const totalItems = list.length;
  const totalPages = Math.ceil(totalItems / expenseItemsPerPage) || 1;
  
  if (expenseCurrentPage > totalPages) expenseCurrentPage = totalPages;
  if (expenseCurrentPage < 1) expenseCurrentPage = 1;

  const startIndex = (expenseCurrentPage - 1) * expenseItemsPerPage;
  const endIndex = startIndex + expenseItemsPerPage;
  const paginatedList = list.slice(startIndex, endIndex);

  // Update pagination indicators
  document.getElementById("expense-page-info").textContent = `Page ${expenseCurrentPage} of ${totalPages} (Total ${totalItems} logs)`;
  document.getElementById("expense-prev-btn").disabled = (expenseCurrentPage === 1);
  document.getElementById("expense-next-btn").disabled = (expenseCurrentPage === totalPages);

  if (paginatedList.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No ledger entries found.</td></tr>';
    return;
  }

  const classMap = {
    Food: "cat-food",
    Travel: "cat-travel",
    Books: "cat-books",
    Shopping: "cat-shopping",
    Entertainment: "cat-entertainment",
    Hostel: "cat-hostel",
    Medical: "cat-medical",
    Miscellaneous: "cat-miscellaneous"
  };

  paginatedList.forEach(exp => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${exp.date}</td>
      <td><span class="category-badge ${classMap[exp.category] || "cat-miscellaneous"}">${exp.category}</span></td>
      <td>${exp.description}</td>
      <td style="font-weight: 700;">₹${exp.amount.toFixed(2)}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="deleteExpenseConfirm('${exp.id}')">Delete</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

function addExpense(e) {
  e.preventDefault();
  const uid = getCurUserId();
  if (!uid) return;

  const amt = parseFloat(document.getElementById("expense-amount").value);
  const cat = document.getElementById("expense-category").value;
  const desc = document.getElementById("expense-desc").value.trim();
  const date = document.getElementById("expense-date").value;

  if (isNaN(amt) || amt <= 0) {
    showToast("Invalid Input", "Amount must be a positive number.", "danger");
    return;
  }

  const newExp = {
    id: `exp-${Date.now()}`,
    userId: uid,
    date,
    category: cat,
    description: desc,
    amount: amt
  };

  store.data.expenses.push(newExp);
  store.save();
  logActivity(uid, "expense", "Logged Expense", `${desc} (₹${amt.toFixed(2)}) in ${cat}`);

  // Reset Form
  document.getElementById("expense-amount").value = "";
  document.getElementById("expense-desc").value = "";

  resetExpensePageAndFilter();
  showToast("Transaction Recorded", "Your transaction was successfully logged.", "success");
}

function deleteExpenseConfirm(id) {
  const uid = getCurUserId();
  if (!uid) return;

  const backup = JSON.parse(JSON.stringify(store.data));
  const expToDelete = store.data.expenses.find(e => e.id === id && e.userId === uid);
  if (!expToDelete) return;

  store.pushUndo("Delete Expense", backup);
  store.data.expenses = store.data.expenses.filter(e => e.id !== id);
  store.save();
  logActivity(uid, "expense", "Deleted Expense", `${expToDelete.description} (₹${expToDelete.amount.toFixed(2)})`);

  // Refresh views
  checkAuthRedirect();

  showUndoToast("Undo Delete", `${expToDelete.description} (₹${expToDelete.amount}) removed.`);
}

// ==========================================
// 9. BUDGET PLANNER MODULE CONTROLLERS
// ==========================================

function renderBudgetPlanner() {
  const monthly = getCurUserBudget().monthly;
  const daily = getCurUserBudget().daily;
  const weekly = getCurUserBudget().weekly;
  const semester = getCurUserBudget().semester;

  document.getElementById("budget-monthly").value = monthly;
  document.getElementById("budget-daily").value = daily;
  document.getElementById("budget-weekly").value = weekly;
  document.getElementById("budget-semester").value = semester;

  // Calculate progressions
  const expenses = getCurUserExpenses();
  const currentMonthStr = new Date().toISOString().substring(0, 7);

  // Monthly calculations
  const spentMonthly = expenses.filter(e => e.date.substring(0, 7) === currentMonthStr).reduce((a, b) => a + b.amount, 0);
  const monthlyPct = Math.min(100, monthly > 0 ? (spentMonthly / monthly) * 100 : 0);

  const monthlyFill = document.getElementById("budget-progress-fill-monthly");
  monthlyFill.style.width = `${monthlyPct}%`;
  document.getElementById("budget-progress-pct-monthly").textContent = `${monthlyPct.toFixed(0)}% Used`;
  document.getElementById("budget-lbl-used-monthly").textContent = `Spent: ₹${spentMonthly.toFixed(2)}`;
  document.getElementById("budget-lbl-total-monthly").textContent = `Limit: ₹${monthly.toFixed(2)}`;

  // Set fill warning colors
  if (monthlyPct > 90) monthlyFill.className = "progress-fill danger";
  else if (monthlyPct > 70) monthlyFill.className = "progress-fill warning";
  else monthlyFill.className = "progress-fill";

  // Daily calculations
  const todayStr = new Date().toISOString().substring(0, 10);
  const spentToday = expenses.filter(e => e.date === todayStr).reduce((a, b) => a + b.amount, 0);
  const dailyPct = Math.min(100, daily > 0 ? (spentToday / daily) * 100 : 0);

  const dailyFill = document.getElementById("budget-progress-fill-daily");
  dailyFill.style.width = `${dailyPct}%`;
  document.getElementById("budget-progress-pct-daily").textContent = `${dailyPct.toFixed(0)}% Used`;
  document.getElementById("budget-lbl-used-daily").textContent = `Spent Today: ₹${spentToday.toFixed(2)}`;
  document.getElementById("budget-lbl-total-daily").textContent = `Limit: ₹${daily.toFixed(2)}`;

  if (dailyPct > 90) dailyFill.className = "progress-fill danger";
  else if (dailyPct > 70) dailyFill.className = "progress-fill warning";
  else dailyFill.className = "progress-fill success";

  // Semester calculations
  const spentSemester = expenses.reduce((a, b) => a + b.amount, 0);
  const semPct = Math.min(100, semester > 0 ? (spentSemester / semester) * 100 : 0);

  const semFill = document.getElementById("budget-progress-fill-semester");
  semFill.style.width = `${semPct}%`;
  document.getElementById("budget-progress-pct-semester").textContent = `${semPct.toFixed(0)}% Used`;
  document.getElementById("budget-lbl-used-semester").textContent = `Spent: ₹${spentSemester.toFixed(2)}`;
  document.getElementById("budget-lbl-total-semester").textContent = `Limit: ₹${semester.toFixed(2)}`;

  if (semPct > 90) semFill.className = "progress-fill danger";
  else if (semPct > 70) semFill.className = "progress-fill warning";
  else semFill.className = "progress-fill";

  // Update suggestions card
  const statusTip = document.getElementById("budget-status-tip-card");
  const tipTitle = document.getElementById("budget-tip-title");
  const tipDesc = document.getElementById("budget-tip-desc");

  if (monthlyPct > 95 || dailyPct > 95) {
    statusTip.style.borderLeftColor = "var(--danger)";
    tipTitle.textContent = "Budget Warning: Limit Overrun imminent!";
    tipTitle.style.color = "var(--danger)";
    tipDesc.textContent = "You are close to breaching your budget targets. Lower your snack/entertainment logs immediately.";
  } else if (monthlyPct > 75 || dailyPct > 75) {
    statusTip.style.borderLeftColor = "var(--warning)";
    tipTitle.textContent = "Budget Warning: Approaching caps";
    tipTitle.style.color = "var(--warning)";
    tipDesc.textContent = "You have consumed over 75% of your target limits. Conserve wallet balances.";
  } else {
    statusTip.style.borderLeftColor = "var(--success)";
    tipTitle.textContent = "Budget Standing: Perfect";
    tipTitle.style.color = "var(--success)";
    tipDesc.textContent = "Daily limits and monthly progress are healthy. You are saving cash steadily.";
  }
}

function saveBudgets(e) {
  e.preventDefault();
  const uid = getCurUserId();
  if (!uid) return;

  store.data.budgets[uid].monthly = parseFloat(document.getElementById("budget-monthly").value) || 0;
  store.data.budgets[uid].daily = parseFloat(document.getElementById("budget-daily").value) || 0;
  store.data.budgets[uid].weekly = parseFloat(document.getElementById("budget-weekly").value) || 0;
  store.data.budgets[uid].semester = parseFloat(document.getElementById("budget-semester").value) || 0;

  store.save();
  logActivity(uid, "budget", "Updated Budgets", `Set monthly pocket money limit to ₹${store.data.budgets[uid].monthly}`);
  renderBudgetPlanner();
  showToast("Limits Configured", "Your budget allocations were saved successfully.", "success");
}

// ==========================================
// 10. SAVINGS GOALS MODULE CONTROLLERS
// ==========================================

function renderSavingsGoals() {
  const container = document.getElementById("savings-goals-list");
  if (!container) return;

  container.innerHTML = "";

  const goals = getCurUserSavings();

  if (goals.length === 0) {
    container.innerHTML = '<div class="glass-card" style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No savings targets tracked yet. Configure one on the left.</div>';
    return;
  }

  // Set min deadline to today
  const dateInput = document.getElementById("goal-date");
  if (dateInput) dateInput.value = new Date().toISOString().substring(0, 10);

  goals.forEach(goal => {
    const pct = Math.min(100, goal.targetAmount > 0 ? (goal.currentSaved / goal.targetAmount) * 100 : 0);

    const today = new Date();
    const targetDate = new Date(goal.date);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const needed = goal.targetAmount - goal.currentSaved;
    let rateText = "";
    if (diffDays > 0 && needed > 0) {
      const dailyRate = needed / diffDays;
      rateText = `Save ₹${dailyRate.toFixed(0)}/day`;
    } else if (needed <= 0) {
      rateText = "Goal completed! 🎉";
    } else {
      rateText = "Deadline passed";
    }

    const card = document.createElement("div");
    card.className = "glass-card goal-card";

    card.innerHTML = `
      <div class="goal-card-header">
        <span class="goal-card-title">${goal.name}</span>
        <span class="category-badge cat-food">${goal.category}</span>
      </div>
      <div class="goal-card-target">₹${goal.currentSaved.toFixed(0)} / ₹${goal.targetAmount.toFixed(0)}</div>
      
      <div class="progress-bar">
        <div class="progress-fill ${pct >= 100 ? 'success' : ''}" style="width: ${pct}%"></div>
      </div>
      
      <div class="goal-card-details">
        <span>${pct.toFixed(0)}% Saved</span>
        <span>${rateText}</span>
      </div>
      
      <div style="display: flex; gap: 8px; margin-top: 16px;">
        <input type="number" class="form-input" placeholder="Amount (₹)" style="padding: 6px 12px; font-size: 0.85rem;" id="contrib-amt-${goal.id}">
        <button class="btn btn-sm btn-primary" onclick="addGoalContribution('${goal.id}')">Add</button>
        <button class="btn btn-sm btn-danger" onclick="deleteSavingsGoal('${goal.id}')">Delete</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function addSavingsGoal(e) {
  e.preventDefault();
  const uid = getCurUserId();
  if (!uid) return;

  const name = document.getElementById("goal-name").value.trim();
  const amt = parseFloat(document.getElementById("goal-amount").value);
  const date = document.getElementById("goal-date").value;
  const cat = document.getElementById("goal-category").value;

  if (isNaN(amt) || amt <= 0) {
    showToast("Invalid Input", "Target amount must be a positive number.", "danger");
    return;
  }

  const newGoal = {
    id: `save-${Date.now()}`,
    userId: uid,
    name,
    targetAmount: amt,
    currentSaved: 0,
    date,
    category: cat,
    completed: false
  };

  store.data.savings.push(newGoal);
  store.save();
  logActivity(uid, "savings", "Created Goal", `Started saving target: ${name} (₹${amt})`);

  document.getElementById("goal-name").value = "";
  document.getElementById("goal-amount").value = "";

  renderSavingsGoals();
  showToast("Goal Created", `New savings goal "${name}" initiated.`, "success");
}

function addGoalContribution(goalId) {
  const uid = getCurUserId();
  if (!uid) return;

  const input = document.getElementById(`contrib-amt-${goalId}`);
  if (!input) return;

  const amt = parseFloat(input.value);
  if (isNaN(amt) || amt <= 0) {
    showToast("Invalid Input", "Please enter a valid contribution amount.", "danger");
    return;
  }

  const goal = store.data.savings.find(g => g.id === goalId && g.userId === uid);
  if (!goal) return;

  goal.currentSaved += amt;

  // Also log it as a virtual expense to Miscellaneous
  store.data.expenses.push({
    id: `exp-${Date.now()}`,
    userId: uid,
    date: new Date().toISOString().substring(0, 10),
    category: "Miscellaneous",
    description: `Goal Deposit: ${goal.name}`,
    amount: amt
  });

  store.save();
  logActivity(uid, "savings", "Goal Deposit", `Deposited ₹${amt} to saving target: ${goal.name}`);
  renderSavingsGoals();
  showToast("Deposit Logged", `Added ₹${amt.toFixed(0)} to your savings goal: "${goal.name}".`, "success");
}

function deleteSavingsGoal(goalId) {
  const uid = getCurUserId();
  if (!uid) return;

  const goal = store.data.savings.find(g => g.id === goalId && g.userId === uid);
  store.data.savings = store.data.savings.filter(g => g.id !== goalId);
  store.save();
  if (goal) {
    logActivity(uid, "savings", "Deleted Goal", `Deleted savings target: ${goal.name}`);
  }
  renderSavingsGoals();
  showToast("Goal Removed", "Savings target configuration deleted.", "info");
}

// ==========================================
// 11. UDHAAR MODULE CONTROLLERS
// ==========================================

function renderUdhaarLedger() {
  document.getElementById("udhaar-date").value = new Date().toISOString().substring(0, 10);
  filterUdhaar();
}

function filterUdhaar() {
  const tableBody = document.getElementById("udhaar-history-tbody");
  if (!tableBody) return;

  tableBody.innerHTML = "";

  const search = document.getElementById("udhaar-search-input").value.toLowerCase();
  const filter = document.getElementById("udhaar-filter-select").value;

  let list = getCurUserUdhaar();

  if (filter !== "all") {
    list = list.filter(u => u.status === filter);
  }

  if (search) {
    list = list.filter(u => u.friend.toLowerCase().includes(search));
  }

  if (list.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No friend ledger logs documented.</td></tr>';
    return;
  }

  list.forEach(log => {
    const tr = document.createElement("tr");

    let typeMarkup = "";
    if (log.type === "lent") {
      typeMarkup = '<span style="color: var(--success); font-weight: 700;">Lent (Owes you)</span>';
    } else {
      typeMarkup = '<span style="color: var(--danger); font-weight: 700;">Borrowed (You owe)</span>';
    }

    let statusBtn = "";
    if (log.status === "pending") {
      statusBtn = `<button class="btn btn-sm btn-success" onclick="settleUdhaar('${log.id}')">Settle / Paid</button>`;
    } else {
      statusBtn = '<span style="color: var(--text-light); font-weight: 700; font-size: 0.8rem;">Settled</span>';
    }

    tr.innerHTML = `
      <td style="font-weight: 700;">${log.friend}</td>
      <td>${typeMarkup}</td>
      <td style="font-weight: 700;">₹${log.amount.toFixed(2)}</td>
      <td>${log.date}</td>
      <td>
        <span class="category-badge ${log.status === 'paid' ? 'cat-hostel' : 'cat-medical'}">${log.status.toUpperCase()}</span>
      </td>
      <td>
        <div style="display: flex; gap: 6px;">
          ${statusBtn}
          <button class="btn btn-sm btn-danger" onclick="deleteUdhaar('${log.id}')">Delete</button>
        </div>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

function addUdhaar(e) {
  e.preventDefault();
  const uid = getCurUserId();
  if (!uid) return;

  const type = document.getElementById("udhaar-type").value;
  const friend = document.getElementById("udhaar-friend").value.trim();
  const amt = parseFloat(document.getElementById("udhaar-amount").value);
  const date = document.getElementById("udhaar-date").value;

  if (isNaN(amt) || amt <= 0) {
    showToast("Invalid Input", "Amount must be positive.", "danger");
    return;
  }

  const newLog = {
    id: `udh-${Date.now()}`,
    userId: uid,
    friend,
    type,
    amount: amt,
    date,
    status: "pending"
  };

  store.data.udhaar.push(newLog);
  store.save();
  logActivity(uid, "udhaar", "Added Ledger", `Logged ${type} ₹${amt} with ${friend}`);

  document.getElementById("udhaar-friend").value = "";
  document.getElementById("udhaar-amount").value = "";

  renderUdhaarLedger();
  showToast("Ledger Added", `Registered debt log with ${friend}.`, "success");
}

function settleUdhaar(id) {
  const uid = getCurUserId();
  if (!uid) return;

  const log = store.data.udhaar.find(u => u.id === id && u.userId === uid);
  if (!log) return;

  log.status = "paid";

  // Auto-log paid action as actual cash flow
  if (log.type === "borrowed") {
    store.data.expenses.push({
      id: `exp-${Date.now()}`,
      userId: uid,
      date: new Date().toISOString().substring(0, 10),
      category: "Miscellaneous",
      description: `Settled Debt to: ${log.friend}`,
      amount: log.amount
    });
  }

  store.save();
  logActivity(uid, "udhaar", "Settled Debt", `Settled outstanding debt of ₹${log.amount} with ${log.friend}`);
  renderUdhaarLedger();
  showToast("Debt Settled", `Ledger with ${log.friend} marked paid.`, "success");
}

function deleteUdhaar(id) {
  const uid = getCurUserId();
  if (!uid) return;

  const log = store.data.udhaar.find(u => u.id === id && u.userId === uid);
  store.data.udhaar = store.data.udhaar.filter(u => u.id !== id);
  store.save();
  if (log) {
    logActivity(uid, "udhaar", "Deleted Record", `Deleted ledger entry with ${log.friend}`);
  }
  renderUdhaarLedger();
  showToast("Record Removed", "Friend ledger deleted.", "info");
}

// ==========================================
// 12. BILL SPLITTER CONTROLLERS
// ==========================================

let splitFriendCounter = 0;

function renderBillSplitter() {
  const container = document.getElementById("split-members-container");

  // Reset container but keep the default "Self (You)" field
  container.innerHTML = `
    <div class="split-member-row" style="background: none; padding: 0; margin-bottom: 6px;">
      <input type="text" class="form-input split-member-name" required placeholder="Self (You)" style="flex: 1; margin-right: 8px;" value="You" readonly>
      <input type="number" class="form-input split-member-share" placeholder="Share % (Optional)" style="max-width: 120px;" min="0" max="100">
    </div>
  `;
  splitFriendCounter = 0;

  // Seed with 2 dummy friend boxes
  addSplitFriendField("Kabir Verma");
  addSplitFriendField("Riya Sen");
}

function addSplitFriendField(prefillVal = "") {
  const container = document.getElementById("split-members-container");
  splitFriendCounter++;

  const div = document.createElement("div");
  div.className = "split-member-row";
  div.style.marginBottom = "6px";
  div.id = `split-friend-row-${splitFriendCounter}`;

  div.innerHTML = `
    <input type="text" class="form-input split-member-name" required placeholder="Friend's Name" style="flex: 1; margin-right: 8px;" value="${prefillVal}">
    <input type="number" class="form-input split-member-share" placeholder="Share %" style="max-width: 100px; margin-right: 8px;" min="0" max="100">
    <button type="button" class="btn btn-sm btn-danger flex-center" onclick="removeSplitFriendField(${splitFriendCounter})" style="padding: 10px;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
    </button>
  `;
  container.appendChild(div);
}

function removeSplitFriendField(id) {
  const row = document.getElementById(`split-friend-row-${id}`);
  if (row) row.remove();
}

function calculateBillSplit(e) {
  e.preventDefault();

  const totalVal = parseFloat(document.getElementById("split-total-amount").value);
  const cat = document.getElementById("split-category").value;

  const nameInputs = document.querySelectorAll(".split-member-name");
  const shareInputs = document.querySelectorAll(".split-member-share");

  const members = [];
  let customPercentageSum = 0;
  let customCount = 0;

  nameInputs.forEach((input, index) => {
    const shareVal = parseFloat(shareInputs[index].value);
    members.push({
      name: input.value,
      sharePct: isNaN(shareVal) ? null : shareVal
    });
    if (!isNaN(shareVal)) {
      customPercentageSum += shareVal;
      customCount++;
    }
  });

  const resultsBox = document.getElementById("split-results-panel");
  resultsBox.innerHTML = "";

  if (customCount > 0 && customCount < members.length) {
    showToast("Splitting Error", "Please provide percentages for all members or leave all blank for equal splits.", "danger");
    return;
  }

  if (customCount > 0 && customPercentageSum !== 100) {
    showToast("Percentage Error", `Custom shares must sum up to exactly 100%. Currently: ${customPercentageSum}%`, "danger");
    return;
  }

  const splitDetails = [];

  if (customCount === 0) {
    // Equal Split
    const perHead = totalVal / members.length;
    members.forEach(m => {
      splitDetails.push({ name: m.name, amount: perHead, pct: (100 / members.length) });
    });
  } else {
    // Custom Split
    members.forEach(m => {
      const amt = (totalVal * m.sharePct) / 100;
      splitDetails.push({ name: m.name, amount: amt, pct: m.sharePct });
    });
  }

  // Render results list
  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";
  wrapper.style.gap = "10px";

  splitDetails.forEach(member => {
    const row = document.createElement("div");
    row.className = "flex-between";
    row.style.background = "var(--bg-tertiary)";
    row.style.padding = "12px 16px";
    row.style.borderRadius = "var(--radius-sm)";

    row.innerHTML = `
      <div>
        <h4 style="font-weight: 700; font-size: 0.9rem;">${member.name}</h4>
        <p style="font-size: 0.75rem; color: var(--text-muted);">${member.pct.toFixed(0)}% contribution share</p>
      </div>
      <div style="font-weight: 800; font-size: 1.1rem; color: var(--primary);">₹${member.amount.toFixed(2)}</div>
    `;
    wrapper.appendChild(row);
  });

  // Add quick Log button
  const logBtn = document.createElement("button");
  logBtn.className = "btn btn-primary";
  logBtn.style.marginTop = "16px";
  logBtn.textContent = "Log Your Share to Expenses";
  logBtn.onclick = () => {
    const uid = getCurUserId();
    if (!uid) return;

    const selfShare = splitDetails.find(d => d.name === "You" || d.name.toLowerCase().includes("self"));
    const shareAmt = selfShare ? selfShare.amount : splitDetails[0].amount;

    store.data.expenses.push({
      id: `exp-${Date.now()}`,
      userId: uid,
      date: new Date().toISOString().substring(0, 10),
      category: cat,
      description: `Split Bill: ${cat} Event`,
      amount: shareAmt
    });
    store.save();
    logActivity(uid, "expense", "Split Bill Logged", `Logged ₹${shareAmt.toFixed(2)} share for ${cat} bill`);
    showToast("Share logged", `Logged ₹${shareAmt.toFixed(2)} to your Food/Hostel ledger.`, "success");
  };

  resultsBox.appendChild(wrapper);
  resultsBox.appendChild(logBtn);
}

// ==========================================
// 13. REPORTS & EXCEL/PDF EXPORTS
// ==========================================

function generateReport() {
  const startVal = document.getElementById("report-start-date").value;
  const endVal = document.getElementById("report-end-date").value;
  const filterCat = document.getElementById("report-category").value;

  const curUser = store.data.currentUser;
  let list = (curUser && curUser.role === 'admin') ? [...store.data.expenses] : getCurUserExpenses();

  if (startVal) {
    list = list.filter(e => new Date(e.date) >= new Date(startVal));
  }

  if (endVal) {
    list = list.filter(e => new Date(e.date) <= new Date(endVal));
  }

  if (filterCat !== "all") {
    list = list.filter(e => e.category === filterCat);
  }

  // Update table view
  const tbody = document.getElementById("report-history-tbody");
  tbody.innerHTML = "";

  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No match records.</td></tr>';
  } else {
    list.forEach(exp => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${exp.date}</td>
        <td><strong>${exp.category}</strong></td>
        <td>${exp.description}</td>
        <td style="font-weight: 700;">₹${exp.amount.toFixed(2)}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Redraw SVG charts
  const sums = { Food: 0, Travel: 0, Books: 0, Shopping: 0, Entertainment: 0, Hostel: 0, Medical: 0, Miscellaneous: 0 };
  list.forEach(exp => {
    if (sums[exp.category] !== undefined) {
      sums[exp.category] += exp.amount;
    }
  });
  drawDonutChart("reports-svg-chart", sums);
}

function exportCSV() {
  const curUser = store.data.currentUser;
  const expenses = (curUser && curUser.role === 'admin') ? store.data.expenses : getCurUserExpenses();
  let csvContent = "data:text/csv;charset=utf-8,Date,Category,Description,Amount\n";

  expenses.forEach(e => {
    csvContent += `"${e.date}","${e.category}","${e.description.replace(/"/g, '""')}",${e.amount}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `ExpenseFlow_Report_${new Date().toISOString().substring(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("Report Exported", "CSV downloaded successfully.", "success");
}

function printReport() {
  window.print();
}

// ==========================================
// 14. SETTINGS, PROFILE, & BACKUP UTILITIES
// ==========================================

function renderSettings() {
  const profileName = document.getElementById("settings-profile-name");
  const profileCollege = document.getElementById("settings-profile-college");

  if (profileName) profileName.value = store.data.currentUser.name;
  if (profileCollege) profileCollege.value = store.data.currentUser.college;
}

function updateProfile(e) {
  e.preventDefault();

  const name = document.getElementById("settings-profile-name").value;
  const college = document.getElementById("settings-profile-college").value;

  store.data.currentUser.name = name;
  store.data.currentUser.college = college;
  store.save();

  // Refresh sidebar indicators
  document.getElementById("user-name-lbl").textContent = name;
  document.getElementById("user-college-lbl").textContent = college;
  document.getElementById("user-avatar-lbl").textContent = name.charAt(0);

  showToast("Profile Updated", "Workspace credentials saved successfully.", "success");
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  let next = "light";
  if (current === "light") {
    next = "dark";
    document.getElementById("theme-icon-sun").style.display = "none";
    document.getElementById("theme-icon-moon").style.display = "block";
    store.data.settings.darkTheme = true;
  } else {
    document.getElementById("theme-icon-sun").style.display = "block";
    document.getElementById("theme-icon-moon").style.display = "none";
    store.data.settings.darkTheme = false;
  }
  document.documentElement.setAttribute("data-theme", next);
  store.save();
}

function toggleNotificationsSetting() {
  store.data.settings.soundAlerts = document.getElementById("settings-notif-toggle").checked;
  store.save();
  showToast("Alert Configured", "Notification sound systems modified.", "success");
}

// Data Export Backups
function exportDataBackup() {
  const jsonStr = JSON.stringify(store.data, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonStr);

  const link = document.createElement("a");
  link.setAttribute("href", dataUri);
  link.setAttribute("download", `ExpenseFlow_Backup_${new Date().toISOString().substring(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("Data Exported", "Backup JSON downloaded successfully.", "success");
}

// Data Import Backups
function importDataBackup(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (evt) {
    try {
      const parsed = JSON.parse(evt.target.result);
      // Simple structures validation
      if (parsed.currentUser && parsed.expenses) {
        store.data = parsed;
        store.save();
        showToast("Import Success", "Database state restored successfully.", "success");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showToast("Import Failure", "Invalid state format.", "danger");
      }
    } catch (err) {
      showToast("Parse Failure", "Unable to parse JSON file.", "danger");
    }
  };
  reader.readAsText(file);
}

// Factory reset triggers
function triggerFactoryReset() {
  const overlay = document.getElementById("modal-confirm");
  const desc = document.getElementById("confirm-modal-desc");
  const yesBtn = document.getElementById("confirm-modal-yes-btn");

  desc.textContent = "Are you absolutely sure you want to restore default mock environments? This deletes all manual transactions.";
  overlay.classList.add("active");

  yesBtn.onclick = () => {
    localStorage.removeItem("expense_flow_store");
    overlay.classList.remove("active");
    showToast("Wiped clean", "Restoring mock environments...", "success");
    setTimeout(() => window.location.reload(), 1000);
  };
}

function closeConfirmModal(event) {
  if (event === false || event.target === document.getElementById("modal-confirm")) {
    document.getElementById("modal-confirm").classList.remove("active");
  }
}

// ==========================================
// 15. MODAL FORM ACTIONS
// ==========================================

function openQuickAddModal(type) {
  const modal = document.getElementById("modal-quick-add");
  modal.classList.add("active");

  const expForm = document.getElementById("quick-add-expense-form-wrapper");
  const loanForm = document.getElementById("quick-add-loan-form-wrapper");
  const title = document.getElementById("quick-add-title");

  if (type === "expense") {
    title.textContent = "Quick Expense Log";
    expForm.style.display = "block";
    loanForm.style.display = "none";
  } else if (type === "loan") {
    title.textContent = "Quick Udhaar Log";
    expForm.style.display = "none";
    loanForm.style.display = "block";

    // Set default date
    document.getElementById("quick-loan-date").value = new Date().toISOString().substring(0, 10);
  }
}

function closeQuickAddModal(event) {
  if (event === null || event.target === document.getElementById("modal-quick-add")) {
    document.getElementById("modal-quick-add").classList.remove("active");
  }
}

function handleQuickExpense(e) {
  e.preventDefault();

  const amt = parseFloat(document.getElementById("quick-expense-amount").value);
  const cat = document.getElementById("quick-expense-category").value;
  const desc = document.getElementById("quick-expense-desc").value;

  const newExp = {
    id: `exp-${Date.now()}`,
    date: new Date().toISOString().substring(0, 10),
    category: cat,
    description: desc,
    amount: amt
  };

  store.data.expenses.push(newExp);
  store.save();

  // Clean inputs
  document.getElementById("quick-expense-amount").value = "";
  document.getElementById("quick-expense-desc").value = "";

  closeQuickAddModal(null);
  checkAuthRedirect(); // Redraw active view
  showToast("Logged Expense", `₹${amt} logged to ${cat}.`, "success");
}

function handleQuickLoan(e) {
  e.preventDefault();

  const type = document.getElementById("quick-loan-type").value;
  const friend = document.getElementById("quick-loan-friend").value;
  const amt = parseFloat(document.getElementById("quick-loan-amount").value);
  const date = document.getElementById("quick-loan-date").value;

  const newLog = {
    id: `udh-${Date.now()}`,
    friend,
    type,
    amount: amt,
    date,
    status: "pending"
  };

  store.data.udhaar.push(newLog);
  store.save();

  document.getElementById("quick-loan-friend").value = "";
  document.getElementById("quick-loan-amount").value = "";

  closeQuickAddModal(null);
  checkAuthRedirect();
  showToast("Ledger logged", `Registered debt log with ${friend}.`, "success");
}

// Reminders Modals
function openReminderModal() {
  document.getElementById("modal-reminder").classList.add("active");
  document.getElementById("reminder-date").value = new Date().toISOString().substring(0, 10);
}

function closeReminderModal(event) {
  if (event === null || event.target === document.getElementById("modal-reminder")) {
    document.getElementById("modal-reminder").classList.remove("active");
  }
}

function addReminder(e) {
  e.preventDefault();

  const title = document.getElementById("reminder-title").value;
  const amt = parseFloat(document.getElementById("reminder-amount").value);
  const date = document.getElementById("reminder-date").value;

  const newRem = {
    id: `rem-${Date.now()}`,
    title,
    amount: amt,
    date,
    notified: false
  };

  store.data.reminders.push(newRem);
  store.save();

  document.getElementById("reminder-title").value = "";
  document.getElementById("reminder-amount").value = "";

  closeReminderModal(null);
  renderDashboard();
  showToast("Reminder Configured", "Due notification scheduled.", "success");
}

// FAQ Toggles
function toggleFaq(btn) {
  const item = btn.parentElement;
  const active = item.classList.contains("active");

  document.querySelectorAll(".faq-item").forEach(i => i.classList.remove("active"));

  if (!active) {
    item.classList.add("active");
  }
}

// Contact submission
function handleContactSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("contact-name").value;
  showToast("Submission Recorded", `Thank you ${name}. Our developer circles will assess your requests.`, "success");

  document.getElementById("contact-name").value = "";
  document.getElementById("contact-email").value = "";
  document.getElementById("contact-message").value = "";
}

// Settings feedback review rating
let selectedRating = 0;
function rateStar(rating) {
  selectedRating = rating;
  const stars = document.querySelectorAll(".star");
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add("active");
    } else {
      star.classList.remove("active");
    }
  });
}

function handleFeedbackSubmit(e) {
  e.preventDefault();

  if (selectedRating === 0) {
    showToast("Feedback Warning", "Please select a star rating review score.", "warning");
    return;
  }

  showToast("Feedback Submitted", "Thank you for supporting ExpenseFlow!", "success");

  // Clear
  rateStar(0);
  document.getElementById("feedback-text").value = "";
}

// Notification bells panel triggers
function toggleNotifDropdown() {
  const dropdown = document.getElementById("notif-dropdown");
  dropdown.classList.toggle("active");

  // Render notification list
  const list = document.getElementById("notif-dropdown-list");
  list.innerHTML = "";

  const uid = getCurUserId();
  const curUser = store.data.currentUser;
  const notifs = (curUser && curUser.role === 'admin') 
    ? store.data.notifications 
    : getCurUserNotifications();

  if (notifs.length === 0) {
    list.innerHTML = '<p style="text-align: center; color: var(--text-muted); font-size: 0.8rem; padding: 20px;">No alerts documented.</p>';
    return;
  }

  notifs.forEach(notif => {
    const div = document.createElement("div");
    div.className = `notif-item ${notif.read ? '' : 'unread'}`;
    div.innerHTML = `
      <div class="notif-item-header">
        <span>${notif.title}</span>
        <span class="notif-item-time">${notif.time || 'Recent'}</span>
      </div>
      <div class="notif-item-body">${notif.body}</div>
    `;
    list.appendChild(div);
    notif.read = true; // Mark as read on open
  });

  const badge = document.getElementById("notif-badge-count");
  if (badge) badge.style.display = "none";

  store.save();
}

function clearNotifications() {
  const uid = getCurUserId();
  const curUser = store.data.currentUser;
  if (curUser && curUser.role === 'admin') {
    store.data.notifications = [];
  } else if (uid) {
    store.data.notifications = store.data.notifications.filter(n => n.userId && n.userId !== uid);
  }
  store.save();
  toggleNotifDropdown();
  const badge = document.getElementById("notif-badge-count");
  if (badge) badge.style.display = "none";
  showToast("Alerts Cleared", "Cleared notifications log.", "info");
}

// Cookie consent controls
function acceptCookies() {
  store.data.cookieConsent = true;
  store.save();
  document.getElementById("cookie-consent").classList.remove("active");
  showToast("Consent Saved", "Preference documented. We store data exclusively on LocalStorage.", "success");
}

function rejectCookies() {
  document.getElementById("cookie-consent").classList.remove("active");
  showToast("Preferences Recorded", "We will still store session configurations inside local caches.", "warning");
}

// ==========================================
// 12.5 CUSTOMER SERVICES SHOP & REQUEST TRACKER
// ==========================================

function renderServicesShop() {
  const container = document.getElementById("services-shop-grid");
  if (!container) return;

  container.innerHTML = "";

  const uid = getCurUserId();
  const services = store.data.services || [];
  const userOrders = store.data.orders.filter(o => o.userId === uid);

  services.forEach(srv => {
    // Check if user already ordered it and it's active
    const activeOrder = userOrders.find(o => o.serviceId === srv.id && ["pending", "in_progress"].includes(o.status));

    const card = document.createElement("div");
    card.className = "glass-card service-card";

    let btnText = "Order Service Guide";
    let btnClass = "btn-primary";
    let btnAttr = "";

    if (activeOrder) {
      btnText = `Request Active (${activeOrder.status === 'pending' ? 'Pending' : 'In Review'})`;
      btnClass = "btn-secondary";
      btnAttr = "disabled";
    }

    card.innerHTML = `
      <div style="flex: 1;">
        <span class="category-badge cat-shopping" style="margin-bottom: 12px; display: inline-block;">${srv.category}</span>
        <h3 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 8px;">${srv.name}</h3>
        <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.4;">${srv.description}</p>
      </div>
      <div class="service-price">₹${srv.price}</div>
      <button class="btn ${btnClass}" ${btnAttr} onclick="openRequestServiceModal('${srv.id}')" style="width: 100%; margin-top: auto;">${btnText}</button>
    `;

    container.appendChild(card);
  });
}

function openRequestServiceModal(serviceId) {
  const srv = store.data.services.find(s => s.id === serviceId);
  if (!srv) return;

  document.getElementById("req-service-id").value = srv.id;
  document.getElementById("req-service-name").textContent = srv.name;
  document.getElementById("req-service-desc").textContent = srv.description;
  document.getElementById("req-service-price").textContent = `Price: ₹${srv.price.toFixed(2)}`;
  document.getElementById("req-service-notes").value = "";

  document.getElementById("modal-request-service").classList.add("active");
}

function closeRequestServiceModal(event) {
  if (event === null || event.target === document.getElementById("modal-request-service")) {
    document.getElementById("modal-request-service").classList.remove("active");
  }
}

function submitServiceOrder(e) {
  e.preventDefault();
  const uid = getCurUserId();
  if (!uid) return;

  const srvId = document.getElementById("req-service-id").value;
  const notes = document.getElementById("req-service-notes").value.trim();

  const srv = store.data.services.find(s => s.id === srvId);
  if (!srv) return;

  // Real Wallet Balance check
  const monthlyLimit = getCurUserBudget().monthly;
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const totalMonthSpent = getCurUserExpenses().filter(e => e.date.substring(0, 7) === currentMonthStr).reduce((a, b) => a + b.amount, 0);
  const totalOrdersSpent = store.data.orders.filter(o => o.userId === uid).reduce((a, b) => a + b.price, 0);
  const walletBalance = monthlyLimit - totalMonthSpent - totalOrdersSpent;

  if (walletBalance < srv.price) {
    showToast("Transaction Blocked", `Insufficient wallet balance (₹${walletBalance.toFixed(2)}) to purchase this premium service (₹${srv.price.toFixed(2)}). Please increase your budget or lower your expenses.`, "danger");
    return;
  }

  const newOrder = {
    id: `ord-${Date.now()}`,
    userId: uid,
    serviceId: srvId,
    price: srv.price,
    status: "pending",
    date: new Date().toISOString(),
    notes: notes,
    auditNotes: ""
  };

  store.data.orders.push(newOrder);
  store.save();
  logActivity(uid, "order", "Requested Service", `Ordered ${srv.name} (₹${srv.price.toFixed(2)})`);

  // Add system notification alert
  store.data.notifications.push({
    id: `notif-${Date.now()}`,
    userId: uid,
    title: "Order Placed",
    body: `Your request for "${srv.name}" has been submitted for review.`,
    time: "Just now",
    read: false
  });
  store.save();

  closeRequestServiceModal(null);
  renderServicesShop();
  showToast("Request Placed", "Your request was registered successfully.", "success");
}

function renderMyRequests() {
  const container = document.getElementById("my-requests-list");
  if (!container) return;

  container.innerHTML = "";

  const uid = getCurUserId();
  const filterVal = document.getElementById("my-requests-filter").value;
  let list = store.data.orders.filter(o => o.userId === uid);

  if (filterVal !== "all") {
    list = list.filter(o => o.status === filterVal);
  }

  list.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (list.length === 0) {
    container.innerHTML = '<div class="glass-card" style="text-align: center; color: var(--text-muted); padding: 30px;">No requests found matching filters.</div>';
    return;
  }

  list.forEach(ord => {
    const srv = store.data.services.find(s => s.id === ord.serviceId) || { name: "Unknown Service", price: ord.price };

    const item = document.createElement("div");
    item.className = "glass-card";
    item.style.padding = "24px";
    item.style.borderLeft = "4px solid var(--border)";

    let borderCol = "var(--border)";
    if (ord.status === "pending") borderCol = "var(--warning)";
    else if (ord.status === "in_progress") borderCol = "var(--primary)";
    else if (ord.status === "completed") borderCol = "var(--success)";
    else if (ord.status === "rejected") borderCol = "var(--danger)";
    item.style.borderLeftColor = borderCol;

    const ordDate = new Date(ord.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    let step2Class = ord.status !== "pending" ? "completed" : "active";
    let step3Class = "";

    if (ord.status === "completed") step3Class = "completed";
    else if (ord.status === "rejected") step3Class = "rejected";
    else if (ord.status === "in_progress") step2Class = "active";

    let auditFeedbackMarkup = "";
    if (ord.status === "completed" && ord.auditNotes) {
      auditFeedbackMarkup = `
        <div style="margin-top: 16px; padding: 12px; background: var(--success-light); border-radius: var(--radius-xs); border: 1px solid var(--success-glow); color: var(--text-main);">
          <strong style="font-size: 0.85rem; display: block; color: var(--success); margin-bottom: 4px;">🎯 Administrator Audit Report:</strong>
          <p style="font-size: 0.8rem; line-height: 1.4;">${ord.auditNotes}</p>
        </div>
      `;
    } else if (ord.status === "rejected" && ord.auditNotes) {
      auditFeedbackMarkup = `
        <div style="margin-top: 16px; padding: 12px; background: var(--danger-light); border-radius: var(--radius-xs); border: 1px solid var(--danger-glow); color: var(--text-main);">
          <strong style="font-size: 0.85rem; display: block; color: var(--danger); margin-bottom: 4px;">❌ Rejection Details:</strong>
          <p style="font-size: 0.8rem; line-height: 1.4;">${ord.auditNotes}</p>
        </div>
      `;
    }

    item.innerHTML = `
      <div class="flex-between" style="margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
        <div>
          <h4 style="font-weight: 800; font-size: 1.1rem; color: var(--text-main);">${srv.name}</h4>
          <span style="font-size: 0.75rem; color: var(--text-muted);">Request ID: ${ord.id} • Submitted ${ordDate}</span>
        </div>
        <span class="badge-status ${ord.status}">${ord.status.replace('_', ' ')}</span>
      </div>
      
      <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 16px;">
        <strong>Your Notes:</strong> "${ord.notes}"
      </p>

      <div style="margin: 20px 0; border-top: 1px solid var(--border); padding-top: 16px; display: flex; justify-content: space-between; position: relative;">
        <div style="display: flex; flex-direction: column; align-items: center; flex: 1; text-align: center;">
          <div style="width: 24px; height: 24px; border-radius: 50%; background: var(--success); color: white; font-size: 0.75rem; display: flex; align-items: center; justify-content: center; font-weight: 700; margin-bottom: 6px;">✓</div>
          <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-main);">Requested</span>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; flex: 1; text-align: center;">
          <div style="width: 24px; height: 24px; border-radius: 50%; background: ${step2Class === 'completed' ? 'var(--success)' : (step2Class === 'active' ? 'var(--primary)' : 'var(--border)')}; color: white; font-size: 0.75rem; display: flex; align-items: center; justify-content: center; font-weight: 700; margin-bottom: 6px;">
            ${step2Class === 'completed' ? '✓' : '2'}
          </div>
          <span style="font-size: 0.75rem; font-weight: 700; color: ${step2Class === 'active' ? 'var(--primary)' : 'var(--text-muted)'};">In Review</span>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; flex: 1; text-align: center;">
          <div style="width: 24px; height: 24px; border-radius: 50%; background: ${step3Class === 'completed' ? 'var(--success)' : (step3Class === 'rejected' ? 'var(--danger)' : 'var(--border)')}; color: white; font-size: 0.75rem; display: flex; align-items: center; justify-content: center; font-weight: 700; margin-bottom: 6px;">
            ${step3Class === 'completed' ? '✓' : (step3Class === 'rejected' ? '✗' : '3')}
          </div>
          <span style="font-size: 0.75rem; font-weight: 700; color: ${step3Class !== '' ? (step3Class === 'completed' ? 'var(--success)' : 'var(--danger)') : 'var(--text-muted)'};">Fulfillment</span>
        </div>
      </div>

      ${auditFeedbackMarkup}
    `;

    container.appendChild(item);
  });
}

// ==========================================
// 16. ADMIN CONTROL PANEL CONTROLLERS
// ==========================================

let adminUsersCurrentPage = 1;
const adminUsersPerPage = 5;

let adminOrdersCurrentPage = 1;
const adminOrdersPerPage = 5;

let adminActivitiesCurrentPage = 1;
const adminActivitiesPerPage = 8;

// 16.1 ADMIN DASHBOARD
function renderAdminDashboard() {
  const users = store.data.users || [];
  const students = users.filter(u => u.role === "customer");
  const expenses = store.data.expenses || [];
  const orders = store.data.orders || [];

  // Metrics
  const statUsers = document.getElementById("admin-stat-users");
  if (statUsers) statUsers.textContent = students.length;

  const totalExpenseSum = expenses.reduce((a, b) => a + b.amount, 0);
  const statExpenses = document.getElementById("admin-stat-expenses");
  if (statExpenses) statExpenses.textContent = `₹${totalExpenseSum.toFixed(2)}`;

  const totalRev = orders.filter(o => o.status !== "rejected").reduce((a, b) => a + (b.price || 0), 0);
  const statRevenue = document.getElementById("admin-stat-revenue");
  if (statRevenue) statRevenue.textContent = `₹${totalRev.toFixed(2)}`;

  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const statPending = document.getElementById("admin-stat-pending-orders");
  if (statPending) statPending.textContent = pendingOrders;

  // Render Category Breakdown Bar Chart
  const sums = { Food: 0, Travel: 0, Books: 0, Shopping: 0, Entertainment: 0, Hostel: 0, Medical: 0, Miscellaneous: 0 };
  expenses.forEach(exp => {
    if (sums[exp.category] !== undefined) sums[exp.category] += exp.amount;
  });

  const catColors = {
    Food: "#e11d48",
    Travel: "#0369a1",
    Books: "#b45309",
    Shopping: "#7e22ce",
    Entertainment: "#a21caf",
    Hostel: "#047857",
    Medical: "#b91c1c",
    Miscellaneous: "#475569"
  };

  const chartData = Object.keys(sums).map(cat => ({
    label: cat.substring(0, 5),
    value: sums[cat],
    color: catColors[cat]
  }));

  drawBarChart("admin-svg-chart", chartData);

  // Recent Users List
  const recentUsersContainer = document.getElementById("admin-dashboard-recent-users");
  if (recentUsersContainer) {
    recentUsersContainer.innerHTML = "";
    const sortedUsers = [...users].reverse().slice(0, 4);
    sortedUsers.forEach(u => {
      const row = document.createElement("div");
      row.className = "flex-between";
      row.style.cssText = "padding: 8px 12px; background: var(--bg-tertiary); border-radius: var(--radius-xs); border: 1px solid var(--border);";
      row.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 28px; height: 28px; border-radius: 50%; background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem;">
            ${u.name ? u.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-main);">${u.name}</div>
            <div style="font-size: 0.7rem; color: var(--text-muted);">${u.college || u.email}</div>
          </div>
        </div>
        <span class="${u.isBlocked ? 'badge-blocked' : 'badge-active'}">${u.isBlocked ? 'Blocked' : (u.role === 'admin' ? 'Admin' : 'Active')}</span>
      `;
      recentUsersContainer.appendChild(row);
    });
  }
}

// 16.2 USER DIRECTORY
function renderAdminUsers() {
  filterAdminUsers();
}

function filterAdminUsers() {
  const tbody = document.getElementById("admin-users-tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  const search = (document.getElementById("admin-users-search")?.value || "").toLowerCase().trim();
  const roleFilter = document.getElementById("admin-users-role-filter")?.value || "all";
  const statusFilter = document.getElementById("admin-users-status-filter")?.value || "all";

  let list = store.data.users || [];

  if (roleFilter !== "all") {
    list = list.filter(u => u.role === roleFilter);
  }

  if (statusFilter === "active") {
    list = list.filter(u => !u.isBlocked);
  } else if (statusFilter === "blocked") {
    list = list.filter(u => u.isBlocked);
  }

  if (search) {
    list = list.filter(u =>
      (u.name && u.name.toLowerCase().includes(search)) ||
      (u.email && u.email.toLowerCase().includes(search)) ||
      (u.college && u.college.toLowerCase().includes(search))
    );
  }

  const totalItems = list.length;
  const totalPages = Math.ceil(totalItems / adminUsersPerPage) || 1;

  if (adminUsersCurrentPage > totalPages) adminUsersCurrentPage = totalPages;
  if (adminUsersCurrentPage < 1) adminUsersCurrentPage = 1;

  const startIndex = (adminUsersCurrentPage - 1) * adminUsersPerPage;
  const paginatedList = list.slice(startIndex, startIndex + adminUsersPerPage);

  const pageInfo = document.getElementById("admin-users-page-info");
  if (pageInfo) pageInfo.textContent = `Page ${adminUsersCurrentPage} of ${totalPages} (Total ${totalItems} profiles)`;
  const prevBtn = document.getElementById("admin-users-prev-btn");
  if (prevBtn) prevBtn.disabled = (adminUsersCurrentPage === 1);
  const nextBtn = document.getElementById("admin-users-next-btn");
  if (nextBtn) nextBtn.disabled = (adminUsersCurrentPage === totalPages);

  if (paginatedList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px;">No user profiles match the selected filters.</td></tr>';
    return;
  }

  paginatedList.forEach(u => {
    const tr = document.createElement("tr");
    const joinedStr = u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "N/A";
    const balance = u.walletBalance !== undefined ? u.walletBalance : 0;
    const isSelf = store.data.currentUser && store.data.currentUser.id === u.id;

    tr.innerHTML = `
      <td>
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem;">
            ${u.name ? u.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <div style="font-weight: 700; color: var(--text-main); font-size: 0.9rem;">${u.name}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${u.email}</div>
          </div>
        </div>
      </td>
      <td style="font-size: 0.85rem;">${u.college || 'Not set'}</td>
      <td>
        <span class="category-badge ${u.role === 'admin' ? 'cat-shopping' : 'cat-food'}" style="font-size: 0.7rem;">
          ${u.role === 'admin' ? 'Admin' : 'Student'}
        </span>
      </td>
      <td style="font-weight: 700;">₹${Number(balance).toFixed(2)}</td>
      <td style="font-size: 0.8rem; color: var(--text-muted);">${joinedStr}</td>
      <td>
        <span class="${u.isBlocked ? 'badge-blocked' : 'badge-active'}">
          ${u.isBlocked ? 'Blocked' : 'Active'}
        </span>
      </td>
      <td>
        <div class="action-btn-group">
          <button class="btn btn-secondary btn-sm" onclick="openAdminUserEditModal('${u.id}')" title="Edit Profile">
            ✏️ Edit
          </button>
          ${!isSelf ? `
            <button class="btn ${u.isBlocked ? 'btn-secondary' : 'btn-danger'} btn-sm" onclick="toggleUserBlock('${u.id}')" title="${u.isBlocked ? 'Unblock User' : 'Block User'}">
              ${u.isBlocked ? 'Unblock' : 'Block'}
            </button>
          ` : '<span style="font-size: 0.75rem; color: var(--text-muted);">You</span>'}
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function changeAdminUsersPage(dir) {
  adminUsersCurrentPage += dir;
  filterAdminUsers();
}

function openAdminUserEditModal(userId) {
  const user = (store.data.users || []).find(u => u.id === userId);
  if (!user) return;

  document.getElementById("admin-edit-user-id").value = user.id;
  document.getElementById("admin-edit-name").value = user.name || "";
  document.getElementById("admin-edit-email").value = user.email || "";
  document.getElementById("admin-edit-college").value = user.college || "";
  document.getElementById("admin-edit-role").value = user.role || "customer";
  document.getElementById("admin-edit-wallet").value = user.walletBalance !== undefined ? user.walletBalance : 0;

  document.getElementById("modal-admin-user-edit").classList.add("active");
}

function closeAdminUserEditModal(event) {
  if (event === null || event.target === document.getElementById("modal-admin-user-edit")) {
    document.getElementById("modal-admin-user-edit").classList.remove("active");
  }
}

function saveAdminUserEdit(e) {
  e.preventDefault();
  const uid = document.getElementById("admin-edit-user-id").value;
  const user = (store.data.users || []).find(u => u.id === uid);
  if (!user) return;

  user.name = document.getElementById("admin-edit-name").value.trim();
  user.email = document.getElementById("admin-edit-email").value.trim();
  user.college = document.getElementById("admin-edit-college").value.trim();
  user.role = document.getElementById("admin-edit-role").value;
  user.walletBalance = parseFloat(document.getElementById("admin-edit-wallet").value) || 0;

  // If edited current user, update session
  if (store.data.currentUser && store.data.currentUser.id === user.id) {
    store.data.currentUser.name = user.name;
    store.data.currentUser.email = user.email;
    store.data.currentUser.college = user.college;
    store.data.currentUser.role = user.role;
    updateUserAvatarLabels();
  }

  store.save();
  logActivity("admin", "auth", "User Profile Updated", `Updated details for ${user.name} (${user.email})`);
  closeAdminUserEditModal(null);
  renderAdminUsers();
  showToast("Profile Updated", `Saved changes for ${user.name}.`, "success");
}

function toggleUserBlock(userId) {
  const user = (store.data.users || []).find(u => u.id === userId);
  if (!user) return;

  user.isBlocked = !user.isBlocked;
  store.save();
  logActivity("admin", "auth", user.isBlocked ? "User Blocked" : "User Unblocked", `${user.name} was ${user.isBlocked ? 'blocked' : 'unblocked'} by admin.`);
  renderAdminUsers();
  showToast(user.isBlocked ? "User Blocked" : "User Unblocked", `${user.name} is now ${user.isBlocked ? 'blocked from accessing the workspace.' : 'active and restored.'}`, user.isBlocked ? "warning" : "success");
}

function openAdminUserAddModal() {
  document.getElementById("admin-user-add-form").reset();
  document.getElementById("modal-admin-user-add").classList.add("active");
}

function closeAdminUserAddModal(event) {
  if (event === null || event.target === document.getElementById("modal-admin-user-add")) {
    document.getElementById("modal-admin-user-add").classList.remove("active");
  }
}

function createAdminUserSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("admin-add-name").value.trim();
  const email = document.getElementById("admin-add-email").value.trim();
  const college = document.getElementById("admin-add-college").value.trim();
  const password = document.getElementById("admin-add-password").value;
  const role = document.getElementById("admin-add-role").value;
  const wallet = parseFloat(document.getElementById("admin-add-wallet").value) || 0;

  const exists = (store.data.users || []).some(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    showToast("Email Exists", "A user profile with this email address already exists.", "danger");
    return;
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    name,
    email,
    college,
    password,
    role,
    walletBalance: wallet,
    createdAt: new Date().toISOString(),
    isBlocked: false
  };

  store.data.users.push(newUser);
  store.save();
  logActivity("admin", "auth", "User Created", `Administrator created profile for ${name} (${role})`);
  closeAdminUserAddModal(null);
  renderAdminUsers();
  showToast("User Created", `Registered ${name} successfully.`, "success");
}

// 16.3 SERVICE ORDERS QUEUE
function renderAdminOrders() {
  filterAdminOrders();
}

function filterAdminOrders() {
  const tbody = document.getElementById("admin-orders-tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  const statusFilter = document.getElementById("admin-orders-status-filter")?.value || "all";
  const search = (document.getElementById("admin-orders-search")?.value || "").toLowerCase().trim();

  let list = store.data.orders || [];

  if (statusFilter !== "all") {
    list = list.filter(o => o.status === statusFilter);
  }

  if (search) {
    list = list.filter(o => {
      const u = (store.data.users || []).find(usr => usr.id === o.userId);
      const s = (store.data.services || []).find(srv => srv.id === o.serviceId);
      const userName = u ? u.name.toLowerCase() : "";
      const srvName = s ? s.name.toLowerCase() : "";
      const orderId = (o.id || "").toLowerCase();
      return userName.includes(search) || srvName.includes(search) || orderId.includes(search);
    });
  }

  list.sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalItems = list.length;
  const totalPages = Math.ceil(totalItems / adminOrdersPerPage) || 1;

  if (adminOrdersCurrentPage > totalPages) adminOrdersCurrentPage = totalPages;
  if (adminOrdersCurrentPage < 1) adminOrdersCurrentPage = 1;

  const startIndex = (adminOrdersCurrentPage - 1) * adminOrdersPerPage;
  const paginatedList = list.slice(startIndex, startIndex + adminOrdersPerPage);

  const pageInfo = document.getElementById("admin-orders-page-info");
  if (pageInfo) pageInfo.textContent = `Page ${adminOrdersCurrentPage} of ${totalPages} (Total ${totalItems} orders)`;
  const prevBtn = document.getElementById("admin-orders-prev-btn");
  if (prevBtn) prevBtn.disabled = (adminOrdersCurrentPage === 1);
  const nextBtn = document.getElementById("admin-orders-next-btn");
  if (nextBtn) nextBtn.disabled = (adminOrdersCurrentPage === totalPages);

  if (paginatedList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px;">No service orders match the criteria.</td></tr>';
    return;
  }

  paginatedList.forEach(ord => {
    const student = (store.data.users || []).find(u => u.id === ord.userId) || { name: "Unknown Student", email: "" };
    const srv = (store.data.services || []).find(s => s.id === ord.serviceId) || { name: "Advisory Service", price: ord.price };
    const ordDate = ord.date ? new Date(ord.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "N/A";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><code style="font-size: 0.75rem; background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px;">${ord.id}</code></td>
      <td>
        <div style="font-weight: 700; color: var(--text-main); font-size: 0.85rem;">${student.name}</div>
        <div style="font-size: 0.7rem; color: var(--text-muted);">${student.email}</div>
      </td>
      <td style="font-weight: 600; font-size: 0.85rem;">${srv.name}</td>
      <td style="font-weight: 700; color: var(--success);">₹${ord.price.toFixed(2)}</td>
      <td style="font-size: 0.8rem; color: var(--text-muted);">${ordDate}</td>
      <td><span class="badge-status ${ord.status}">${ord.status.replace('_', ' ')}</span></td>
      <td style="text-align: center;">
        <button class="btn btn-primary btn-sm" onclick="openAdminOrderActionModal('${ord.id}')">
          Audit / Review
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function changeAdminOrdersPage(dir) {
  adminOrdersCurrentPage += dir;
  filterAdminOrders();
}

function openAdminOrderActionModal(orderId) {
  const ord = (store.data.orders || []).find(o => o.id === orderId);
  if (!ord) return;

  const student = (store.data.users || []).find(u => u.id === ord.userId) || { name: "Student", email: "" };
  const srv = (store.data.services || []).find(s => s.id === ord.serviceId) || { name: "Service" };

  const summaryBox = document.getElementById("admin-order-summary-box");
  summaryBox.innerHTML = `
    <div class="flex-between" style="margin-bottom: 8px;">
      <strong style="font-size: 1rem; color: var(--text-main);">${srv.name}</strong>
      <span class="badge-status ${ord.status}">${ord.status.replace('_', ' ')}</span>
    </div>
    <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px;">
      Requested by <strong>${student.name}</strong> (${student.email}) • Fee: ₹${ord.price.toFixed(2)}
    </div>
    <div style="padding: 10px; background: var(--bg-secondary); border-radius: var(--radius-xs); border: 1px solid var(--border); font-size: 0.8rem; font-style: italic;">
      "${ord.notes || 'No custom notes provided.'}"
    </div>
  `;

  document.getElementById("admin-action-order-id").value = ord.id;
  document.getElementById("admin-action-status").value = ord.status;
  document.getElementById("admin-action-notes").value = ord.auditNotes || "";

  document.getElementById("modal-admin-order-action").classList.add("active");
}

function closeAdminOrderActionModal(event) {
  if (event === null || event.target === document.getElementById("modal-admin-order-action")) {
    document.getElementById("modal-admin-order-action").classList.remove("active");
  }
}

function submitAdminOrderAudit(e) {
  e.preventDefault();
  const ordId = document.getElementById("admin-action-order-id").value;
  const ord = (store.data.orders || []).find(o => o.id === ordId);
  if (!ord) return;

  const newStatus = document.getElementById("admin-action-status").value;
  const auditNotes = document.getElementById("admin-action-notes").value.trim();

  ord.status = newStatus;
  ord.auditNotes = auditNotes;

  const srv = (store.data.services || []).find(s => s.id === ord.serviceId) || { name: "Service" };

  // Notify student
  if (!store.data.notifications) store.data.notifications = [];
  store.data.notifications.push({
    id: `notif-${Date.now()}`,
    userId: ord.userId,
    title: `Order Status: ${newStatus.toUpperCase()}`,
    body: `Your request for "${srv.name}" has been updated to "${newStatus.replace('_', ' ')}". Check your requests timeline for details.`,
    time: "Just now",
    read: false
  });

  store.save();
  logActivity("admin", "order", "Service Order Updated", `Order ${ord.id} status changed to ${newStatus}`);
  closeAdminOrderActionModal(null);
  renderAdminOrders();
  showToast("Audit Saved", `Order ${ord.id} status updated to ${newStatus}.`, "success");
}

// 16.4 SYSTEM ACTIVITIES
function renderAdminActivities() {
  filterAdminActivities();
}

function filterAdminActivities() {
  const container = document.getElementById("admin-activities-list");
  if (!container) return;

  container.innerHTML = "";

  const filter = document.getElementById("admin-activities-filter")?.value || "all";
  let list = [...(store.data.activities || [])];

  if (filter !== "all") {
    list = list.filter(a => a.type === filter);
  }

  list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const totalItems = list.length;
  const totalPages = Math.ceil(totalItems / adminActivitiesPerPage) || 1;

  if (adminActivitiesCurrentPage > totalPages) adminActivitiesCurrentPage = totalPages;
  if (adminActivitiesCurrentPage < 1) adminActivitiesCurrentPage = 1;

  const startIndex = (adminActivitiesCurrentPage - 1) * adminActivitiesPerPage;
  const paginatedList = list.slice(startIndex, startIndex + adminActivitiesPerPage);

  const pageInfo = document.getElementById("admin-activities-page-info");
  if (pageInfo) pageInfo.textContent = `Page ${adminActivitiesCurrentPage} of ${totalPages} (Total ${totalItems} events)`;
  const prevBtn = document.getElementById("admin-activities-prev-btn");
  if (prevBtn) prevBtn.disabled = (adminActivitiesCurrentPage === 1);
  const nextBtn = document.getElementById("admin-activities-next-btn");
  if (nextBtn) nextBtn.disabled = (adminActivitiesCurrentPage === totalPages);

  if (paginatedList.length === 0) {
    container.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 30px;">No events recorded in this category.</div>';
    return;
  }

  paginatedList.forEach(act => {
    const user = (store.data.users || []).find(u => u.id === act.userId);
    const userName = user ? user.name : (act.userId === "admin" ? "Administrator" : "System");
    const timeStr = act.timestamp ? new Date(act.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "N/A";

    const item = document.createElement("div");
    item.className = `activity-item ${act.type || 'expense'}`;
    item.innerHTML = `
      <div style="flex: 1;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          <span style="font-weight: 800; font-size: 0.85rem; color: var(--text-main);">${act.action}</span>
          <span class="category-badge cat-food" style="font-size: 0.65rem; padding: 2px 6px;">${act.type}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted);">by ${userName}</span>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.3;">${act.details}</p>
      </div>
      <div style="font-size: 0.75rem; color: var(--text-muted); white-space: nowrap;">
        ${timeStr}
      </div>
    `;
    container.appendChild(item);
  });
}

function changeAdminActivitiesPage(dir) {
  adminActivitiesCurrentPage += dir;
  filterAdminActivities();
}

function clearAdminActivities() {
  store.data.activities = [];
  store.save();
  renderAdminActivities();
  showToast("Log Cleared", "System activity audit trail has been cleared.", "info");
}

// 16.5 BROADCAST CONSOLE
function renderAdminBroadcast() {
  const targetSelect = document.getElementById("admin-broadcast-target");
  if (targetSelect) {
    targetSelect.innerHTML = '<option value="all">📢 Broadcast to All Students</option>';
    (store.data.users || []).filter(u => u.role === "customer").forEach(u => {
      const opt = document.createElement("option");
      opt.value = u.id;
      opt.textContent = `👤 ${u.name} (${u.college || u.email})`;
      targetSelect.appendChild(opt);
    });
  }

  // Sent Broadcasts History
  const historyContainer = document.getElementById("admin-broadcast-history");
  if (historyContainer) {
    historyContainer.innerHTML = "";
    const notifs = (store.data.notifications || []).filter(n => n.userId === "all" || n.title.includes("Broadcast") || n.title.includes("Alert"));
    if (notifs.length === 0) {
      historyContainer.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem; padding: 20px; text-align: center;">No broadcast announcements sent yet.</div>';
    } else {
      [...notifs].reverse().slice(0, 5).forEach(n => {
        const card = document.createElement("div");
        card.style.cssText = "padding: 12px; background: var(--bg-tertiary); border-radius: var(--radius-xs); border: 1px solid var(--border);";
        card.innerHTML = `
          <div class="flex-between" style="margin-bottom: 4px;">
            <strong style="font-size: 0.9rem; color: var(--primary);">${n.title}</strong>
            <span style="font-size: 0.7rem; color: var(--text-muted);">${n.time || 'Recent'}</span>
          </div>
          <p style="font-size: 0.8rem; color: var(--text-main); line-height: 1.4;">${n.body}</p>
        `;
        historyContainer.appendChild(card);
      });
    }
  }
}

function sendAdminBroadcast(e) {
  e.preventDefault();
  const target = document.getElementById("admin-broadcast-target").value;
  const title = document.getElementById("admin-broadcast-title").value.trim();
  const body = document.getElementById("admin-broadcast-body").value.trim();

  if (!store.data.notifications) store.data.notifications = [];

  const newNotif = {
    id: `notif-${Date.now()}`,
    userId: target, // 'all' or specific uid
    title,
    body,
    time: "Just now",
    read: false
  };

  store.data.notifications.push(newNotif);
  store.save();
  logActivity("admin", "auth", "Dispatched Notification", `Broadcast "${title}" sent to ${target === 'all' ? 'All Students' : 'User ' + target}`);

  document.getElementById("admin-broadcast-title").value = "";
  document.getElementById("admin-broadcast-body").value = "";

  renderAdminBroadcast();
  showToast("Broadcast Dispatched", "Notification delivered successfully.", "success");
}

// 16.6 ADMIN SETTINGS & SYSTEM UTILITIES
function renderAdminSettings() {
  const container = document.getElementById("admin-pricing-list");
  if (!container) return;

  container.innerHTML = "";
  const services = store.data.services || [];

  services.forEach(srv => {
    const row = document.createElement("div");
    row.className = "flex-between";
    row.style.cssText = "gap: 12px; padding: 12px; background: var(--bg-tertiary); border-radius: var(--radius-xs); border: 1px solid var(--border); flex-wrap: wrap;";
    row.innerHTML = `
      <div style="flex: 1; min-width: 200px;">
        <span class="category-badge cat-shopping" style="font-size: 0.65rem; margin-bottom: 4px; display: inline-block;">${srv.category}</span>
        <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-main);">${srv.name}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">${srv.description}</div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-weight: 800; font-size: 0.9rem;">₹</span>
        <input type="number" class="form-input srv-price-input" data-srv-id="${srv.id}" value="${srv.price}" min="0" step="1" style="width: 100px; padding: 6px 10px; font-size: 0.9rem; font-weight: 700;" required>
      </div>
    `;
    container.appendChild(row);
  });
}

function saveServicePrices(e) {
  e.preventDefault();
  const inputs = document.querySelectorAll(".srv-price-input");
  inputs.forEach(inp => {
    const srvId = inp.getAttribute("data-srv-id");
    const newPrice = parseFloat(inp.value);
    const srv = (store.data.services || []).find(s => s.id === srvId);
    if (srv && !isNaN(newPrice)) {
      srv.price = newPrice;
    }
  });

  store.save();
  logActivity("admin", "order", "Catalog Pricing Updated", "Modified service catalog fees");
  showToast("Pricing Updated", "Service catalog prices saved.", "success");
}

function confirmResetDemoData() {
  const confirmed = confirm("Are you sure you want to restore the default demo dataset? Current session changes will be replaced.");
  if (confirmed) {
    localStorage.removeItem("expense_flow_store");
    window.location.reload();
  }
}

function confirmWipeDatabase() {
  const confirmed = confirm("CAUTION: This will permanently wipe all local database keys and log you out. Continue?");
  if (confirmed) {
    localStorage.clear();
    window.location.hash = "#home";
    window.location.reload();
  }
}

