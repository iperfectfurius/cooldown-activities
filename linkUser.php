<?php
define('INTERNAL', 1);

if (!isset($_GET['id'])) die('???');

include_once __DIR__ . '/config/config.php';

$internalId = $_GET['id'];

if (!canBeCreated($internalId)) die("The User is already created! bitch");


function canBeCreated(string $internalId)
{
	$db = Database::$db;


	$query = "SELECT COUNT(*) count FROM cooldown_activities.users u 
	WHERE u.internal_uuid = :internalId
	AND external_uuid IS NULL";

	$stmt = $db->prepare($query);
	$stmt->bindParam(":internalId", $internalId);
	$stmt->execute();
	$rs = $stmt->fetch();

	return $rs['count'] == 1;
}

?>

<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="stylesheet" href="css/style.css">
	<script src="scripts/linkUser.js" defer></script>
	<title>Link user activities</title>
</head>

<body class="link-user-page">
	<form action="addUser.php" method="POST">
		<div class="ids">
			<input type="text" name="internalId" id="internalId" required value="<?= $internalId ?>">
			<input type="text" name="externalId" id="externalId" required>
			<input type="submit" class="submit" value="Link User">
		</div>

	</form>
</body>

</html>