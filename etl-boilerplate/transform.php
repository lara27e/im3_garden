<?php

/* ============================================================================
   HANDLUNGSANWEISUNG (transform.php)
   0) Schau dir die Rohdaten genau an und plane exakt, wie du die Daten umwandeln möchtest (auf Papier)
   1) Binde extract.php ein und erhalte das Rohdaten-Array.
   2) Konvertiere Einheiten (z. B. °F → °C) und runde sinnvoll.
   3) Leite eine einfache "condition" ab (z. B. sonnig/teilweise bewölkt/bewölkt/regnerisch).
   4) Baue ein kompaktes, flaches Array je Standort mit den Ziel-Feldern.
   5) Validiere Pflichtfelder (location, temperature_celsius, …).
   6) Kodieren: json_encode(..., JSON_PRETTY_PRINT) → JSON-String.
   7) GIB den JSON-String ZURÜCK (return), nicht ausgeben – für den Load-Schritt.
   ============================================================================ */

// Bindet das Skript extract.php für Rohdaten ein und speichere es in $data
$data = include('extract.php');

// Hilfsfunktion zur Ableitung der Wetterbedingung
function simplifyWeatherCode($code) {
    if (in_array($code, [0, 1])) return 'sonnig';
    if (in_array($code, [2, 3, 45, 48])) return 'bewölkt';
    if (($code >= 51 && $code <= 67) || ($code >= 80 && $code <= 82)) return 'regnerisch';
    if (($code >= 71 && $code <= 77) || ($code >= 85 && $code <= 86)) return 'schneiend';
    return 'bewölkt';
}

// Funktion zur Umwandlung der Daten für eine Stadt
function transformWeatherData($data, $city) {

    if (!$data || !isset($data['current']) || !isset($data['daily'])) {
        throw new Exception("Ungültige oder unvollständige Wetterdaten für $city");
    }

    $lat   = $data['latitude'] ?? null;
    $lon   = $data['longitude'] ?? null;
    $time  = $data['current']['time'] ?? null;
    $temp  = $data['current']['temperature_2m'] ?? null;
    $rain  = $data['current']['rain'] ?? null;
    $wcode = simplifyWeatherCode($data['current']['weather_code'] ?? 3);
    $uvi   = $data['daily']['uv_index_max'][0] ?? null;

    if ($lat === null || $lon === null || $temp === null) {
        throw new Exception("Fehlende Pflichtfelder für $city");
    }

    return [
        'latitude'     => $lat,
        'longitude'    => $lon,
        'time'         => $time,
        'city'         => $city,
        'uvi'          => $uvi,
        'temperatur'   => round($temp, 1),
        'rain'         => round($rain, 2),
        'weather_code' => $wcode
    ];
}

// Initialisiert das Array für transformierte Daten
$transformedData = [];

// Iteriert über alle Städte-Datensätze, die aus extract.php kommen
foreach ($data as $locationData) {
    if (!isset($locationData['city'])) {
        throw new Exception("Kein Stadtname in Datensatz gefunden");
    }

    $city = $locationData['city'];
    $transformedItem = transformWeatherData($locationData, $city);
    $transformedData[] = $transformedItem;
}

// Debug-Ausgabe optional
// echo "<pre>"; print_r($transformedData); echo "</pre>";

// Gibt die JSON-Daten formatiert zurück (für load.php)
$transformedDataJson = json_encode($transformedData, JSON_PRETTY_PRINT);
