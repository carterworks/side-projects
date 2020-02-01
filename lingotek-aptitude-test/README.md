# Lingotek Aptitude Test

## The mini-tasks

> Here is the aptitude quiz to help us get a feel for how you attack problems through code. We understand you have other things going on, so feel free to turn this in anytime in the next 7 days.

> Complete the following mini-tasks using whatever resources you'd like:

> 1. Use php or javascript to connect via API to pull down content (e.g. pins, posts, statuses) from any one of the following social networks: LinkedIn, Instagram, or Pinterest.
> 1. Use php or javascript to output the language names (e.g., German, English) from this url (http://gmc.lingotek.com/language).
> 1. List the HTTP requests (i.e., HTTP method, URL) and responses (i.e., HTTP status code) used for both #1 and #2 above.

> You should use php for one of the tasks and javascript for the other (you can choose which, either way is fine). Again, we encourage you to use the internet as much as you want --- we just ask that you share whatever sources you use. We are interested in how you go about this process and that you can demonstrate your understanding of what is happening technically.

## Environment Information

I chose to use Docker for a few reasons:

1. Because using docker is easier and less messy than installing the full WAMP stack on my computer
2. To showcase my skills with modern technology
3. To make running my solution easier for you.

### To Build Image

`docker build -t php-web-server .`

### To Run Container

`docker run --name lingotek-aptitude-test -p 80:80 --env-file ./env -v <PATH TO CURRENT DIR>/src:/var/www/html php-web-server`

## Part 1

I chose to use PHP for part one in order not to run into CORS issues. When using `fetch()` with client-side Javascript, often the browser will block requests to other domains for security purposes, unless the other server is set-up to handle it. I'd rather not deal with that.

Part 2 is more complicated because it requires interfacing with a public, secured API. That means getting an API key and performing the OAuth2 dance.

I chose to do it with LinkedIn because they have the nicest looking documentation.

First, in the Docker config I place the environment variables for the client ID and client secret. Those are here in the source code, b/c I don't know of a better way to send you the demo and have it work.

### OAuth2

[Reference](https://developer.linkedin.com/docs/oauth2)

1. Register an application with LinkedIn
2. Direct the user's browser to LinkedIn's OAuth endpoint, b/c we need authentication on behalf of the user to get other users information.
	- the client id is in the environment variables as CLIENT_ID
	- the state is a randomly generated string: `29x4Jq3WbQqpPIKnBrfNAa4pNnp6pX`

#### Request

```
GET https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=CLIENT_ID_HERE&redirect_uri=http://localhost&state=29x4Jq3WbQqpPIKnBrfNAa4pNnp6pX&scope=r_basicprofile HTTP/1.1
```

#### Response

HTTP Code 303, which redirects me to the LinkedIn login page, which will eventually redirect back to the localhost with a 200 and the OAuth2 code as a url parameter.

3. Upon successful authentication, you will have authorization code, which needs to be exchanged for an access token
	- [Reference on how to send a POST with PHP](https://stackoverflow.com/questions/5647461/how-do-i-send-a-post-request-with-php)

4. Make authenticated requests.

### Pulling Down LinkedIn Content

I am getting the basic profile information for the currently authenticated user. That is essentially the only information that can be retrieved through the LinkedIn API without being a company administrator.

Getting the information is a `GET` request to `https://api.linkedin.com/v1/people/~?format=json` with the oauth2 access code included as a URL parameter.

The response is a 200 (if authorized, 401 if not). The response body contains a json object that has `firstName`, `lastName`, `headline`, and `siteStandardProfileRequest` which contains the url to the user's profile.

#### Request

A POST to `https://www.linkedin.com/oauth/v2/accessToken` with url params of `grant_type`, `code`, `redirect_uri`, `client_id`, and `client_secret` 

#### Response

A 200 containing a json object with the access token and the seconds until the access token expires.

## Part 2

Part two was simple enough to do - just a single `fetch()` to the URL, then transform the objects in the response body into the languages, build them into DOM nodes and insert them into the page. No messy CORS or anything.

### Request

```
GET /language HTTP/1.1
Host: gmc.lingotek.com
```

### Response

```
HTTP/1.1 200 OK
X-Powered-By: Lingotek
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET,PUT,POST,DELETE
Access-Control-Allow-Headers: Content-Type
Content-Type: application/json; charset=utf-8
Content-Length: 3685
ETag: "293952253"
Set-Cookie: connect.sid=s%3Aa6ZAr1E4L0ROFQx7SZJmZohF.GFAJ68dqKnecODztaaQFOIGUrji41MZB6f4vSdgLCVo; Path=/; HttpOnly
Connection: keep-alive
```