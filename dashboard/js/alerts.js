// Alerts Page Logic
async function loadAlerts() {
  const tbody = document.getElementById('all-alerts-table');

  try {
    const severity = document.getElementById('alert-severity-filter')?.value || '';
    const status = document.getElementById('alert-status-filter')?.value || '';

    const params = { limit: '100' };
    if (severity) params.severity = severity;
    if (status) params.is_resolved = status;

    const alertsData = await api.getAlerts(params);
    const alerts = alertsData.data || [];

    if (alerts.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No alerts found</td></tr>';
      return;
    }

    tbody.innerHTML = alerts.map(alert => `
      <tr>
        <td><strong>${formatAlertType(alert.type)}</strong></td>
        <td><span class="badge badge-${alert.severity}">${alert.severity}</span></td>
        <td style="max-width: 300px;">${truncate(alert.message, 80)}</td>
        <td class="text-muted">${formatDateTime(alert.created_at)}</td>
        <td>${alert.is_resolved ? '<span class="badge badge-success">Resolved</span>' : '<span class="badge badge-warning">Active</span>'}</td>
        <td>
          ${!alert.is_resolved ? `<button class="btn btn-success btn-sm" onclick="resolveAlertAction('${alert.id}')">Resolve</button>` : '<span class="text-muted">--</span>'}
        </td>
      </tr>
    `).join('');

  } catch (error) {
    console.error('Failed to load alerts:', error);
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Failed to load alerts</td></tr>';
  }
}

// Resolve Alert Action
async function resolveAlertAction(alertId) {
  try {
    await api.resolveAlert(alertId);
    showToast('Alert resolved', 'success');
    loadAlerts();
  } catch (error) {
    console.error('Failed to resolve alert:', error);
    showToast('Failed to resolve alert', 'error');
  }
}

// Format alert type
function formatAlertType(type) {
  if (!type) return '--';
  return type.replace(/_/g, ' ').toUpperCase();
}

// Format date with time
function formatDateTime(timestamp) {
  if (!timestamp) return '--';
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  const refreshBtn = document.getElementById('refresh-alerts');
  const severityFilter = document.getElementById('alert-severity-filter');
  const statusFilter = document.getElementById('alert-status-filter');

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      refreshBtn.disabled = true;
      refreshBtn.textContent = 'Loading...';

      loadAlerts().finally(() => {
        refreshBtn.disabled = false;
        refreshBtn.textContent = 'Refresh';
      });
    });
  }

  if (severityFilter) {
    severityFilter.addEventListener('change', loadAlerts);
  }

  if (statusFilter) {
    statusFilter.addEventListener('change', loadAlerts);
  }

  // Load initial data
  loadAlerts();
});
