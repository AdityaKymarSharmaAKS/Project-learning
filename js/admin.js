/*
 * Kept because it is part of the requested folder structure.
 * There is NO admin panel, admin login, authentication, upload API or database.
 * This file only provides a small developer-side audit for the hard-coded catalogue.
 */
(() => {
  window.HubStaticAudit = function () {
    const data = window.HUB_SEED_DATA || { sections: [], subjects: [], resources: [] };
    const errors = [];
    const sectionIds = new Set(data.sections.map(section => section.id));
    const subjectIds = new Set();
    const resourceIds = new Set();

    data.subjects.forEach(subject => {
      if (subjectIds.has(subject.id)) errors.push(`Duplicate subject id: ${subject.id}`);
      subjectIds.add(subject.id);
      if (!sectionIds.has(subject.sectionId)) errors.push(`Unknown section for subject: ${subject.name}`);
      if (!subject.code) errors.push(`Missing subject code: ${subject.name}`);
      if (subject.credits === undefined || subject.credits === null) errors.push(`Missing credits: ${subject.name}`);
      if (!subject.branch) errors.push(`Missing branch applicability: ${subject.name}`);
      if (!Number.isInteger(subject.semesterNumber) || subject.semesterNumber < 1 || subject.semesterNumber > 8) errors.push(`Invalid semester number: ${subject.name}`);
    });
    const semesterCounts = Array.from({ length: 8 }, (_, index) => ({ semester: index + 1, count: 0 }));
    data.subjects.forEach(subject => {
      const slot = semesterCounts[Number(subject.semesterNumber) - 1];
      if (slot) slot.count += 1;
    });
    semesterCounts.forEach(item => {
      if (item.count === 0) errors.push(`No subjects assigned to Semester ${item.semester}`);
    });

    data.resources.forEach(resource => {
      if (resourceIds.has(resource.id)) errors.push(`Duplicate resource id: ${resource.id}`);
      resourceIds.add(resource.id);
      if (!subjectIds.has(resource.subjectId)) errors.push(`Unknown subject for resource: ${resource.title}`);
      if (!['notes', 'assignments', 'previous-papers', 'other'].includes(resource.category)) errors.push(`Invalid category: ${resource.title}`);
      if (!resource.filePath) errors.push(`Missing file path: ${resource.title}`);
    });

    return { ok: errors.length === 0, academicYears: data.sections.length, semesters: semesterCounts, subjects: data.subjects.length, resources: data.resources.length, errors };
  };
})();
