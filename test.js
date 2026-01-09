// === Farben für alle Charts ===
const colors = ['#81D587', '#225125', '#23A12C', '#CAD9B9', '#BEBEBE', '#FFB787', '#FFCAA7'];

// === Allgemeine Funktion zum Aufbau der Charts ===
function buildChart(ctx, type, title, yLabel, dataKey) {
    return new Chart(ctx, {
        type: type,
        data: { labels: [], datasets: [] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: title },
            },
            layout: {            // <-- hier hinzufügen
                padding: {
                    right: 20,   // Abstand rechts
                    left: 10     // optional links
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Datum + Stunde' },
                    offset: true,
                    ticks: {
                        font: { size: 9 },
                        callback: function(value) {
                            const label = this.getLabelForValue(value);
                            const date = new Date(label);
                            if (!isNaN(date)) {
                                return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) +
                                       ' ' + date.getHours() + 'h';
                            }
                            return label;
                        }
                    }
                },
                y: {
                    beginAtZero: dataKey !== 'temperatur',
                    title: { display: true, text: yLabel }
                }
            }
        }
    });
}

Chart.defaults.font.family = "'Chewy', cursive";

// === Charts initialisieren ===
const myChart = buildChart(document.getElementById('myChart'), 'line', 'Temperaturverlauf der letzten 30 Tage', 'Temperatur (°C)', 'temperatur');
const myChart2 = buildChart(document.getElementById('myChart2'), 'line', 'UV-Index der letzten 30 Tage', 'UV-Index', 'uvi');
const myChart3 = buildChart(document.getElementById('myChart3'), 'bar', 'Niederschlag der letzten 30 Tage', 'Regen (mm)', 'rain');

// === Daten abrufen und Charts updaten ===
function updateCharts() {
    fetch("https://im3garden.laraeberhard.ch/etl-boilerplate/unload.php")
        .then(response => response.json())
        .then(jsonData => {
            // Alle eindeutigen Zeitpunkte (Datum + Stunde)
            const allTimes = [...new Set(jsonData.map(i => i.time))].sort();

            // Für jeden Chart die Daten vorbereiten
            const grouped = { temperatur: {}, uvi: {}, rain: {} };

            jsonData.forEach(item => {
                const city = item.city;
                if (!grouped.temperatur[city]) grouped.temperatur[city] = [];
                if (!grouped.uvi[city]) grouped.uvi[city] = [];
                if (!grouped.rain[city]) grouped.rain[city] = [];

                grouped.temperatur[city].push({ time: item.time, value: item.temperatur });
                grouped.uvi[city].push({ time: item.time, value: item.uvi });
                grouped.rain[city].push({ time: item.time, value: item.rain });
            });

            // Helper: Daten für einen Chart zusammenstellen
            function buildDataset(groupedData, allTimes, key) {
                return Object.keys(groupedData).map((city, i) => {
                    const data = allTimes.map(time => {
                        const record = groupedData[city].find(d => d.time === time);
                        return record ? record.value : null;
                    });
                    return {
                        label: city,
                        data: data,
                        borderColor: colors[i % colors.length],
                        backgroundColor: colors[i % colors.length] + (key === 'rain' ? '80' : '40'),
                        tension: 0.3,
                        hidden: i > 2
                    };
                });
            }

            // Charts updaten
            myChart.data.labels = allTimes;
            myChart.data.datasets = buildDataset(grouped.temperatur, allTimes, 'temperatur');
            myChart.update();

            myChart2.data.labels = allTimes;
            myChart2.data.datasets = buildDataset(grouped.uvi, allTimes, 'uvi');
            myChart2.update();

            myChart3.data.labels = allTimes;
            myChart3.data.datasets = buildDataset(grouped.rain, allTimes, 'rain');
            myChart3.update();
        })
        .catch(console.error);
}

// === Sofort und stündlich aktualisieren ===
function startAutoUpdate() {
    updateCharts(); // direkt beim Laden
    setInterval(updateCharts, 3_600_000); // jede Stunde
}

// Auto-Update starten
startAutoUpdate();


// === Optional: tägliche Aktualisierung ===
setInterval(() => {
    updateChart();
    updateChart2();
    updateChart3();
  }, 3_600_000); // 1 Stunde in Millisekunden

  document.addEventListener('DOMContentLoaded', () => {
    const punkte = document.querySelectorAll('.punkt');

    const overlayContent = document.createElement('div');
    overlayContent.classList.add('overlay-content');
    overlayContent.innerHTML = `
      <h2></h2>
      <hr>
      <div class="info"><span>UV Index:</span><span class="uv">-</span></div>
      <div class="info"><span>Rain:</span><span class="rain">-</span></div>
      <div class="info"><span>Wetter:</span><span class="weather">-</span></div>
      <div style="text-align:center;">
        <div class="temp">-°C</div>
      </div>
    `;
    document.body.appendChild(overlayContent);

    let dataCache = []; // Hier speichern wir die JSON-Daten

    // Daten von der API abrufen
    fetch("https://im3garden.laraeberhard.ch/etl-boilerplate/unload.php")
        .then(response => response.json())
        .then(jsonData => {
            dataCache = jsonData; // Daten zwischenspeichern
        })
        .catch(console.error);

    let hoverTimeout;

    punkte.forEach(punkt => {
        punkt.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimeout);

            const city = punkt.getAttribute('data-city');
            overlayContent.querySelector('h2').textContent = city;

            // Heutiges Datum als yyyy-mm-dd
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            const todayStr = `${yyyy}-${mm}-${dd}`;

            // Letzten Eintrag von heute für die Stadt finden
            const cityData = dataCache
                .filter(item => item.city === city && item.time.startsWith(todayStr))
                .sort((a, b) => new Date(b.time) - new Date(a.time))[0];

            if (cityData) {
                overlayContent.querySelector('.uv').textContent = cityData.uvi;
                overlayContent.querySelector('.rain').textContent = cityData.rain + ' mm';
                overlayContent.querySelector('.weather').textContent = cityData.weather_code;
                overlayContent.querySelector('.temp').textContent = cityData.temperatur.toFixed(1) + '°C';
            } else {
                // Falls keine Daten für heute vorhanden sind
                overlayContent.querySelector('.uv').textContent = '-';
                overlayContent.querySelector('.rain').textContent = '-';
                overlayContent.querySelector('.weather').textContent = '-';
                overlayContent.querySelector('.temp').textContent = '-°C';
            }

            const rect = punkt.getBoundingClientRect();
            const overlayWidth = overlayContent.offsetWidth;
            const overlayHeight = overlayContent.offsetHeight;

            let top = rect.top + window.scrollY - overlayHeight / 2 - 10;
            let left = rect.left + window.scrollX + rect.width / 2 + 20;

            const margin = 10;
            if (top < margin) top = margin;
            if (top + overlayHeight > window.scrollY + window.innerHeight - margin) {
                top = window.scrollY + window.innerHeight - overlayHeight - margin;
            }
            if (left + overlayWidth > window.innerWidth - margin) {
                left = window.innerWidth - overlayWidth - margin;
            }

            overlayContent.style.top = `${top}px`;
            overlayContent.style.left = `${left}px`;
            overlayContent.classList.add('show');
        });

        punkt.addEventListener('mouseleave', () => {
            hoverTimeout = setTimeout(() => {
                if (!overlayContent.matches(':hover')) {
                    overlayContent.classList.remove('show');
                }
            }, 50);
        });
    });

    overlayContent.addEventListener('mouseleave', () => {
        hoverTimeout = setTimeout(() => {
            if (!Array.from(punkte).some(p => p.matches(':hover'))) {
                overlayContent.classList.remove('show');
            }
        }, 50);
    });

    overlayContent.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimeout);
    });
});

function renderOverlayBlocks(jsonData) {
    const container = document.getElementById('overlay-list');
    container.innerHTML = ''; // alles leeren, bevor neu gerendert wird

    const cities = [...new Set(jsonData.map(item => item.city))];

    cities.forEach(city => {
        const cityData = jsonData.filter(item => item.city === city);
        const lastRecord = cityData[cityData.length - 1];

        if (!lastRecord) return; // Sicherheit, falls keine Daten

        const block = document.createElement('div');
        block.classList.add('overlay-block');
        block.innerHTML = `
            <h2>${city}</h2>
            <div class="info"><span>UV Index:</span><span>${lastRecord.uvi}</span></div>
            <div class="info"><span>Rain:</span><span>${lastRecord.rain} mm</span></div>
            <div class="info"><span>Wetter:</span><span>${lastRecord.weather_code}</span></div>
            <div class="temp">${lastRecord.temperatur.toFixed(1)}°C</div>
        `;

        container.appendChild(block);
    });
}

// Daten laden & Blöcke rendern
fetch("https://im3garden.laraeberhard.ch/etl-boilerplate/unload.php")
    .then(res => res.json())
    .then(data => {
        renderOverlayBlocks(data);
        updateCharts();
    })
    .catch(console.error);

