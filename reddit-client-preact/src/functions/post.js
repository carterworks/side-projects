import { Record } from "immutable";

const PostType = Object.freeze({
  Text: Symbol("PostType.Text"),
  Image: Symbol("PostType.Image"),
  Link: Symbol("PostType.Link")
});

const Post = Record(
  { title: null, postLink: null, type: null, contents: null },
  "Post"
);

export { Post, PostType };
