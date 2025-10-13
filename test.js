// === Temperatur-Chart ===
const ctx = document.getElementById('myChart');
let myChart;

// Chart-Konfiguration mit leeren Daten
const config = {
  type: 'line',
  data: {
    labels: [],
    datasets: []
  },
  options: {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Temperaturverlauf der letzten 30 Tage' },
    },
    scales: {
      x: {
        title: { display: true, text: 'Datum' },
        ticks: {
          font: { size: 9 },
          callback: function(value) {
            const label = this.getLabelForValue(value);
            const date = new Date(label);
            if (!isNaN(date)) {
              return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
            }
            return label;
          }
        }
      },
      y: {
        beginAtZero: false,
        title: { display: true, text: 'Temperatur (°C)' }
      }
    }
  }
};

// Chart initialisieren
myChart = new Chart(ctx, config);

// === Temperaturdaten laden ===
function updateChart() {
  fetch("https://im3garden.laraeberhard.ch/etl-boilerplate/unload.php")
    .then(response => response.json())
    .then(jsonData => {
      config.data.labels = [];
      config.data.datasets = [];

      const grouped = {};
      jsonData.forEach(item => {
        const date = item.time.split(' ')[0];
        if (!grouped[item.city]) grouped[item.city] = [];
        grouped[item.city].push({ date, temperatur: item.temperatur });
      });

      const allDates = [...new Set(jsonData.map(i => i.time.split(' ')[0]))].sort();
      config.data.labels = allDates;

      const colors = ['#FF0000', '#0000FF', '#008000', '#FFA500', '#800080', '#008080', '#A52A2A'];

      Object.keys(grouped).forEach((city, i) => {
        const temps = allDates.map(date => {
          const record = grouped[city].find(d => d.date === date);
          return record ? record.temperatur : null;
        });

        config.data.datasets.push({
          label: city,
          data: temps,
          borderColor: colors[i % colors.length],
          backgroundColor: colors[i % colors.length] + '80',
          tension: 0.3,
          hidden: i > 2
        });
      });

      myChart.update();
    })
    .catch(console.error);
}

updateChart();


// === UV-Index-Chart ===
const ctx2 = document.getElementById('myChart2');
let myChart2;

const config2 = {
  type: 'line',
  data: { labels: [], datasets: [] },
  options: {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'UV-Index der letzten 30 Tage' },
    },
    scales: {
      x: {
        title: { display: true, text: 'Datum' },
        ticks: {
          font: { size: 9 },
          callback: function(value) {
            const label = this.getLabelForValue(value);
            const date = new Date(label);
            if (!isNaN(date)) {
              return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
            }
            return label;
          }
        }
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'UV-Index' }
      }
    }
  }
};

myChart2 = new Chart(ctx2, config2);

function updateChart2() {
  fetch("https://im3garden.laraeberhard.ch/etl-boilerplate/unload.php")
    .then(response => response.json())
    .then(jsonData => {
      config2.data.labels = [];
      config2.data.datasets = [];

      const grouped = {};
      jsonData.forEach(item => {
        const date = item.time.split(' ')[0];
        if (!grouped[item.city]) grouped[item.city] = [];
        grouped[item.city].push({ date, uvi: item.uvi });
      });

      const allDates = [...new Set(jsonData.map(i => i.time.split(' ')[0]))].sort();
      config2.data.labels = allDates;

      const colors = ['#FF0000', '#0000FF', '#008000', '#FFA500', '#800080', '#008080', '#A52A2A'];

      Object.keys(grouped).forEach((city, i) => {
        const uviData = allDates.map(date => {
          const record = grouped[city].find(d => d.date === date);
          return record ? record.uvi : null;
        });

        config2.data.datasets.push({
          label: city,
          data: uviData,
          borderColor: colors[i % colors.length],
          backgroundColor: colors[i % colors.length] + '80',
          tension: 0.3,
          hidden: i > 2
        });
      });

      myChart2.update();
    })
    .catch(console.error);
}

updateChart2();


// === Regen-Chart ===
const ctx3 = document.getElementById('myChart3');
let myChart3;

const config3 = {
  type: 'bar',
  data: { labels: [], datasets: [] },
  options: {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Niederschlag der letzten 30 Tage' },
    },
    scales: {
      x: {
        title: { display: true, text: 'Datum' },
        ticks: {
          font: { size: 9 },
          callback: function(value) {
            const label = this.getLabelForValue(value);
            const date = new Date(label);
            if (!isNaN(date)) {
              return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
            }
            return label;
          }
        }
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Regen (mm)' }
      }
    }
  }
};

myChart3 = new Chart(ctx3, config3);

function updateChart3() {
  fetch("https://im3garden.laraeberhard.ch/etl-boilerplate/unload.php")
    .then(response => response.json())
    .then(jsonData => {
      config3.data.labels = [];
      config3.data.datasets = [];

      const grouped = {};
      jsonData.forEach(item => {
        const date = item.time.split(' ')[0];
        if (!grouped[item.city]) grouped[item.city] = [];
        grouped[item.city].push({ date, rain: item.rain });
      });

      const allDates = [...new Set(jsonData.map(i => i.time.split(' ')[0]))].sort();
      config3.data.labels = allDates;

      const colors = ['#FF0000', '#0000FF', '#008000', '#FFA500', '#800080', '#008080', '#A52A2A'];

      Object.keys(grouped).forEach((city, i) => {
        const rainData = allDates.map(date => {
          const record = grouped[city].find(d => d.date === date);
          return record ? record.rain : null;
        });

        config3.data.datasets.push({
          label: city,
          data: rainData,
          backgroundColor: colors[i % colors.length] + '80',
          borderColor: colors[i % colors.length],
          borderWidth: 1,
          hidden: i > 2
        });
      });

      myChart3.update();
    })
    .catch(console.error);
}

updateChart3();

// === Optional: tägliche Aktualisierung ===
setInterval(() => {
  updateChart();
  updateChart2();
  updateChart3();
}, 86_400_000);
