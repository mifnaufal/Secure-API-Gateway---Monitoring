// Request Logs Page Logic
async function loadRequestLogs() {
  const tbody = document.getElementById('request-logs-table');

  try {
    const statusFilter = document.getElementById('log-status-filter')?.value || '';
    const serviceFilter = document.getElementById('log-service-filter')?.value || '';

    const params = { limit: '100' };
    if (statusFilter) params.status_code = statusFilter;
    if (serviceFilter) params.service = serviceFilter;

    const logsData = await api.getRequestLogs(params);
    const logs = logsData.data || [];

    if (logs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No request logs found</td></tr>';
      return;
    }

    tbody.innerHTML = logs.map(log => `
      <tr>
        <td class="text-muted">${formatDateTime(log.timestamp)}</td>
        <td><span class="method-badge method-${log.method.toLowerCase()}">${log.method}</span></td>
        <td><code class="url-code">${truncate(log.url, 50)}</code></td>
        <td>${getStatusBadge(log.status_code)}</td>
        <td class="text-muted">${log.duration || '--'}</td>
        <td><code class="ip-code">${log.ip || '--'}</code></td>
        <td><span class="service-badge">${log.service || 'gateway'}</span></td>
      </tr>
    `).join('');

  } catch (error) {
    console.error('Failed to load request logs:', error);
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Failed to load logs</td></tr>';
  }
}

// Get status badge HTML
function getStatusBadge(statusCode) {
  if (!statusCode) return '<span class="badge badge-info">--</span>';

  const code = parseInt(statusCode);

  if (code >= 200 && code < 300) {
    return `<span class="badge badge-success">${code}</span>`;
  } else if (code >= 300 && code < 400) {
    return `<span class="badge badge-info">${code}</span>`;
  } else if (code >= 400 && code < 500) {
    return `<span class="badge badge-warning">${code}</span>`;
  } else if (code >= 500) {
    return `<span class="badge badge-danger">${code}</span>`;
  }

  return `<span class="badge badge-info">${code}</span>`;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  const refreshBtn = document.getElementById('refresh-logs');
  const statusFilter = document.getElementById('log-status-filter');
  const serviceFilter = document.getElementById('log-service-filter');

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      refreshBtn.disabled = true;
      refreshBtn.textContent = 'Loading...';

      loadRequestLogs().finally(() => {
        refreshBtn.disabled = false;
        refreshBtn.textContent = 'Refresh';
      });
    });
  }

  if (statusFilter) {
    statusFilter.addEventListener('change', loadRequestLogs);
  }

  if (serviceFilter) {
    serviceFilter.addEventListener('change', loadRequestLogs);
  }

  // Load initial data
  loadRequestLogs();
});
