import { h } from "preact";
import { Link } from "preact-router/match";

const Header = () => (
  <header class="h-auto p-2 flex items-center bg-blue-500 font-sans text-gray-100">
    <h1 class="text-3xl">Reddit Client—Preact</h1>
  </header>
);

export default Header;
