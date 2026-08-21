import {Worker} from 'bullmq';
import jobData from './queue.js';

const {emailQueue, connection} = jobData;

const worker = new Worker('email-queue',async (job) => {
    console.log(`Processing job ${job.id} with data:`, job.data);
    // Simulate email sending process
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Email sent to ${job.data.to} with subject: ${job.data.subject}`);
}, { connection });

worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed with error:`, err);
});

console.log('Worker is running and listening for jobs...'); 