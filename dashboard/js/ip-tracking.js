// IP Tracking Page Logic
async function loadIPTracking() {
  const tbody = document.getElementById('ip-tracking-table');

  try {
    const statusFilter = document.getElementById('ip-status-filter')?.value || '';

    const params = { limit: '100' };
    if (statusFilter) params.is_blocked = statusFilter;

    const ipData = await api.getIPTracking(params);
    const ips = ipData.data || [];

    if (ips.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No IPs tracked</td></tr>';
      return;
    }

    tbody.innerHTML = ips.map(ip => `
      <tr class="${ip.is_blocked ? 'row-blocked' : ''}">
        <td><code class="ip-code">${ip.ip}</code></td>
        <td class="text-muted">${formatDate(ip.first_seen)}</td>
        <td class="text-muted">${formatTimeAgo(ip.last_seen)}</td>
        <td><strong>${formatNumber(ip.request_count)}</strong></td>
        <td>${ip.failed_login_count > 0 ? `<span class="text-danger">${ip.failed_login_count}</span>` : '<span class="text-muted">0</span>'}</td>
        <td>${ip.is_blocked ? '<span class="badge badge-danger">Blocked</span>' : '<span class="badge badge-success">Active</span>'}</td>
        <td>
          ${ip.is_blocked
            ? `<button class="btn btn-success btn-sm" onclick="toggleIPAction('${ip.ip}', false)">Unblock</button>`
            : `<button class="btn btn-danger btn-sm" onclick="toggleIPAction('${ip.ip}', true)">Block</button>`
          }
        </td>
      </tr>
    `).join('');

  } catch (error) {
    console.error('Failed to load IP tracking:', error);
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Failed to load IP data</td></tr>';
  }
}

// Toggle IP Block/Unblock
async function toggleIPAction(ip, isBlocked) {
  const action = isBlocked ? 'block' : 'unblock';
  const reason = isBlocked ? 'Manually blocked from dashboard' : '';

  try {
    await api.blockIP(ip, isBlocked, reason);
    showToast(`IP ${action}ed successfully`, 'success');
    loadIPTracking();
  } catch (error) {
    console.error(`Failed to ${action} IP:`, error);
    showToast(`Failed to ${action} IP`, 'error');
  }
}

// Format date
function formatDate(timestamp) {
  if (!timestamp) return '--';
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Format time ago
function formatTimeAgo(timestamp) {
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

// Format number helper
function formatNumber(num) {
  if (num === undefined || num === null) return '--';
  return new Intl.NumberFormat().format(num);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  const refreshBtn = document.getElementById('refresh-ips');
  const statusFilter = document.getElementById('ip-status-filter');

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      refreshBtn.disabled = true;
      refreshBtn.textContent = 'Loading...';

      loadIPTracking().finally(() => {
        refreshBtn.disabled = false;
        refreshBtn.textContent = 'Refresh';
      });
    });
  }

  if (statusFilter) {
    statusFilter.addEventListener('change', loadIPTracking);
  }

  // Load initial data
  loadIPTracking();
});
