<?php
if (!defined('INTERNAL')) die();

include_once __DIR__ . '/../../config/config.php';
include_once __DIR__ . '/../user/isAuthenticated.php';

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Methods: POST");
header('Content-Type: application/json');

function createHistoricalActivity(array $activity,int $userId): bool{
	$db = Database::$db;

	$query = "INSERT INTO cooldown_activities.historical_activities (category_id,activity_id,name,update_count,update_by)
	VALUES (:categoryId,:activityId,:name,:updateCount,:update_by)";

	$stmt = $db->prepare($query);
	$stmt->bindParam(":categoryId", $activity['category']);
	$stmt->bindParam(":activityId", $activity['id']);
	$stmt->bindParam(":name", $activity['name']);
	$stmt->bindParam(":updateCount", $activity['updates']);
	$stmt->bindParam(":update_by", $userId);
	return $stmt->execute();

}