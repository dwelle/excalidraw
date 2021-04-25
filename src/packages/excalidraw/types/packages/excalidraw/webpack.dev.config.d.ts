import webpack = require("webpack");
export const mode: string;
export const devtool: boolean;
export const entry: {
    "excalidraw.development": string;
};
export namespace output {
    const path: string;
    const library: string;
    const libraryTarget: string;
    const filename: string;
    const chunkFilename: string;
    const publicPath: string;
}
export namespace resolve {
    const extensions: string[];
}
export namespace module {
    const rules: ({
        test: RegExp;
        exclude: RegExp;
        use: (string | {
            loader: string;
            options?: undefined;
        } | {
            loader: string;
            options: {
                postcssOptions: {
                    plugins: any[];
                };
            };
        })[];
    } | {
        test: RegExp;
        exclude: RegExp;
        use: {
            loader: string;
            options: {
                transpileOnly: boolean;
                configFile: string;
            };
        }[];
    } | {
        test: RegExp;
        use: {
            loader: string;
            options: {
                name: string;
                outputPath: string;
            };
        }[];
        exclude?: undefined;
    })[];
}
export namespace optimization {
    namespace splitChunks {
        const chunks: string;
        namespace cacheGroups {
            namespace vendors {
                const test: RegExp;
                const name: string;
            }
        }
    }
}
export const plugins: webpack.EvalSourceMapDevToolPlugin[];
export const externals: {
    react: {
        root: string;
        commonjs2: string;
        commonjs: string;
        amd: string;
    };
    "react-dom": {
        root: string;
        commonjs2: string;
        commonjs: string;
        amd: string;
    };
};
