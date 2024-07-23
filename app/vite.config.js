import { resolve } from "path";

const config = {
    resolve: {
        alias: {
            $public: resolve("./public"),
        }
    }
}

export default config;