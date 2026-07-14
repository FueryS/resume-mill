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
  // Printable area is 1123px - 100px padding = 1023px
  const PAGE_1_MAX = 800; // smaller budget due to header + summary
  const PAGE_N_MAX = 980;

  let currentHeight = 0;

  // 1. Calculate Page 1 Header and Summary Height
  // Header: Name, contact links, portfolio
  let headerHeight = 110;
  if (data.personal?.pfp) headerHeight = 160;
  
  // Estimate personal social link rows
  let linksCount = 0;
  if (data.personal?.email) linksCount++;
  if (data.personal?.phone) linksCount++;
  if (data.personal?.location) linksCount++;
  if (data.personal?.github) linksCount++;
  if (data.personal?.linkedin) linksCount++;
  if (data.personal?.portfolio) linksCount++;
  headerHeight += Math.ceil(linksCount / 3) * 20;

  currentHeight += headerHeight;

  // Summary text
  if (data.personal?.summary) {
    const summaryHeight = 40 + Math.ceil(data.personal.summary.length / 85) * 16;
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
    currentHeight = 40; // top section heading offset
  };

  // 2. Distribute Experiences
  if (data.experience && data.experience.length > 0) {
    let sectionHeadingAdded = false;

    data.experience.forEach((item) => {
      // Estimate card height
      let itemHeight = 55; // company, role, location, date headers
      if (item.description) {
        itemHeight += Math.ceil(item.description.length / 80) * 16;
      }

      // Add section heading height once on a page
      const headingHeight = !sectionHeadingAdded ? 40 : 0;

      if (currentHeight + itemHeight + headingHeight > getActiveLimit()) {
        moveToNextPage();
        sectionHeadingAdded = false;
      }

      if (!sectionHeadingAdded) {
        currentHeight += 40;
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
      // Estimate project card height
      let itemHeight = 50; // name, stack, dates
      // Add lines for links if present
      if (item.githubFront || item.githubBack || item.liveUrl) {
        itemHeight += 18;
      }
      if (item.description) {
        itemHeight += Math.ceil(item.description.length / 80) * 16;
      }

      const headingHeight = !sectionHeadingAdded ? 40 : 0;

      if (currentHeight + itemHeight + headingHeight > getActiveLimit()) {
        moveToNextPage();
        sectionHeadingAdded = false;
      }

      if (!sectionHeadingAdded) {
        currentHeight += 40;
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
      // Estimate education height
      const itemHeight = 65; // Institution, degree, dates, grade, location

      const headingHeight = !sectionHeadingAdded ? 40 : 0;

      if (currentHeight + itemHeight + headingHeight > getActiveLimit()) {
        moveToNextPage();
        sectionHeadingAdded = false;
      }

      if (!sectionHeadingAdded) {
        currentHeight += 40;
        sectionHeadingAdded = true;
      }

      currentPage.education.push(item);
      currentHeight += itemHeight;
    });
  }

  // 5. Distribute Skills (Rendered as pill blocks)
  if (data.skills) {
    // Estimate skills height
    const skillsList = data.skills.split(',').map(s => s.trim()).filter(Boolean);
    const skillsHeight = 40 + Math.ceil(skillsList.length / 6) * 26; // approx 6 pills per row

    if (currentHeight + skillsHeight > getActiveLimit()) {
      moveToNextPage();
    }

    currentPage.skills = data.skills;
    currentHeight += skillsHeight;
  }

  // 6. Distribute Languages
  if (data.languages && data.languages.length > 0) {
    let sectionHeadingAdded = false;

    data.languages.forEach((item) => {
      const itemHeight = 24; // individual line
      const headingHeight = !sectionHeadingAdded ? 40 : 0;

      if (currentHeight + itemHeight + headingHeight > getActiveLimit()) {
        moveToNextPage();
        sectionHeadingAdded = false;
      }

      if (!sectionHeadingAdded) {
        currentHeight += 40;
        sectionHeadingAdded = true;
      }

      currentPage.languages.push(item);
      currentHeight += itemHeight;
    });
  }

  // 7. Distribute Certifications
  if (data.certifications && data.certifications.length > 0) {
    let sectionHeadingAdded = false;

    data.certifications.forEach((item) => {
      const itemHeight = 45; // title, authority, date, link
      const headingHeight = !sectionHeadingAdded ? 40 : 0;

      if (currentHeight + itemHeight + headingHeight > getActiveLimit()) {
        moveToNextPage();
        sectionHeadingAdded = false;
      }

      if (!sectionHeadingAdded) {
        currentHeight += 40;
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
