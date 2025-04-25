<?php

define('INTERNAL', 1);

include_once __DIR__ . '/../../config/config.php';
include_once __DIR__ . '/../user/isAuthenticated.php';
include_once __DIR__ . '/createHistoricalActivity.php';

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Methods: POST");
header('Content-Type: application/json');

$rawBody = file_get_contents('php://input');
$data = json_decode($rawBody, true);

$user = isValidUser($data['internalId'], $data['externalId']);
if (!$user) die();

if (!isset($data['activity'])) die();

$categoryId = $data['activity']['category'];
$activityName = $data['activity']['name'];

$newActivity = createActivity($categoryId, $activityName);

if (!$newActivity) die(json_encode([]));

createHistoricalActivity($newActivity,$user);

echo json_encode($newActivity);

function createActivity(int $categoryId, string $activityName): array
{
	$db = Database::$db;

	$query = "INSERT INTO cooldown_activities.activities (category,name)
	VALUES (:categoryId,:name)
	RETURNING 
	id,category,name,last_update_at,updates";

	$stmt = $db->prepare($query);
	$stmt->bindParam(":categoryId", $categoryId);
	$stmt->bindParam(":name", $activityName);
	$stmt->execute();
	$rs = $stmt->fetch();

	return $rs;
}
