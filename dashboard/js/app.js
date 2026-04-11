// Main App Logic - Navigation & Initialization
const App = {
  currentPage: 'dashboard',
  refreshIntervals: {},

  init() {
    this.setupNavigation();
    this.setupAutoRefresh();
    this.loadInitialPage();

    console.log('Dashboard initialized');
  },

  // Setup Page Navigation
  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const page = item.dataset.page;
        if (page && page !== this.currentPage) {
          this.navigateTo(page);
        }
      });
    });
  },

  // Navigate to Page
  navigateTo(page) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.page === page) {
        item.classList.add('active');
      }
    });

    // Update pages
    document.querySelectorAll('.page').forEach(p => {
      p.classList.remove('active');
    });

    const targetPage = document.getElementById(`${page}-page`);
    if (targetPage) {
      targetPage.classList.add('active');
    }

    this.currentPage = page;

    // Load page-specific data
    this.loadPageData(page);

    console.log(`Navigated to: ${page}`);
  },

  // Load Page Data
  loadPageData(page) {
    switch (page) {
      case 'dashboard':
        loadDashboard();
        break;
      case 'anomaly':
        loadAnomalyStats();
        break;
      case 'alerts':
        loadAlerts();
        break;
      case 'ip-tracking':
        loadIPTracking();
        break;
      case 'logs':
        loadRequestLogs();
        break;
    }
  },

  // Setup Auto-Refresh
  setupAutoRefresh() {
    // Auto-refresh dashboard every 30 seconds
    this.refreshIntervals.dashboard = setInterval(() => {
      if (this.currentPage === 'dashboard') {
        loadDashboard();
      }
    }, 30000);

    // Auto-refresh anomaly stats every 60 seconds
    this.refreshIntervals.anomaly = setInterval(() => {
      if (this.currentPage === 'anomaly') {
        loadAnomalyStats();
      }
    }, 60000);

    console.log('Auto-refresh enabled');
  },

  // Load Initial Page
  loadInitialPage() {
    this.loadPageData('dashboard');
  },

  // Cleanup on page unload
  cleanup() {
    Object.values(this.refreshIntervals).forEach(interval => {
      clearInterval(interval);
    });
  },
};

// Toast Notification System
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');

  toast.textContent = message;
  toast.className = `toast ${type}`;

  setTimeout(() => {
    toast.classList.remove('hidden');
  }, 100);

  setTimeout(() => {
    toast.classList.add('hidden');
  }, 4000);
}

// Utility Functions (Global)
window.formatNumber = function(num) {
  if (num === undefined || num === null) return '--';
  return new Intl.NumberFormat().format(num);
};

window.truncate = function(str, maxLength) {
  if (!str) return '';
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
};

window.formatTime = function(timestamp) {
  if (!timestamp) return '--';
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
  return `${Math.floor(diffMin / 1440)}d ago`;
};

window.formatDateTime = function(timestamp) {
  if (!timestamp) return '--';
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

window.showToast = showToast;

// Initialize App on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();

  // Initialize charts
  initCharts();

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    App.cleanup();
  });
});

// Handle page visibility (pause/resume auto-refresh)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log('Page hidden - pausing auto-refresh');
  } else {
    console.log('Page visible - resuming auto-refresh');
    App.loadPageData(App.currentPage);
  }
});
