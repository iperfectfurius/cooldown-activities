<?php

if (!defined('INTERNAL')) die();

include_once __DIR__ . '/../../config/config.php';

function isValidUser(string $internalId, string $externalId): int {
	$query = "SELECT id FROM cooldown_activities.users
	WHERE internal_uuid = :internalId
	AND external_uuid = :externalId";
	
	$db = Database::$db;

	$stmt = $db->prepare($query);
	$stmt->bindParam(":internalId", $internalId);
	$stmt->bindParam(":externalId", $externalId);
	$stmt->execute();

	return $stmt->fetch()['id'];
}
