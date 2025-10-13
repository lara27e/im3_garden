<?php

// Liste der Orte mit Namen und Koordinaten
$places = [
    ['city' => 'Bern',       'lat' => 46.94809, 'lon' => 7.44744],
    ['city' => 'Chur',       'lat' => 46.84,    'lon' => 9.52],
    ['city' => 'Zürich',     'lat' => 47.36667, 'lon' => 8.55],
    ['city' => 'Aarau',      'lat' => 47.39254, 'lon' => 8.04422],
    ['city' => 'Bellinzona', 'lat' => 46.19278, 'lon' => 9.01703],
    ['city' => 'Lausanne',   'lat' => 46.519962,'lon' => 6.633597],
    ['city' => 'Basel',      'lat' => 47.55839, 'lon' => 7.57327],
];

function fetchWeatherDataFor($lat, $lon) {
    // Baue die URL mit den Parametern dynamisch
    $params = [
        'latitude'      => $lat,
        'longitude'     => $lon,
        'daily'         => 'uv_index_max',
        'current'       => 'weather_code,rain,temperature_2m',
        'timezone'      => 'Europe/Berlin',
        'forecast_days' => 1,
        'ref'           => 'freepublicapis.com'
    ];
    $url = 'https://api.open-meteo.com/v1/forecast?' . http_build_query($params);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    $err = curl_error($ch);
    curl_close($ch);

    if ($err) {
        throw new Exception("cURL error fetching data for {$lat},{$lon}: " . $err);
    }

    $decoded = json_decode($response, true);
    if ($decoded === null) {
        throw new Exception("JSON decode error for {$lat},{$lon}: " . json_last_error_msg());
    }

    // Du kannst hier noch Validierungen machen: sind latitude, longitude, current, daily vorhanden etc.
    return $decoded;
}

// Hauptfunktion: ruft alle Orte ab und gibt ein assoziatives Ergebnis zurück
function extractAllPlaces() {
    global $places;

    $all = [];
    foreach ($places as $place) {
        $lat = $place['lat'];
        $lon = $place['lon'];
        $city = $place['city'];

        $data = fetchWeatherDataFor($lat, $lon);
        // Falls du möchtest, kannst du gleich den Stadtnamen hineinschreiben
        $data['city'] = $city;  
        $all[] = $data;
    }
    return $all;
}

// Wenn dieses Skript eingebunden wird:
return extractAllPlaces();
