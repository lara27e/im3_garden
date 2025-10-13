<?php

$name = "Lara";
echo $name;

echo '<br>';

$a = 292;
$b = 22;
echo $a + $b;

echo '<br>';

// funktionen
function multiply($a, $b) {
    return $a * $b;
}
echo multiply(23, 49);

echo '<br>';

// bedingungen
// note muss 4 oder grösser sein
$note = 4.75;
if($note >= 4) {
    echo 'du hesch bestande yuhui';
} else if ($note < 4 && $note >= 3.5) {
    echo 'du chönntsch nomol e prüefig schriebe yuhu';
} else {
    echo 'byebye';
}

echo '<br>';

// arrays
$bananen = ['mama banane', 'papa banane', 'baby banane'];

echo '<pre>';
print_r($bananen);
echo '</pre>';

foreach($bananen as $banane) {
    echo $banane . '<br>';
}

echo '<br>';

// assoziative arrays (aka. Objekte)

$standorte = [
    'chur' => 15.4,
    'zuerich' => 17,
    'bern' => -1
];

echo '<pre>';
print_r($standorte['chur']);
echo '</pre>';

foreach($standorte as $ort => $temperatur) {
    echo $temperatur . '/' . $ort . '<br>';
}

?>