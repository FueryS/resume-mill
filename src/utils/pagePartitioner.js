/**
 * src/utils/pagePartitioner.js
 * 
 * Purpose:
 * Google Docs-style deterministic A4 page partitioner with Safe Zone detection.
 * Accepts a dynamic safeZonePercent parameter (clamped 60% - 100%).
 * Leaves a safe margin buffer above printable page limits, preventing edge-case
 * content clipping while packing content efficiently.
 * Automatically repeats sub-category group headers across page splits.
 */

import { getSkillGroups, groupListBySubCategory } from '@/components/Templates/resume/templateHelpers';

export function partitionResumeData(data, safeZonePercent = 88) {
  if (!data) return [];

  const pages = [];
  
  let currentPageNum = 1;
  let currentPage = {
    pageNum: 1,
    showHeader: true,
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    achievements: [],
    languages: [],
    skills: [],
  };

  // Dynamic Safe Zone Threshold:
  // Clamped between 60% and 100% of the 1123px A4 canvas height
  const clampedPercent = Math.max(60, Math.min(100, Number(safeZonePercent) || 88));
  const SAFE_ZONE_TOP = Math.round((clampedPercent / 100) * 1123);
  let currentHeight = 0;

  // 1. Calculate Page 1 Header and Summary Height
  let headerHeight = 70;
  if (data.personal?.pfp) headerHeight = 115;
  
  let linksCount = 0;
  if (data.personal?.email) linksCount++;
  if (data.personal?.phone) linksCount++;
  if (data.personal?.location) linksCount++;
  if (data.personal?.github) linksCount++;
  if (data.personal?.linkedin) linksCount++;
  if (data.personal?.portfolio) linksCount++;
  headerHeight += Math.ceil(linksCount / 3) * 16;

  currentHeight += headerHeight;

  // Summary text
  if (data.personal?.summary) {
    const summaryLines = Math.ceil(data.personal.summary.length / 85);
    const summaryHeight = 28 + summaryLines * 15 + 10;
    currentHeight += summaryHeight;
  }

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
      achievements: [],
      languages: [],
      skills: [],
    };
    currentHeight = 30; // top section padding offset
  };

  const sectionGroups = data.sectionGroups || {};
  const ungroupedPos = data.ungroupedPosition || {};

  // Height estimation helpers matching real DOM styles
  const getExpItemHeight = (item) => {
    let h = 42;
    if (item.description) {
      h += Math.ceil(item.description.length / 80) * 15;
    }
    return h + 12;
  };

  const getProjItemHeight = (item) => {
    let h = 40;
    if (item.technologies) h += 18;
    if (item.description) {
      h += Math.ceil(item.description.length / 80) * 15;
    }
    return h + 14;
  };

  const getEduItemHeight = (item) => {
    return 48 + 10;
  };

  const getCertItemHeight = (item) => {
    return 36 + 8;
  };

  const getAchItemHeight = (item) => {
    let h = 36;
    if (item.description) {
      h += Math.ceil(item.description.length / 80) * 15;
    }
    return h + 8;
  };

  // Fine-grained partitioner for array sections (experience, projects, education, certifications, achievements)
  const partitionArraySection = (sectionKey, rawList, getItemHeightFn) => {
    if (!rawList || rawList.length === 0) return;

    const groupOrder = sectionGroups[sectionKey];
    const { ungrouped, groups } = groupListBySubCategory(rawList, groupOrder);
    const groupKeys = Object.keys(groups);
    const pos = ungroupedPos[sectionKey] || 'start';

    let sectionHeadingAdded = false;

    const ensureSectionHeading = (neededSpace = 40) => {
      if (!sectionHeadingAdded) {
        if (currentHeight + 34 + neededSpace > SAFE_ZONE_TOP) {
          moveToNextPage();
        }
        currentHeight += 34;
        sectionHeadingAdded = true;
      }
    };

    const addItems = (items) => {
      items.forEach((item) => {
        const itemH = getItemHeightFn(item);
        ensureSectionHeading(itemH);
        if (currentHeight + itemH > SAFE_ZONE_TOP) {
          moveToNextPage();
          sectionHeadingAdded = true;
        }
        currentPage[sectionKey].push(item);
        currentHeight += itemH;
      });
    };

    const addGroups = () => {
      groupKeys.forEach((gName) => {
        const gItems = groups[gName];
        if (!gItems || gItems.length === 0) return;

        const groupHeaderH = 26;
        const firstItemH = getItemHeightFn(gItems[0]);

        ensureSectionHeading(groupHeaderH + firstItemH);

        if (currentHeight + groupHeaderH + firstItemH > SAFE_ZONE_TOP) {
          moveToNextPage();
          sectionHeadingAdded = true;
        }

        currentHeight += groupHeaderH;

        gItems.forEach((item) => {
          const itemH = getItemHeightFn(item);
          if (currentHeight + itemH > SAFE_ZONE_TOP) {
            moveToNextPage();
            sectionHeadingAdded = true;
            currentHeight += groupHeaderH; // repeat sub-group header context on new page
          }
          currentPage[sectionKey].push(item);
          currentHeight += itemH;
        });
      });
    };

    if (pos === 'start') {
      addItems(ungrouped);
      addGroups();
    } else {
      addGroups();
      addItems(ungrouped);
    }
  };

  // 2. Experience
  partitionArraySection('experience', data.experience, getExpItemHeight);

  // 3. Projects
  partitionArraySection('projects', data.projects, getProjItemHeight);

  // 4. Education
  partitionArraySection('education', data.education, getEduItemHeight);

  // 5. Skills Partitioning with Dynamic Safe Zone Calculations
  if (data.skills && data.skills.length > 0) {
    const rawSkills = Array.isArray(data.skills) ? data.skills : [];
    const { ungrouped: unSkills, groups: skGroups } = getSkillGroups(rawSkills, sectionGroups.skills);
    const skGroupKeys = Object.keys(skGroups);
    const pos = ungroupedPos.skills || 'start';
    const showRating = Boolean(data.showSkillRating);

    let sectionHeadingAdded = false;

    const ensureSkillsSectionHeading = (neededSpace = 40) => {
      if (!sectionHeadingAdded) {
        if (currentHeight + 34 + neededSpace > SAFE_ZONE_TOP) {
          moveToNextPage();
        }
        currentHeight += 34;
        sectionHeadingAdded = true;
      }
    };

    const calcSkillSetDOMHeight = (skillsArr) => {
      if (!skillsArr || skillsArr.length === 0) return 0;
      if (showRating) {
        const rows = Math.ceil(skillsArr.length / 2);
        return rows * 32 + 10;
      } else {
        const rows = Math.ceil(skillsArr.length / 4.5);
        return rows * 28 + 8;
      }
    };

    const addUngroupedSkills = () => {
      if (!unSkills || unSkills.length === 0) return;
      const blockH = calcSkillSetDOMHeight(unSkills);
      ensureSkillsSectionHeading(blockH);

      if (currentHeight + blockH > SAFE_ZONE_TOP) {
        const itemsPerRow = showRating ? 2 : 4;
        const rowH = showRating ? 32 : 28;

        for (let i = 0; i < unSkills.length; i += itemsPerRow) {
          const chunk = unSkills.slice(i, i + itemsPerRow);
          if (currentHeight + rowH > SAFE_ZONE_TOP) {
            moveToNextPage();
            sectionHeadingAdded = true;
          }
          const mappedChunk = chunk.map(s => ({ ...s, group: 'none' }));
          currentPage.skills = [...(currentPage.skills || []), ...mappedChunk];
          currentHeight += rowH;
        }
        currentHeight += 8;
      } else {
        const mappedUnskills = unSkills.map(s => ({ ...s, group: 'none' }));
        currentPage.skills = [...(currentPage.skills || []), ...mappedUnskills];
        currentHeight += blockH;
      }
    };

    const addGroupedSkills = () => {
      skGroupKeys.forEach((gName) => {
        const gSkills = skGroups[gName];
        if (!gSkills || gSkills.length === 0) return;

        const groupHeaderH = 26;
        const groupSkillsH = calcSkillSetDOMHeight(gSkills);
        const totalGroupBlockH = groupHeaderH + groupSkillsH;

        ensureSkillsSectionHeading(totalGroupBlockH);

        if (currentHeight + totalGroupBlockH > SAFE_ZONE_TOP) {
          const itemsPerRow = showRating ? 2 : 4;
          const rowH = showRating ? 32 : 28;

          if (currentHeight + groupHeaderH + rowH > SAFE_ZONE_TOP) {
            moveToNextPage();
            sectionHeadingAdded = true;
          }

          currentHeight += groupHeaderH;

          for (let i = 0; i < gSkills.length; i += itemsPerRow) {
            const chunk = gSkills.slice(i, i + itemsPerRow);

            if (currentHeight + rowH > SAFE_ZONE_TOP) {
              moveToNextPage();
              sectionHeadingAdded = true;
              currentHeight += groupHeaderH; // repeat sub-group header on next page
            }

            const mappedChunk = chunk.map(s => ({ ...s, group: gName }));
            currentPage.skills = [...(currentPage.skills || []), ...mappedChunk];
            currentHeight += rowH;
          }
          currentHeight += 8;
        } else {
          currentHeight += groupHeaderH;
          const mappedGSkills = gSkills.map(s => ({ ...s, group: gName }));
          currentPage.skills = [...(currentPage.skills || []), ...mappedGSkills];
          currentHeight += groupSkillsH;
        }
      });
    };

    if (pos === 'start') {
      addUngroupedSkills();
      addGroupedSkills();
    } else {
      addGroupedSkills();
      addUngroupedSkills();
    }
  }

  // 6. Languages
  if (data.languages && data.languages.length > 0) {
    const totalLangHeight = 32 + Math.ceil(data.languages.length / 2) * 24;
    if (currentHeight + totalLangHeight > SAFE_ZONE_TOP) {
      moveToNextPage();
    }
    data.languages.forEach((item) => {
      currentPage.languages.push(item);
    });
    currentHeight += totalLangHeight;
  }

  // 7. Certifications
  partitionArraySection('certifications', data.certifications, getCertItemHeight);

  // 8. Achievements
  partitionArraySection('achievements', data.achievements, getAchItemHeight);

  // Push final page
  pages.push(currentPage);

  return pages;
}
