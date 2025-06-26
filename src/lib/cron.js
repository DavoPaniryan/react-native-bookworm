import cron from 'cron';
import https from 'https';

const job = new cron.CronJob('*/14 * * * *', function () {
    https
        .get(process.env.API_URL, (res) => {
            if (res.statusCode === 200) {
                console.log('Get request sent successfully');
            } else {
                console.log(
                    `Request failed with status code: ${res.statusCode}`,
                );
            }
        })
        .on('error', (e) => console.error('Request error:', e));
});

export default job;
