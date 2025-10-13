// // === Chart Setup ===

// Canvas vorbereiten
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
            font: {
                size: 9  // 👈 kleinerer Text (Standard ist ~12)
              },
            callback: function(value, index, values) {
              const label = this.getLabelForValue(value);
              const date = new Date(label);
              if (!isNaN(date)) {
                // „08.10“ statt vollem Zeitstempel
                return date.toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: '2-digit'
                });
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

// === Daten abrufen & Chart aktualisieren ===
function updateChart() {
  fetch("https://im3garden.laraeberhard.ch/etl-boilerplate/unload.php")
    .then(response => response.json())
    .then(jsonData => {
      console.log("Neue Daten geladen:", jsonData);

      // 1️⃣ Bestehende Daten im Chart leeren
      config.data.labels = [];
      config.data.datasets = [];

      // 2️⃣ Daten nach Stadt gruppieren
      const grouped = {};
      jsonData.forEach(item => {
        const date = item.time.split(' ')[0]; // Nur das Datum (YYYY-MM-DD)
        if (!grouped[item.city]) grouped[item.city] = [];
        grouped[item.city].push({ date: date, temperatur: item.temperatur });
      });

      // 3️⃣ Alle vorhandenen Daten (Datenbankumfang!) automatisch sammeln und sortieren
      const allDates = [...new Set(jsonData.map(item => item.time.split(' ')[0]))].sort();
      config.data.labels = allDates;

      // 4️⃣ Farben definieren (automatisch wiederverwendet, wenn mehr Städte)
      const colors = [
        '#FF0000', '#0000FF', '#008000',
        '#FFA500', '#800080', '#008080', '#A52A2A'
      ];

      // 5️⃣ Für jede Stadt eine Linie erstellen
      Object.keys(grouped).forEach((city, index) => {
        // Temperaturwerte passend zu allen Datumslabels (auch mit Lücken)
        const temps = allDates.map(date => {
          const record = grouped[city].find(d => d.date === date);
          return record ? record.temperatur : null;
        });

        config.data.datasets.push({
          label: city,
          data: temps,
          borderColor: colors[index % colors.length],
          backgroundColor: colors[index % colors.length] + '80',
          tension: 0.3,
          hidden: index > 2 // nur erste 3 sichtbar
        });
      });

      // 6️⃣ Chart aktualisieren
      myChart.update();
    })
    .catch(error => {
      console.error('Fehler beim Laden der Daten:', error);
    });
}

// === Beim Seitenaufruf Daten laden ===
updateChart();

const ctx2 = document.getElementById('myChart2').getContext('2d');
let myChart2;

// === Chart-Konfiguration ===
const config2 = {
  type: 'bar', // Basis-Typ (wird für kombinierte Charts überschrieben)
  data: {
    labels: [],
    datasets: []
  },
  options: {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'UV-Index und Niederschlag der letzten 30 Tage' },
    },
    scales: {
      x: {
        title: { display: true, text: 'Datum' },
        ticks: {
          font: { size: 9 },
          callback: function(value, index, values) {
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
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: 'UV-Index' },
        beginAtZero: true
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: { display: true, text: 'Regen (mm)' },
        grid: { drawOnChartArea: false },
        beginAtZero: true
      }
    }
  }
};

// === Chart initialisieren ===
myChart2 = new Chart(ctx2, config2);

// === Daten abrufen & Chart aktualisieren ===
function updateChart2() {
  fetch("https://im3garden.laraeberhard.ch/etl-boilerplate/unload.php")
    .then(response => response.json())
    .then(jsonData => {
      console.log("Neue Daten (UVI & Regen):", jsonData);

      // 1️⃣ Bestehende Daten leeren
      config2.data.labels = [];
      config2.data.datasets = [];

      // 2️⃣ Daten nach Stadt gruppieren
      const grouped = {};
      jsonData.forEach(item => {
        const date = item.time.split(' ')[0];
        if (!grouped[item.city]) grouped[item.city] = [];
        grouped[item.city].push({ date, uvi: item.uvi, rain: item.rain });
      });

      // 3️⃣ Alle Datumswerte sortieren
      const allDates = [...new Set(jsonData.map(item => item.time.split(' ')[0]))].sort();
      config2.data.labels = allDates;

      // 4️⃣ Farben definieren
      const colors = [
        '#FF0000', '#0000FF', '#008000',
        '#FFA500', '#800080', '#008080', '#A52A2A'
      ];

      // 5️⃣ Für jede Stadt UV-Linie + Regenbalken
      Object.keys(grouped).forEach((city, index) => {
        const cityData = grouped[city];

        // UVI-Daten
        const uviData = allDates.map(date => {
          const record = cityData.find(d => d.date === date);
          return record ? record.uvi : null;
        });

        // Regen-Daten
        const rainData = allDates.map(date => {
          const record = cityData.find(d => d.date === date);
          return record ? record.rain : null;
        });

        // UV-Index Linie
        config2.data.datasets.push({
          label: `UV-Index ${city}`,
          data: uviData,
          borderColor: colors[index % colors.length],
          backgroundColor: colors[index % colors.length] + '80',
          tension: 0.3,
          type: 'line',
          yAxisID: 'y',
          hidden: index > 2
        });

        // Regen Balken
        config2.data.datasets.push({
          label: `Regen ${city}`,
          data: rainData,
          backgroundColor: colors[index % colors.length] + '40',
          borderColor: colors[index % colors.length],
          borderWidth: 1,
          type: 'bar',
          yAxisID: 'y1',
          hidden: index > 2
        });
      });

      // 6️⃣ Chart aktualisieren
      myChart2.update();
    })
    .catch(error => {
      console.error('Fehler beim Laden der Daten (Chart2):', error);
    });
}

// === Beim Seitenaufruf Daten laden ===
updateChart2();




// === Optional: Automatische Aktualisierung z. B. alle 24 Stunden ===
// (Wert in Millisekunden: 24h = 86_400_000 ms)
// Wenn du beim Testen schneller updaten willst, z. B. alle 5 Minuten → 300_000
setInterval(updateChart, 86_400_000);