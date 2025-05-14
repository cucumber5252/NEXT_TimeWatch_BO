import webpack from 'webpack';

export default {
    async rewrites() {
        return [
            {
                source: '/api/socket.io/',
                destination: '/api/socket.io',
            },
        ];
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                os: false,
                path: false,
                module: false,
                crypto: false,
                stream: false,
                http: false,
                https: false,
                zlib: false,
            };

            config.plugins.push(
                new webpack.ProvidePlugin({
                    process: 'process/browser',
                })
            );
        }

        config.resolve.alias = {
            ...config.resolve.alias,
            'xmlhttprequest-ssl': false,
        };

        return config;
    },
    serverRuntimeConfig: {
        projectRoot: process.cwd(),
    },

    async headers() {
        return [
            {
                // 모든 경로에 CORS 헤더를 추가하여 모든 요청에 대해 허용
                source: '/api/socket.io/(.*)',
                headers: [
                    {
                        key: 'Access-Control-Allow-Credentials',
                        value: 'true',
                    },
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: '*',
                    },
                    {
                        key: 'Access-Control-Allow-Methods',
                        value: 'GET,OPTIONS,POST',
                    },
                    {
                        key: 'Access-Control-Allow-Headers',
                        value: 'X-Requested-With, Accept, Content-Type',
                    },
                ],
            },
        ];
    },
};
