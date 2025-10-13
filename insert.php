<?php
    $data = [
        "latitude" => "",
        "longitude" => "",
        "city" => "",   
        "uvi" => "",
        "temperature" => "",
        "rain" => "",
        "weather_code" => "",
    ];

    require_once 'config.php';

    try {
        // Erstellt eine neue PDO-Instanz mit der Konfiguration aus config.php
        $pdo = new PDO($dsn, $username, $password, $options);
    
        // SQL-Query mit Platzhaltern für das Einfügen von Daten
        $sql = "INSERT INTO weather_data (latitude, longitude, city, uvi, temperature, rain, weather_code) VALUES (?, ?, ?, ?, ?, ?, ?)";
    
        // Bereitet die SQL-Anweisung vor
        $stmt = $pdo->prepare($sql);
    
        $stmt->execute([
            $data['latitude'],
            $data['longitude'],
            $data['city'],
            $data['uvi'],
            $data['temperature'],
            $data['rain'],
            $data['weather_code']
        ]);
        
    
        echo "Daten erfolgreich eingefügt.";
    } catch (PDOException $e) {
        die("Verbindung zur Datenbank konnte nicht hergestellt werden: " . $e->getMessage());
    }
    

?>