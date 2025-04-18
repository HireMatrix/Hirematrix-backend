export const parseJobFromPage = async (newPage) => {
    const jobTitle = await newPage.$eval(
        '.rounded-0.space-y-\\[12px\\].bg-white.p-\\[16px\\].pt-\\[16px\\].md\\:w-full.md\\:max-w-\\[690px\\] .m-0.truncate.text-wrap.text-md.font-semibold.text-\\[\\#190A28\\]',
        el => el.textContent?.trim()
    );
    const jobCompany = await newPage.$eval('.rounded-0.space-y-\\[12px\\].bg-white.p-\\[16px\\].pt-\\[16px\\].md\\:w-full.md\\:max-w-\\[690px\\] .m-0.text-sm.text-\\[\\#8C8594\\]',
        el => el.textContent?.trim()
    );
    const location = await newPage.$eval(
        '.rounded-0.space-y-\\[12px\\].bg-white.p-\\[16px\\].pt-\\[16px\\].md\\:w-full.md\\:max-w-\\[690px\\] .my-\\[12px\\].md\\:my-0.md\\:flex.md\\:flex-row.md\\:items-center.md\\:justify-between .flex.items-center.gap-\\[8px\\] .text-sm.text-\\[\\#8C8594\\]',
        el => el.textContent?.trim()
    );
    const salary = await newPage.$eval(
        '.rounded-0.space-y-\\[12px\\].bg-white.p-\\[16px\\].pt-\\[16px\\].md\\:w-full.md\\:max-w-\\[690px\\] .rounded-lg.bg-\\[\\#edebee80\\].px-\\[16px\\].py-\\[12px\\] .flex.justify-between.md\\:flex-col.md\\:gap-\\[8px\\] .m-0.text-xs.font-semibold.text-\\[\\#8C8594\\]',
        el => {
            const match = el.textContent.split('-');
            return match ? match[1].replace('₹', '') : null;
        }            
    );
    const jobTags = await newPage.$$eval('.rounded-0.space-y-\\[12px\\].bg-white.p-\\[16px\\].pt-\\[16px\\].md\\:w-full.md\\:max-w-\\[690px\\] [data-testid="job-tags-info"] .flex.items-center.gap-\\[4px\\] .flex.min-w-max.items-center.gap-\\[4px\\].rounded-sm.bg-\\[\\#F2F2F3\\].px-\\[4px\\].text-\\[\\#827485\\].md\\:w-max', elements =>
        elements.map(el => el.textContent.trim())
    );
    const jobDescription = await newPage.$eval(
        '[class^="styles__DescriptionTextFull"]',
        el => el.textContent?.trim()
    );
    const jobDetails = await newPage.$$eval(
        '.rounded-0.border-\\[\\#E8E7EA\\].md\\:w-full.md\\:max-w-\\[690px\\].md\\:overflow-hidden.md\\:rounded-xl.md\\:border.md\\:border-solid.md\\:bg-white .mb-\\[8px\\].bg-white.p-\\[16px\\].md\\:py-0',
        (containers) => {
          let result = {};
          for (const container of containers) {
            const label = container.querySelector('.mb-\\[4px\\].text-md.font-semibold.md\\:mb-\\[8px\\]');
            
            if (label) {
              const images = container.querySelectorAll('img');
              images.forEach(img => img.remove());
              const cleanText = container.innerText.trim();
              if (label.textContent.trim() === 'Job role') {
                result.jobRole = cleanText;
              } else if (label.textContent.trim() === 'Job requirements') {
                result.jobRequirement = cleanText;
              }
            }
          }
          return result;
        }
    );
    return {
        jobTitle,
        jobCompany,
        location,
        salary,
        jobTags,
        jobDescription,
        jobDetails
    }
}