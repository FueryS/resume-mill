/**
 * templateHelpers.js
 * 
 * Purpose:
 * Common utilities for resume templates:
 * - URL display formatting
 * - Skill parsing and sub-category grouping
 * - General section list sub-category partitioning (Experience, Projects, Education, Certifications, Achievements)
 * - Preserves custom user-defined sectionGroupOrder when rendering template groups.
 * - Preserves item.group property on skill objects so grouping is never lost.
 */

export const formatDisplayUrl = (url) => {
  if (!url) return '';
  return url
    .replace(/^(https?:\/\/)?(www\.)?/, '')
    .replace(/\/$/, '');
};

/**
 * Returns sub-grouped and ungrouped skills lists, preserving defined sectionGroupOrder
 * @param {Array|string} skillsData 
 * @param {Array<string>} sectionGroupOrder
 * @returns {{ ungrouped: Array<{name: string, level: number, group: string}>, groups: Object<string, Array<{name: string, level: number, group: string}>> }}
 */
export const getSkillGroups = (skillsData, sectionGroupOrder = []) => {
  if (!skillsData) return { ungrouped: [], groups: {} };

  let rawSkills = [];
  if (Array.isArray(skillsData)) {
    rawSkills = skillsData;
  } else if (typeof skillsData === 'string') {
    rawSkills = skillsData
      .split(',')
      .map(s => ({ name: s.trim(), level: 5, group: 'none' }))
      .filter(s => s.name);
  }

  const ungrouped = [];
  const groups = {};

  rawSkills.forEach((item) => {
    const name = typeof item === 'string' ? item : item?.name;
    if (!name || !name.trim()) return;
    const level = typeof item === 'object' ? item.level || 5 : 5;
    const itemGroup = typeof item === 'object' ? item.group || 'none' : 'none';
    const group = (itemGroup && itemGroup !== 'none') ? itemGroup : null;

    const skillObj = { 
      id: item?.id, 
      name: name.trim(), 
      level, 
      group: itemGroup 
    };

    if (group) {
      if (!groups[group]) groups[group] = [];
      groups[group].push(skillObj);
    } else {
      ungrouped.push(skillObj);
    }
  });

  const sortedGroups = {};
  if (Array.isArray(sectionGroupOrder) && sectionGroupOrder.length > 0) {
    sectionGroupOrder.forEach((gName) => {
      if (groups[gName]) {
        sortedGroups[gName] = groups[gName];
      }
    });
    Object.keys(groups).forEach((gName) => {
      if (!sortedGroups[gName]) {
        sortedGroups[gName] = groups[gName];
      }
    });
  } else {
    Object.assign(sortedGroups, groups);
  }

  return { ungrouped, groups: sortedGroups };
};

/**
 * Groups an array of items (Experience, Projects, Education, Certifications, Achievements)
 * into sub-category groups and ungrouped items, preserving defined sectionGroupOrder
 * @param {Array} list 
 * @param {Array<string>} sectionGroupOrder
 * @returns {{ ungrouped: Array, groups: Object<string, Array> }}
 */
export const groupListBySubCategory = (list, sectionGroupOrder = []) => {
  if (!list || !Array.isArray(list)) return { ungrouped: [], groups: {} };

  const ungrouped = [];
  const groups = {};

  list.forEach((item) => {
    if (!item) return;
    const groupName = (item.group && item.group !== 'none') ? item.group : null;
    if (groupName) {
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(item);
    } else {
      ungrouped.push(item);
    }
  });

  const sortedGroups = {};
  if (Array.isArray(sectionGroupOrder) && sectionGroupOrder.length > 0) {
    sectionGroupOrder.forEach((gName) => {
      if (groups[gName]) {
        sortedGroups[gName] = groups[gName];
      }
    });
    Object.keys(groups).forEach((gName) => {
      if (!sortedGroups[gName]) {
        sortedGroups[gName] = groups[gName];
      }
    });
  } else {
    Object.assign(sortedGroups, groups);
  }

  return { ungrouped, groups: sortedGroups };
};
