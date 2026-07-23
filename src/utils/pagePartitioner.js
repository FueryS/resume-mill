/**
 * pagePartitioner.js
 * 
 * Purpose:
 * Deterministically partitions raw resume data into discrete A4 page blocks
 * to prevent text lines or sections from getting cut in half.
 * Re-runs whenever form data or template selections change.
 */

export function partitionResumeData(data) {
  if (!data) return [];

  const pages = [];
  
  // Initialize Page 1
  let currentPageNum = 1;
  let currentPage = {
    pageNum: 1,
    showHeader: true,
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    languages: [],
    skills: '', // will be assigned to a specific page
  };

  // Height budget configuration (in pixels)
  // Usable height on A4 canvas (1123px total - ~76px vertical padding - ~30px watermark = ~1017px usable)
  // Budget limit is set to 980px so pages fill up to 96% before creating a break
  const PAGE_1_MAX = 980;
  const PAGE_N_MAX = 980;

  let currentHeight = 0;

  // 1. Calculate Page 1 Header and Summary Height
  let headerHeight = 70;
  if (data.personal?.pfp) headerHeight = 115;
  
  // Estimate personal social link rows (4 links fit per row in CSS flex contact bar)
  let linksCount = 0;
  if (data.personal?.email) linksCount++;
  if (data.personal?.phone) linksCount++;
  if (data.personal?.location) linksCount++;
  if (data.personal?.github) linksCount++;
  if (data.personal?.linkedin) linksCount++;
  if (data.personal?.portfolio) linksCount++;
  headerHeight += Math.ceil(linksCount / 4) * 16;

  currentHeight += headerHeight;

  // Summary text
  if (data.personal?.summary) {
    const summaryHeight = 25 + Math.ceil(data.personal.summary.length / 100) * 15;
    currentHeight += summaryHeight;
  }

  // Helper to get active budget limit
  const getActiveLimit = () => (currentPageNum === 1 ? PAGE_1_MAX : PAGE_N_MAX);

  // Helper to transition to next page
  const moveToNextPage = () => {
    pages.push(currentPage);
    currentPageNum++;
    currentPage = {
      pageNum: currentPageNum,
      showHeader: false,
      experience: [],
      projects: [],
      education: [],
      certifications: [],
      languages: [],
      skills: '',
    };
    currentHeight = 25; // top section heading offset
  };

  // 2. Distribute Experiences
  if (data.experience && data.experience.length > 0) {
    let sectionHeadingAdded = false;

    data.experience.forEach((item) => {
      let itemHeight = 32;
      if (item.description) {
        itemHeight += Math.ceil(item.description.length / 95) * 15;
      }

      const headingHeight = !sectionHeadingAdded ? 28 : 0;

      if (currentHeight + itemHeight + headingHeight > getActiveLimit()) {
        moveToNextPage();
        sectionHeadingAdded = false;
      }

      if (!sectionHeadingAdded) {
        currentHeight += 28;
        sectionHeadingAdded = true;
      }

      currentPage.experience.push(item);
      currentHeight += itemHeight;
    });
  }

  // 3. Distribute Projects
  if (data.projects && data.projects.length > 0) {
    let sectionHeadingAdded = false;

    data.projects.forEach((item) => {
      let itemHeight = 30;
      if (item.githubFront || item.githubBack || item.liveUrl) {
        itemHeight += 14;
      }
      if (item.description) {
        itemHeight += Math.ceil(item.description.length / 95) * 15;
      }

      const headingHeight = !sectionHeadingAdded ? 28 : 0;

      if (currentHeight + itemHeight + headingHeight > getActiveLimit()) {
        moveToNextPage();
        sectionHeadingAdded = false;
      }

      if (!sectionHeadingAdded) {
        currentHeight += 28;
        sectionHeadingAdded = true;
      }

      currentPage.projects.push(item);
      currentHeight += itemHeight;
    });
  }

  // 4. Distribute Education
  if (data.education && data.education.length > 0) {
    let sectionHeadingAdded = false;

    data.education.forEach((item) => {
      const itemHeight = 38;
      const headingHeight = !sectionHeadingAdded ? 28 : 0;

      if (currentHeight + itemHeight + headingHeight > getActiveLimit()) {
        moveToNextPage();
        sectionHeadingAdded = false;
      }

      if (!sectionHeadingAdded) {
        currentHeight += 28;
        sectionHeadingAdded = true;
      }

      currentPage.education.push(item);
      currentHeight += itemHeight;
    });
  }

  // 5. Distribute Skills
  if (data.skills) {
    const skillsList = data.skills.split(',').map(s => s.trim()).filter(Boolean);
    // Skills pills fit ~10-12 pills per row in flex container
    const skillsHeight = 28 + Math.ceil(skillsList.length / 10) * 22;

    if (currentHeight + skillsHeight > getActiveLimit()) {
      moveToNextPage();
    }

    currentPage.skills = data.skills;
    currentHeight += skillsHeight;
  }

  // 6. Distribute Languages (Keep entire list together to avoid 1-word page breaks)
  if (data.languages && data.languages.length > 0) {
    const totalLangHeight = 28 + (data.languages.length * 18);

    if (currentHeight + totalLangHeight > getActiveLimit()) {
      moveToNextPage();
    }

    currentHeight += 28;
    data.languages.forEach((item) => {
      currentPage.languages.push(item);
      currentHeight += 18;
    });
  }

  // 7. Distribute Certifications
  if (data.certifications && data.certifications.length > 0) {
    let sectionHeadingAdded = false;

    data.certifications.forEach((item) => {
      const itemHeight = 28;
      const headingHeight = !sectionHeadingAdded ? 28 : 0;

      if (currentHeight + itemHeight + headingHeight > getActiveLimit()) {
        moveToNextPage();
        sectionHeadingAdded = false;
      }

      if (!sectionHeadingAdded) {
        currentHeight += 28;
        sectionHeadingAdded = true;
      }

      currentPage.certifications.push(item);
      currentHeight += itemHeight;
    });
  }

  // Push final page
  pages.push(currentPage);

  return pages;
}
