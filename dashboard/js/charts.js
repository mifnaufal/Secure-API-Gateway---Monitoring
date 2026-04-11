// Chart Configuration and Helpers
const chartConfig = {
  colors: {
    blue: '#3b82f6',
    green: '#10b981',
    yellow: '#f59e0b',
    red: '#ef4444',
    cyan: '#06b6d4',
    purple: '#8b5cf6',
    pink: '#ec4899',
    orange: '#f97316',
  },

  gridColor: 'rgba(148, 163, 184, 0.1)',
  textColor: '#94a3b8',
};

let statusChart = null;
let serviceChart = null;

// Initialize Status Chart (Bar)
function initStatusChart() {
  const ctx = document.getElementById('status-chart');
  if (!ctx) return;

  if (statusChart) {
    statusChart.destroy();
  }

  statusChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{
        label: 'Requests',
        data: [],
        backgroundColor: chartConfig.colors.blue,
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: '#1e293b',
          titleColor: '#f8fafc',
          bodyColor: '#94a3b8',
          borderColor: '#334155',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
        }
      },
      scales: {
        x: {
          grid: {
            color: chartConfig.gridColor,
          },
          ticks: {
            color: chartConfig.textColor,
          }
        },
        y: {
          grid: {
            color: chartConfig.gridColor,
          },
          ticks: {
            color: chartConfig.textColor,
          },
          beginAtZero: true,
        }
      }
    }
  });
}

// Update Status Chart
function updateStatusChart(data) {
  if (!statusChart || !data || !Array.isArray(data)) return;

  statusChart.data.labels = data.map(item => `HTTP ${item.status_code}`);
  statusChart.data.datasets[0].data = data.map(item => parseInt(item.count));

  // Color code by status
  statusChart.data.datasets[0].backgroundColor = data.map(item => {
    const status = parseInt(item.status_code);
    if (status >= 200 && status < 300) return chartConfig.colors.green;
    if (status >= 300 && status < 400) return chartConfig.colors.blue;
    if (status >= 400 && status < 500) return chartConfig.colors.yellow;
    if (status >= 500) return chartConfig.colors.red;
    return chartConfig.colors.blue;
  });

  statusChart.update();
}

// Initialize Service Chart (Doughnut)
function initServiceChart() {
  const ctx = document.getElementById('service-chart');
  if (!ctx) return;

  if (serviceChart) {
    serviceChart.destroy();
  }

  const colors = [chartConfig.colors.blue, chartConfig.colors.green, chartConfig.colors.yellow, chartConfig.colors.red, chartConfig.colors.cyan];

  serviceChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: colors,
        borderWidth: 0,
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: chartConfig.textColor,
            padding: 15,
            usePointStyle: true,
            pointStyleWidth: 10,
          }
        },
        tooltip: {
          backgroundColor: '#1e293b',
          titleColor: '#f8fafc',
          bodyColor: '#94a3b8',
          borderColor: '#334155',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
        }
      }
    }
  });
}

// Update Service Chart
function updateServiceChart(data) {
  if (!serviceChart || !data || !Array.isArray(data)) return;

  serviceChart.data.labels = data.map(item => item.service);
  serviceChart.data.datasets[0].data = data.map(item => parseInt(item.count));
  serviceChart.update();
}

// Initialize all charts
function initCharts() {
  initStatusChart();
  initServiceChart();
}
