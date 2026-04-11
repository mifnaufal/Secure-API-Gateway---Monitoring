// Anomaly Analysis Page Logic
let autoDetectEnabled = true;
let autoDetectInterval = null;

async function loadAnomalyStats() {
  try {
    const statsData = await api.getTrafficStats();
    const stats = statsData.data;

    if (!stats) return;

    // Update traffic stats
    document.getElementById('req-5min').textContent = formatNumber(stats.requests?.last5Min || 0);
    document.getElementById('req-1hour').textContent = formatNumber(stats.requests?.lastHour || 0);
    document.getElementById('req-24hour').textContent = formatNumber(stats.requests?.last24Hours || 0);
    document.getElementById('error-rate').textContent = stats.errorRate || '--';

    // Update top endpoints
    renderTopEndpoints(stats.topEndpoints || []);

    // Update top IPs
    await renderTopIPs(stats.topIPs || []);

  } catch (error) {
    console.error('Failed to load anomaly stats:', error);
  }
}

// Render Top Endpoints
function renderTopEndpoints(endpoints) {
  const tbody = document.getElementById('top-endpoints');

  if (endpoints.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="empty-state">No endpoint data</td></tr>';
    return;
  }

  const totalRequests = endpoints.reduce((sum, ep) => sum + parseInt(ep.count), 0);

  tbody.innerHTML = endpoints.map(ep => {
    const count = parseInt(ep.count);
    const percentage = totalRequests > 0 ? ((count / totalRequests) * 100).toFixed(1) : 0;

    return `
      <tr>
        <td><code class="endpoint-code">${ep.url}</code></td>
        <td><strong>${formatNumber(count)}</strong></td>
        <td>
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${percentage}%; background-color: var(--accent-primary);"></div>
          </div>
          <span class="progress-text">${percentage}%</span>
        </td>
      </tr>
    `;
  }).join('');
}

// Render Top IPs with status
async function renderTopIPs(ips) {
  const tbody = document.getElementById('top-ips');

  if (ips.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="empty-state">No IP data</td></tr>';
    return;
  }

  // Get blocked IPs to check status
  let blockedIPs = new Set();
  try {
    const ipData = await api.getIPTracking({ is_blocked: 'true', limit: '100' });
    blockedIPs = new Set((ipData.data || []).map(item => item.ip));
  } catch (error) {
    console.error('Failed to load blocked IPs:', error);
  }

  tbody.innerHTML = ips.map(ip => {
    const isBlocked = blockedIPs.has(ip.ip);
    const statusBadge = isBlocked
      ? '<span class="badge badge-danger">Blocked</span>'
      : '<span class="badge badge-success">Active</span>';

    return `
      <tr>
        <td><code class="ip-code">${ip.ip}</code></td>
        <td><strong>${formatNumber(ip.count)}</strong></td>
        <td>${statusBadge}</td>
      </tr>
    `;
  }).join('');
}

// Run Anomaly Analysis
async function runAnomalyAnalysis() {
  const resultsDiv = document.getElementById('anomaly-results');
  const countEl = document.getElementById('anomaly-count');

  resultsDiv.innerHTML = '<div class="loading">Analyzing traffic patterns...</div>';

  try {
    const analysisData = await api.analyzeAnomalies();
    const anomalies = analysisData.anomalies || [];

    countEl.textContent = anomalies.length;

    if (anomalies.length === 0) {
      resultsDiv.innerHTML = '<div class="empty-state">No anomalies detected. Traffic patterns are normal.</div>';
      showToast('No anomalies detected', 'success');
      return;
    }

    // Sort by severity
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    anomalies.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    resultsDiv.innerHTML = anomalies.map(anomaly => `
      <div class="anomaly-item ${anomaly.severity}">
        <div class="anomaly-header">
          <span class="anomaly-type">${formatAnomalyType(anomaly.type)}</span>
          <span class="anomaly-severity ${anomaly.severity}">${anomaly.severity}</span>
        </div>
        <div class="anomaly-message">${anomaly.message}</div>
        ${anomaly.details ? `<div class="anomaly-details">${JSON.stringify(anomaly.details, null, 2)}</div>` : ''}
      </div>
    `).join('');

    // Show toast based on severity
    const hasCritical = anomalies.some(a => a.severity === 'critical');
    if (hasCritical) {
      showToast(`${anomalies.length} anomalies detected (${anomalies.filter(a => a.severity === 'critical').length} critical)`, 'error');
    } else {
      showToast(`${anomalies.length} anomalies detected`, 'warning');
    }

  } catch (error) {
    console.error('Failed to run anomaly analysis:', error);
    resultsDiv.innerHTML = '<div class="empty-state">Failed to run analysis. Check monitoring service.</div>';
    showToast('Analysis failed', 'error');
  }
}

// Toggle Auto-Detect
function toggleAutoDetect() {
  autoDetectEnabled = !autoDetectEnabled;
  const statusEl = document.getElementById('auto-detect-status');
  const btn = document.getElementById('toggle-auto-detect');

  if (autoDetectEnabled) {
    statusEl.textContent = 'ON';
    btn.classList.remove('btn-secondary');
    btn.classList.add('btn-primary');
    startAutoDetect();
    showToast('Auto-detect enabled', 'success');
  } else {
    statusEl.textContent = 'OFF';
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-secondary');
    stopAutoDetect();
    showToast('Auto-detect disabled', 'warning');
  }
}

function startAutoDetect() {
  if (autoDetectInterval) clearInterval(autoDetectInterval);

  autoDetectInterval = setInterval(() => {
    runAnomalyAnalysis();
  }, 60000); // Every minute

  // Run immediately
  runAnomalyAnalysis();
}

function stopAutoDetect() {
  if (autoDetectInterval) {
    clearInterval(autoDetectInterval);
    autoDetectInterval = null;
  }
}

// Format anomaly type
function formatAnomalyType(type) {
  return type.replace(/_/g, ' ').toUpperCase();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  const runBtn = document.getElementById('run-analysis');
  const toggleBtn = document.getElementById('toggle-auto-detect');

  if (runBtn) {
    runBtn.addEventListener('click', () => {
      runBtn.disabled = true;
      runBtn.textContent = 'Analyzing...';

      runAnomalyAnalysis().finally(() => {
        runBtn.disabled = false;
        runBtn.textContent = 'Run Analysis';
      });
    });
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleAutoDetect);
    toggleBtn.classList.add('btn-primary');
  }

  // Load initial stats
  loadAnomalyStats();

  // Start auto-detect by default
  startAutoDetect();
});
