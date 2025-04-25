<?php
define('INTERNAL', 1);

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Methods: POST");

if (!isset(
	$_POST['internalId'],
	$_POST['externalId']
)) die('???');

include_once __DIR__ . '/config/config.php';

$userLinked = linkUser($_POST['internalId'], $_POST['externalId']);

if ($userLinked)
	echo "User Linked!";
else {
	header('HTTP/1.1 401 Unauthorized');
	die(json_encode(['message' => 'Unable to link user']));
}

function linkUser(string $internalId, string $externalId): bool
{

	$db = Database::$db;

	$query = "UPDATE cooldown_activities.users
	SET external_uuid = :externalId
	WHERE internal_uuid = :internalId
	AND external_uuid IS NULL";

	$stmt = $db->prepare($query);
	$stmt->bindParam(":internalId", $internalId);
	$stmt->bindParam(":externalId", $externalId);
	$stmt->execute();

	return $stmt->rowCount() == 1;
}

?>

<script>
	window.onload = function () {
		setLocalStorage();
	};
	function setLocalStorage(){
		localStorage.setItem('internalId','<?=$_POST['internalId'] ?>');
		localStorage.setItem('externalId','<?=$_POST['externalId'] ?>');
		window.location.replace('./index.html');
	}
</script>