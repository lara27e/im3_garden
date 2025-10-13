<?php
/* ============================================================================
   DATEI: load.php
   Zweck: Lädt transformierte Wetterdaten in die MySQL-Datenbank.
   ============================================================================ */

// 1️⃣ Transformations-Skript einbinden
require_once 'transform.php';

// 2️⃣ JSON-Daten (z. B. aus extract.php) laden
$dataArray = json_decode($transformedDataJson, true);
// print_r($dataArray);


// 3️⃣ Datenbankkonfiguration einbinden
require_once '../config.php';

try {
    // 4️⃣ PDO-Verbindung herstellen
    $pdo = new PDO($dsn, $username, $password, $options);

    // 5️⃣ SQL-Statement vorbereiten (INSERT mit Upsert)
    $sql = "
        INSERT INTO wetterdaten 
            (latitude, longitude, time, city, uvi, temperatur, rain, weather_code)
        VALUES 
            (:latitude, :longitude, :time, :city, :uvi, :temperatur, :rain, :weather_code)
        ON DUPLICATE KEY UPDATE
            uvi = VALUES(uvi),
            temperatur = VALUES(temperatur),
            rain = VALUES(rain),
            weather_code = VALUES(weather_code)
    ";

    $stmt = $pdo->prepare($sql);

    // 6️⃣ Transaktion starten (schneller & sicherer)
    $pdo->beginTransaction();

    foreach ($dataArray as $item) {
        $stmt->execute([
            ':latitude'     => $item['latitude'],
            ':longitude'    => $item['longitude'],
            ':time'         => $item['time'],
            ':city'         => $item['city'],
            ':uvi'          => $item['uvi'],
            ':temperatur'   => $item['temperatur'],
            ':rain'         => $item['rain'],
            ':weather_code' => $item['weather_code']
        ]);
    }

    // 7️⃣ Änderungen speichern
    $pdo->commit();

    echo "✅ Daten erfolgreich in die Datenbank geladen.";
} catch (PDOException $e) {
    // Rollback bei Fehlern in der Transaktion
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    // Generische Fehlermeldung (kein sensitives Logging)
    error_log("DB-Fehler: " . $e->getMessage());
    die("❌ Fehler beim Laden der Daten.");
}

/* Hilfsfunktion: Prüft, ob Array assoziativ ist */
function is_assoc(array $arr): bool {
    return array_keys($arr) !== range(0, count($arr) - 1);
}
?>
