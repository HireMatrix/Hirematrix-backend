import { chromium } from 'playwright';
import axios from 'axios';
import {parseJobFromPage} from './parser.js';
import redisClient from '../db/redisClient.js';

export const scrapeJobsFromUrl = async (url, maxPages = 1) => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(url, { waitUntil: 'networkidle' });

    let AllJobs = [];
    let pageCount = 0;
    
    while (pageCount < maxPages) {
        await page.waitForSelector('[data-testid="job-card"].min-h-full');
        const jobCards = await page.$$('[data-testid="job-card"].min-h-full');

        console.log(`Scraping Page ${pageCount + 1} with ${jobCards.length} jobs`);

        for (let i = 0; i < jobCards.length; i++) {
            const [newPage] = await Promise.all([
                context.waitForEvent('page'),
                jobCards[i].click()
            ]);

            try {
                await newPage.waitForSelector('.rounded-0.space-y-\\[12px\\].bg-white.p-\\[16px\\].pt-\\[16px\\].md\\:w-full.md\\:max-w-\\[690px\\]', { timeout: 1000 });

                const {
                    jobTitle,
                    jobCompany,
                    location,
                    salary,
                    jobTags,
                    jobDescription,
                    jobDetails
                } = await parseJobFromPage(newPage);
                
                const prompt = `
                    Title: ${jobTitle}
                    Company: ${jobCompany}
                    Location: ${location}
                    Salary: ${salary}
                    Tags: ${jobTags.join(', ')}
                    Description: ${jobDescription}
                    RoleData: ${jobDetails.jobRole || 'N/A'}
                    Requirements: ${jobDetails.jobRequirement || 'N/A'}
                `;
            
                try {
                    const cachKey = `job:${jobTitle}`;
                    const cachedJob = await redisClient.get(cachKey);

                    if(cachedJob){
                        AllJobs.push(JSON.parse(cachedJob)); 
                    } else {
                        const response = await axios.post('http://127.0.0.1:8000/parse-job', {
                            prompt: prompt
                        });
                        const data = response.data.split("<|end-output|>")[0];
                        const parsedData = JSON.parse(data);;
                        AllJobs.push(parsedData[0])
                    }

                } catch (error) {
                    console.error("Axios Error:", error.message, error.response?.data);
                }
            } catch (err) {
                console.error(`Error extracting job ${i + 1} title:`, err.message);
            }

            await newPage.close();
        }

        const nextBtn = await page.$('li:has-text("Next")');
        if (nextBtn) {
            await nextBtn.click();
            await page.waitForTimeout(2000);
            pageCount++;
        } else {
            console.log('No more pages');
            break;
        }
    }

    await browser.close();
    console.log('All jobs extracted successfully.');
    return AllJobs;
};
