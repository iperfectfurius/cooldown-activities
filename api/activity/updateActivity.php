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

$activityId = $data['activity']['id'];

$activity = updateActivity($activityId);
createHistoricalActivity($activity,$user);

echo json_encode($activity['id']);


function updateActivity($activityId): array
{
	$db = Database::$db;

	$query = "UPDATE cooldown_activities.activities
	SET updates = updates +1,
	last_update_at = CURRENT_TIMESTAMP
	WHERE id = :activityId
	RETURNING 
	id,category,name,last_update_at,updates";

	$stmt = $db->prepare($query);
	$stmt->bindParam(":activityId", $activityId);
	$stmt->execute();

	return $stmt->fetch();
}
