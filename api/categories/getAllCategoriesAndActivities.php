<?php

define('INTERNAL', 1);

include_once __DIR__ . '/../../config/config.php';
include_once __DIR__ . '/../user/isAuthenticated.php';

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Methods: POST");
header('Content-Type: application/json');

$rawBody = file_get_contents('php://input');
$data = json_decode($rawBody, true);

if (!isValidUser($data['internalId'], $data['externalId'])) die();

$query = "SELECT 
c.id categoryId,
c.name categoryName,
c.order \"order\",
a.name activityName,
a.last_update_at lastUpdate,
a.updates,
a.id activityId
FROM cooldown_activities.category c
INNER JOIN cooldown_activities.activities a ON c.id = a.category
WHERE display = TRUE
AND a.enabled = true
ORDER BY a.id";

$stmt = $db->prepare($query);
$stmt->execute();
$rs = $stmt->fetchAll();

$rsObject = [];

foreach ($rs as $key => $activity) {
	$rsObject[$activity['categoryname']]['id'] = $activity['categoryid'];

	$rsObject[$activity['categoryname']]['activities'][] = [
		'activityName' => $activity['activityname'],
		'lastUpdate' => $activity['lastupdate'],
		'updates' => $activity['updates'],
		'id' => $activity['activityid']
	];
}

echo json_encode($rsObject);
