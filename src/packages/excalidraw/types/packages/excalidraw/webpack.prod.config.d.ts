import autoprefixer = require("autoprefixer");
export const mode: string;
export const entry: {
    "excalidraw.min": string;
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
                    plugins: (import("postcss").Plugin & autoprefixer.ExportedAPI)[];
                };
            };
        })[];
    } | {
        test: RegExp;
        exclude: RegExp;
        use: ({
            loader: string;
            options: {
                transpileOnly: boolean;
                configFile: string;
                presets?: undefined;
                plugins?: undefined;
            };
        } | {
            loader: string;
            options: {
                presets: string[];
                plugins: string[];
                transpileOnly?: undefined;
                configFile?: undefined;
            };
        })[];
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
    const minimize: boolean;
    const minimizer: any[];
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
export const plugins: any[];
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
