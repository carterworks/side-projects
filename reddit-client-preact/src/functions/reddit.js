import { List } from "immutable";
import { isString } from "./common";

const baseURL = "https://www.reddit.com";

/**
 * Gets an endpoint of type "Listing"
 * @param {List<string>} parts parts of the url to fetch, like ["r", "pics", "top"]
 * @returns {Promise<Listing>}
 */
async function fetchListing(parts) {
  if (!List.isList(parts) || !parts.every(i => isString(i))) {
    throw "parts must be a List of strings";
  }
  const path = parts.join("/");
  const url = `${baseURL}/${path}.json`;
  const { kind, data } = await fetch(url);
  if (kind !== "Listing") {
    throw `Endpoint "${path}" is not a Listing.`;
  }
  return data;
}

function toPost(redditPost) {}

async function getHomepageHot() {
  const data = await fetchListing(List.of("hot"));
  const children = List.of(data.children);
  return children;
}

export { getHomepage };
