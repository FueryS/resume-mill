/**
 * src/utils/pagePartitioner.js
 * 
 * Purpose:
 * Google Docs-style deterministic A4 page partitioner with Safe Zone detection.
 * Accepts a dynamic safeZonePercent parameter (clamped 60% - 100%).
 * Supports template-aware dual-column layout calculations for the Creative template
 * (left sidebar vs right main body) and single-column calculations for Modern, Elegant, & Timeline.
 * Leaves a safe margin buffer above printable page limits, preventing edge-case
 * content clipping while packing content efficiently.
 * Automatically repeats sub-category group headers across page splits.
 */

import { getSkillGroups, groupListBySubCategory } from '@/components/Templates/resume/templateHelpers';

export function partitionResumeData(data, safeZonePercent = 88, templateName = 'modern') {
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

  const isCreative = templateName === 'creative';

  // Character wrapping estimators matching DOM CSS widths
  const mainCharsPerLine = isCreative ? 55 : 75;
  const sidebarCharsPerLine = 34;

  const getLineCount = (text, charsPerLine = mainCharsPerLine) => {
    if (!text) return 0;
    const rawLines = text.split('\n');
    return rawLines.reduce((sum, line) => {
      const lineLen = line.trim().length;
      return sum + (lineLen === 0 ? 1 : Math.max(1, Math.ceil(lineLen / charsPerLine)));
    }, 0);
  };

  let leftHeight = 0;   // Left column height (Page 1 for Creative)
  let rightHeight = 0;  // Right column / Main body height

  // 1. Calculate Page 1 Header and Summary Height
  let headerHeight = 70;
  if (data.personal?.pfp) headerHeight = 120;
  
  let linksCount = 0;
  if (data.personal?.email) linksCount++;
  if (data.personal?.phone) linksCount++;
  if (data.personal?.location) linksCount++;
  if (data.personal?.github) linksCount++;
  if (data.personal?.linkedin) linksCount++;
  if (data.personal?.portfolio) linksCount++;
  headerHeight += Math.ceil(linksCount / (isCreative ? 1 : 3)) * 20;

  let summaryHeight = 0;
  if (data.personal?.summary) {
    const summaryLines = getLineCount(data.personal.summary, isCreative ? sidebarCharsPerLine : mainCharsPerLine);
    summaryHeight = 34 + summaryLines * 16;
  }

  if (isCreative) {
    // Creative Page 1: Header + Summary sit in Left Sidebar (starting at top padding 32px)
    leftHeight = 32 + headerHeight + summaryHeight;
    rightHeight = 32; // Main column starts at top padding 32px
  } else {
    // Standard Templates Page 1: Header + Summary sit at top of full-width page
    rightHeight = 38 + headerHeight + summaryHeight;
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
    leftHeight = 32;
    rightHeight = 32; // top section padding offset for page 2+
  };

  const sectionGroups = data.sectionGroups || {};
  const ungroupedPos = data.ungroupedPosition || {};

  // Height estimation helpers matching real DOM styles
  const getExpItemHeight = (item) => {
    let h = 48;
    if (item.description) {
      h += getLineCount(item.description, mainCharsPerLine) * 16;
    }
    return h + 14;
  };

  const getProjItemHeight = (item) => {
    let h = 46;
    if (item.technologies) h += 20;
    if (item.description) {
      h += getLineCount(item.description, mainCharsPerLine) * 16;
    }
    return h + 14;
  };

  const getEduItemHeight = (item) => {
    const chars = isCreative && currentPageNum === 1 ? sidebarCharsPerLine : mainCharsPerLine;
    let h = 56;
    if (item.institution) {
      h += Math.max(0, getLineCount(item.institution, chars) - 1) * 16;
    }
    return h + 12;
  };

  const getCertItemHeight = (item) => {
    return 44 + 10;
  };

  const getAchItemHeight = (item) => {
    let h = 42;
    if (item.description) {
      h += getLineCount(item.description, mainCharsPerLine) * 16;
    }
    return h + 10;
  };

  // Fine-grained partitioner for array sections
  const partitionArraySection = (sectionKey, rawList, getItemHeightFn, isSidebarSection = false) => {
    if (!rawList || rawList.length === 0) return;

    const groupOrder = sectionGroups[sectionKey];
    const { ungrouped, groups } = groupListBySubCategory(rawList, groupOrder);
    const groupKeys = Object.keys(groups);
    const pos = ungroupedPos[sectionKey] || 'start';

    let sectionHeadingAdded = false;

    const getTargetHeight = () => (isSidebarSection && isCreative && currentPageNum === 1 ? leftHeight : rightHeight);
    const setTargetHeight = (val) => {
      if (isSidebarSection && isCreative && currentPageNum === 1) {
        leftHeight = val;
      } else {
        rightHeight = val;
      }
    };

    const ensureSectionHeading = (neededSpace = 40) => {
      if (!sectionHeadingAdded) {
        const cur = getTargetHeight();
        if (cur + 42 + neededSpace > SAFE_ZONE_TOP) {
          moveToNextPage();
        }
        setTargetHeight(getTargetHeight() + 42);
        sectionHeadingAdded = true;
      }
    };

    const addItems = (items) => {
      items.forEach((item) => {
        const itemH = getItemHeightFn(item);
        ensureSectionHeading(itemH);
        if (getTargetHeight() + itemH > SAFE_ZONE_TOP) {
          moveToNextPage();
          sectionHeadingAdded = true;
        }
        currentPage[sectionKey].push(item);
        setTargetHeight(getTargetHeight() + itemH);
      });
    };

    const addGroups = () => {
      groupKeys.forEach((gName) => {
        const gItems = groups[gName];
        if (!gItems || gItems.length === 0) return;

        const groupHeaderH = 28;
        const firstItemH = getItemHeightFn(gItems[0]);

        ensureSectionHeading(groupHeaderH + firstItemH);

        if (getTargetHeight() + groupHeaderH + firstItemH > SAFE_ZONE_TOP) {
          moveToNextPage();
          sectionHeadingAdded = true;
        }

        setTargetHeight(getTargetHeight() + groupHeaderH);

        gItems.forEach((item) => {
          const itemH = getItemHeightFn(item);
          if (getTargetHeight() + itemH > SAFE_ZONE_TOP) {
            moveToNextPage();
            sectionHeadingAdded = true;
            setTargetHeight(getTargetHeight() + groupHeaderH); // repeat sub-group header context on new page
          }
          currentPage[sectionKey].push(item);
          setTargetHeight(getTargetHeight() + itemH);
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

  // 2. Experience (Main body)
  partitionArraySection('experience', data.experience, getExpItemHeight, false);

  // 3. Projects (Main body)
  partitionArraySection('projects', data.projects, getProjItemHeight, false);

  // 4. Education (Sidebar on Creative Page 1, Main body on Page 2+ or other templates)
  partitionArraySection('education', data.education, getEduItemHeight, true);

  // 5. Skills Partitioning
  if (data.skills && data.skills.length > 0) {
    const rawSkills = Array.isArray(data.skills) ? data.skills : [];
    const { ungrouped: unSkills, groups: skGroups } = getSkillGroups(rawSkills, sectionGroups.skills);
    const skGroupKeys = Object.keys(skGroups);
    const pos = ungroupedPos.skills || 'start';
    const showRating = Boolean(data.showSkillRating);

    let sectionHeadingAdded = false;

    const ensureSkillsSectionHeading = (neededSpace = 40) => {
      if (!sectionHeadingAdded) {
        if (rightHeight + 42 + neededSpace > SAFE_ZONE_TOP) {
          moveToNextPage();
        }
        rightHeight += 42;
        sectionHeadingAdded = true;
      }
    };

    const calcSkillSetDOMHeight = (skillsArr) => {
      if (!skillsArr || skillsArr.length === 0) return 0;
      if (showRating) {
        const rows = Math.ceil(skillsArr.length / 2);
        return rows * 34 + 12;
      } else {
        const rows = Math.ceil(skillsArr.length / 4);
        return rows * 30 + 10;
      }
    };

    const addUngroupedSkills = () => {
      if (!unSkills || unSkills.length === 0) return;
      const blockH = calcSkillSetDOMHeight(unSkills);
      ensureSkillsSectionHeading(blockH);

      if (rightHeight + blockH > SAFE_ZONE_TOP) {
        const itemsPerRow = showRating ? 2 : 4;
        const rowH = showRating ? 34 : 30;

        for (let i = 0; i < unSkills.length; i += itemsPerRow) {
          const chunk = unSkills.slice(i, i + itemsPerRow);
          if (rightHeight + rowH > SAFE_ZONE_TOP) {
            moveToNextPage();
            sectionHeadingAdded = true;
          }
          const mappedChunk = chunk.map(s => ({ ...s, group: 'none' }));
          currentPage.skills = [...(currentPage.skills || []), ...mappedChunk];
          rightHeight += rowH;
        }
        rightHeight += 8;
      } else {
        const mappedUnskills = unSkills.map(s => ({ ...s, group: 'none' }));
        currentPage.skills = [...(currentPage.skills || []), ...mappedUnskills];
        rightHeight += blockH;
      }
    };

    const addGroupedSkills = () => {
      skGroupKeys.forEach((gName) => {
        const gSkills = skGroups[gName];
        if (!gSkills || gSkills.length === 0) return;

        const groupHeaderH = 28;
        const groupSkillsH = calcSkillSetDOMHeight(gSkills);
        const totalGroupBlockH = groupHeaderH + groupSkillsH;

        ensureSkillsSectionHeading(totalGroupBlockH);

        if (rightHeight + totalGroupBlockH > SAFE_ZONE_TOP) {
          const itemsPerRow = showRating ? 2 : 4;
          const rowH = showRating ? 34 : 30;

          if (rightHeight + groupHeaderH + rowH > SAFE_ZONE_TOP) {
            moveToNextPage();
            sectionHeadingAdded = true;
          }

          rightHeight += groupHeaderH;

          for (let i = 0; i < gSkills.length; i += itemsPerRow) {
            const chunk = gSkills.slice(i, i + itemsPerRow);

            if (rightHeight + rowH > SAFE_ZONE_TOP) {
              moveToNextPage();
              sectionHeadingAdded = true;
              rightHeight += groupHeaderH;
            }

            const mappedChunk = chunk.map(s => ({ ...s, group: gName }));
            currentPage.skills = [...(currentPage.skills || []), ...mappedChunk];
            rightHeight += rowH;
          }
          rightHeight += 8;
        } else {
          rightHeight += groupHeaderH;
          const mappedGSkills = gSkills.map(s => ({ ...s, group: gName }));
          currentPage.skills = [...(currentPage.skills || []), ...mappedGSkills];
          rightHeight += groupSkillsH;
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

  // 6. Languages (Sidebar on Creative Page 1, Main body on Page 2+ or other templates)
  if (data.languages && data.languages.length > 0) {
    const totalLangHeight = 38 + Math.ceil(data.languages.length / (isCreative && currentPageNum === 1 ? 1 : 2)) * 26;
    const isSidebarLang = isCreative && currentPageNum === 1;
    const targetH = isSidebarLang ? leftHeight : rightHeight;

    if (targetH + totalLangHeight > SAFE_ZONE_TOP) {
      moveToNextPage();
    }
    data.languages.forEach((item) => {
      currentPage.languages.push(item);
    });
    if (isSidebarLang) {
      leftHeight += totalLangHeight;
    } else {
      rightHeight += totalLangHeight;
    }
  }

  // 7. Certifications
  partitionArraySection('certifications', data.certifications, getCertItemHeight, false);

  // 8. Achievements
  partitionArraySection('achievements', data.achievements, getAchItemHeight, false);

  // Push final page
  pages.push(currentPage);

  return pages;
}
