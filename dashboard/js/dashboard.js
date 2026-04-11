// Dashboard Page Logic
async function loadDashboard() {
  try {
    const dashboardData = await api.getDashboard();
    const data = dashboardData.data;

    // Update stats cards
    document.getElementById('total-requests').textContent = formatNumber(data.totalRequests);
    document.getElementById('active-alerts').textContent = formatNumber(data.activeAlerts);
    document.getElementById('blocked-ips').textContent = formatNumber(data.blockedIPs);
    document.getElementById('total-activities').textContent = formatNumber(data.totalActivities);

    // Update charts
    updateStatusChart(data.requestsByStatus);
    updateServiceChart(data.requestsByService);

    // Update activities table
    renderActivities(data.recentActivities);

    // Update alerts table (critical ones)
    await loadCriticalAlerts();

    // Update timestamp
    updateLastRefresh();

  } catch (error) {
    console.error('Failed to load dashboard:', error);
    showToast('Failed to load dashboard data', 'error');
  }
}

// Render Activities Table
function renderActivities(activities) {
  const tbody = document.getElementById('activities-table');
  const countEl = document.getElementById('activity-count');

  if (!activities || activities.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="empty-state">No activities recorded</td></tr>';
    countEl.textContent = '0';
    return;
  }

  countEl.textContent = activities.length;

  tbody.innerHTML = activities.map(activity => `
    <tr>
      <td><strong>${formatAction(activity.action)}</strong></td>
      <td>${formatNumber(activity.count)}</td>
      <td class="text-muted">Last 24 hours</td>
    </tr>
  `).join('');
}

// Load Critical Alerts
async function loadCriticalAlerts() {
  try {
    const alertsData = await api.getAlerts({ is_resolved: 'false', limit: '5' });
    const alerts = alertsData.data || [];
    const tbody = document.getElementById('alerts-table');
    const countEl = document.getElementById('critical-count');

    if (alerts.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="empty-state">No active alerts</td></tr>';
      countEl.textContent = '0';
      return;
    }

    countEl.textContent = alerts.length;

    tbody.innerHTML = alerts.map(alert => `
      <tr>
        <td><span class="badge badge-${alert.severity}">${formatAlertType(alert.type)}</span></td>
        <td class="text-truncate" style="max-width: 300px;">${truncate(alert.message, 60)}</td>
        <td class="text-muted">${formatTime(alert.created_at)}</td>
      </tr>
    `).join('');

  } catch (error) {
    console.error('Failed to load alerts:', error);
  }
}

// Format helpers
function formatNumber(num) {
  if (num === undefined || num === null) return '--';
  return new Intl.NumberFormat().format(num);
}

function formatAction(action) {
  return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatAlertType(type) {
  return type.replace(/_/g, ' ').toUpperCase();
}

function formatTime(timestamp) {
  if (!timestamp) return '--';
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
  return `${Math.floor(diffMin / 1440)}d ago`;
}

function truncate(str, maxLength) {
  if (!str) return '';
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
}

function updateLastRefresh() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  document.querySelector('.last-update').textContent = `Last: ${timeStr}`;
}

// Refresh button
document.addEventListener('DOMContentLoaded', () => {
  const refreshBtn = document.getElementById('refresh-dashboard');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      refreshBtn.disabled = true;
      refreshBtn.textContent = 'Loading...';

      loadDashboard().finally(() => {
        refreshBtn.disabled = false;
        refreshBtn.textContent = 'Refresh';
        showToast('Dashboard refreshed', 'success');
      });
    });
  }
});
