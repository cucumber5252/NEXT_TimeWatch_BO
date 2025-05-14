import clientPromise from './lib/mongodb.mjs';
import moment from 'moment-timezone';

export default {
    siteUrl: process.env.SITE_URL || 'http://localhost:3000',
    generateRobotsTxt: true,
    exclude: ['/api/*', '/admin/*', '/temporary/*', '/blog/new', '/find-password', '/reset-password', '/icon.ico'],
    changefreq: 'daily',
    priority: 0.7,
    sitemapSize: 7000,
    generateIndexSitemap: false,
    outDir: './public',
    transform: async (config, path) => {
        let newPath = path;

        // blog 포스트 동적 경로 처리
        if (path === '/blog/[postId]') {
            const client = await clientPromise;
            const db = client.db('blog');
            const posts = await db.collection('posts').find({}).toArray();
            return posts.map((post) => ({
                loc: `/blog/${post.postId}`,
                changefreq: config.changefreq,
                priority: config.priority,
                lastmod: moment(post.updatedAt || post.createdAt)
                    .tz('Asia/Seoul')
                    .format('YYYY-MM-DDTHH:mm:ssZ'),
                alternateRefs: config.alternateRefs || [],
            }));
        }

        // server-time URL 동적 경로 처리
        if (path === '/server-time/[url]') {
            const client = await clientPromise;
            const db = client.db('servertime');
            const urls = await db.collection('urls').find({}).toArray(); // 'urls' 컬렉션 사용
            return urls.map((urlData) => ({
                loc: `/server-time/${urlData.url}`, // encodeURIComponent 제거
                changefreq: config.changefreq,
                priority: config.priority,
                lastmod: moment(urlData.lastModified).tz('Asia/Seoul').format('YYYY-MM-DDTHH:mm:ssZ'),
                alternateRefs: config.alternateRefs || [],
            }));
        }

        return {
            loc: newPath,
            changefreq: config.changefreq,
            priority: path === '/' ? 1.0 : config.priority,
            lastmod: moment().tz('Asia/Seoul').format('YYYY-MM-DDTHH:mm:ssZ'),
            alternateRefs: config.alternateRefs || [],
        };
    },
    additionalPaths: async (config) => {
        const client = await clientPromise;

        // blog 포스트에 대한 추가 경로 처리
        const blogDb = client.db('blog'); // blog 데이터베이스 참조
        const posts = await blogDb.collection('posts').find({}).toArray();
        const blogPaths = posts.map((post) => ({
            loc: `/blog/${post.postId}`,
            changefreq: config.changefreq,
            priority: config.priority,
            lastmod: moment(post.updatedAt || post.createdAt)
                .tz('Asia/Seoul')
                .format('YYYY-MM-DDTHH:mm:ssZ'),
        }));

        // server-time URL에 대한 추가 경로 처리
        const serverTimeDb = client.db('servertime'); // servertime 데이터베이스 참조
        const urls = await serverTimeDb.collection('urls').find({}).toArray();
        const serverTimePaths = urls.map((urlData) => ({
            loc: `/server-time/${urlData.url}`,
            changefreq: config.changefreq,
            priority: config.priority,
            lastmod: moment(urlData.lastModified).tz('Asia/Seoul').format('YYYY-MM-DDTHH:mm:ssZ'),
        }));

        return [...blogPaths, ...serverTimePaths];
    },
};
