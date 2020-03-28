import tailwind from "preact-cli-tailwind";

export default {
  webpack(config, env, helpers) {
    config = tailwind(config, env, helpers);
    return config;
  }
};
