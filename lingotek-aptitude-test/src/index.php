<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="X-UA-Compatible" content="ie=edge">
	<title>Lingotek Aptitude Test</title>
</head>
<body>
	<h1>Lingotek Aptitude Test</h1>
	<main>
		<section>
			<h2>Part 1 - Pull Down Content from LinkedIn, Instagram, or Pinterest</h2>
			<?
				# Check if URL params are set (we are authed) and if no CSRF (MitM) attacks have happened.
				if (isset($_GET['code']) && isset($_GET['state']) && $_GET['state'] === '29x4Jq3WbQqpPIKnBrfNAa4pNnp6pX') {
					$code = $_GET['code'];
					# Make the request to get the access token
					$url = 'https://www.linkedin.com/oauth/v2/accessToken';
					$params = array(
						'grant_type' => 'authorization_code', 
						'code' => urlencode($code),
						'redirect_uri' => urlencode("http://localhost"),
						'client_id' => urlencode(getenv('CLIENT_ID')),
						'client_secret' => urlencode(getenv('CLIENT_SECRET'))
					);
					$paramsString = "";
					foreach($params as $key => $value) {
						$paramsString .= $key . "=" . $value . "&";
					}
					rtrim($paramsString, '&');

					// open cURL connection
					$curl = curl_init();
					// set request params
					curl_setopt($curl, CURLOPT_URL, $url);
					curl_setopt($curl, CURLOPT_POST, count($params));
					curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
					curl_setopt($curl, CURLOPT_POSTFIELDS, $paramsString);

					$result = curl_exec($curl);
					curl_close($curl);
					if (!$result) {
						throw new Exception("Access token approval was unsuccessful");
					}
					# Get the access token
					$accessToken = json_decode($result)->access_token;
					# Get the recent statuses from Lingotek
					$profileInfoUrl = "https://api.linkedin.com/v1/people/~?format=json&oauth2_access_token=$accessToken";
					// open cURL connection
					$curl = curl_init();
					// set request params
					curl_setopt($curl, CURLOPT_URL, $profileInfoUrl);
					curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

					$profileResult = curl_exec($curl);
					curl_close($curl);
					if (!$profileResult) {
						throw new Exception("Getting profile information was unsuccessful.");
					}
					$profileResult = json_decode($profileResult);
					?>
					<h3><a href="<?echo $profileResult->siteStandardProfileRequest->url?>"><?echo $profileResult->firstName . " " . $profileResult->lastName?></a></h3>
					<h4><? echo $profileResult->headline ?></h4>

					<?
				} else {
					// Render the link to be authed
					?> 
					<a href="https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=<?echo getenv("CLIENT_ID");?>&redirect_uri=http%3A%2F%2Flocalhost&state=29x4Jq3WbQqpPIKnBrfNAa4pNnp6pX&scope=r_basicprofile">Log in with LinkedIn</a>
					<?
				}
			?>
		</section>
		<section>
			<h2>Part 2 - Display Languages from <a href="http://gmc.lingotek.com/language">This Site</a></h2>
			<h3>Languages</h3>
			<ul id="languages"></ul>
		</section>
	</main>
</body>
<script src="./script.js" defer="defer"></script>
</html>