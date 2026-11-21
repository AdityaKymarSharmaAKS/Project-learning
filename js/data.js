/*
 * STUDENT HUB — MANUAL CONTENT FILE
 * Add/edit subjects and resources here. No database or admin panel is used.
 * To add a resource: copy the file into assets/, then add an object to resources.
 */
(() => {
  const sections = [
    { id: 'year-1', name: 'First Year', shortName: 'YEAR 01', description: 'Build your foundations and core skills.', icon: '✦', tone: 'purple' },
    { id: 'year-2', name: 'Second Year', shortName: 'YEAR 02', description: 'Develop the concepts behind computing.', icon: '⌘', tone: 'blue' },
    { id: 'year-3', name: 'Third Year', shortName: 'YEAR 03', description: 'Explore systems, networks and intelligent software.', icon: '◈', tone: 'green' },
    { id: 'year-4', name: 'Fourth Year', shortName: 'YEAR 04', description: 'Bring your learning together and prepare for industry.', icon: '◇', tone: 'orange' }
  ];

  const subjects = [
    { id: "sub-01", name: "Calculus and Linear Algebra", sectionId: "year-1", semester: "Semester 1", semesterNumber: 1, code: "BAS101 / BAS201", credits: 4, branch: "B. Tech CSE (All Branches)" },
    { id: "sub-02", name: "Quantum Physics and Applications / Engineering Physics", sectionId: "year-1", semester: "Semester 1", semesterNumber: 1, code: "BAS102 / BAS202", credits: 3, branch: "B. Tech CSE (All Branches)" },
    { id: "sub-03", name: "Fundamentals of Electrical Engineering / Electronics Engineering", sectionId: "year-1", semester: "Semester 1", semesterNumber: 1, code: "BEE101 / BEC101", credits: 3, branch: "B. Tech CSE (All Branches)" },
    { id: "sub-04", name: "Programming Languages", sectionId: "year-1", semester: "Semester 1", semesterNumber: 1, code: "BCS101 / BCS201", credits: 3, branch: "B. Tech CSE (All Branches)" },
    { id: "sub-05", name: "Professional Communication & Technical Writing", sectionId: "year-1", semester: "Semester 1", semesterNumber: 1, code: "BAS104", credits: 2, branch: "B. Tech CSE (All Branches)" },
    { id: "sub-06", name: "Introduction to AI & Prompt Engineering", sectionId: "year-1", semester: "Semester 1", semesterNumber: 1, code: "BAI101 / BME101", credits: 2, branch: "B. Tech CSE (All Branches)" },
    { id: "sub-07", name: "Applied Physics Lab", sectionId: "year-1", semester: "Semester 1", semesterNumber: 1, code: "BAS152", credits: 1, branch: "B. Tech CSE (All Branches)" },
    { id: "sub-08", name: "Electrical / Electronics Engineering Lab", sectionId: "year-1", semester: "Semester 1", semesterNumber: 1, code: "BEE151 / BEC151", credits: 1, branch: "B. Tech CSE (All Branches)" },
    { id: "sub-09", name: "Computer-Aided Engineering Drawing Lab", sectionId: "year-1", semester: "Semester 1", semesterNumber: 1, code: "BME151", credits: 2, branch: "B. Tech CSE (All Branches)" },
    { id: "sub-10", name: "Numerical Methods / Differential Equations", sectionId: "year-1", semester: "Semester 2", semesterNumber: 2, code: "BAS203", credits: 4, branch: "B. Tech CSE (All Branches)" },
    { id: "sub-11", name: "Applied Chemistry for Smart Systems", sectionId: "year-1", semester: "Semester 2", semesterNumber: 2, code: "BAS202", credits: 3, branch: "B. Tech CSE (All Branches)" },
    { id: "sub-12", name: "Fundamentals of Electronics Engineering", sectionId: "year-1", semester: "Semester 2", semesterNumber: 2, code: "BEC201", credits: 3, branch: "B. Tech CSE (All Branches)" },
    { id: "sub-13", name: "Essentials of Data Structure", sectionId: "year-1", semester: "Semester 2", semesterNumber: 2, code: "BCS202", credits: 3, branch: "B. Tech CSE (All Branches)" },
    { id: "sub-14", name: "Introduction to Indian Knowledge System", sectionId: "year-1", semester: "Semester 2", semesterNumber: 2, code: "BNC201", credits: 2, branch: "B. Tech CSE (All Branches)" },
    { id: "sub-15", name: "Fundamentals of Mechanical Engineering", sectionId: "year-1", semester: "Semester 2", semesterNumber: 2, code: "BME201", credits: 2, branch: "B. Tech CSE (All Branches)" },
    { id: "sub-16", name: "Applied Chemistry Lab", sectionId: "year-1", semester: "Semester 2", semesterNumber: 2, code: "BAS252", credits: 1, branch: "B. Tech CSE (All Branches)" },
    { id: "sub-17", name: "Data Structure Lab", sectionId: "year-1", semester: "Semester 2", semesterNumber: 2, code: "BCS251", credits: 1, branch: "B. Tech CSE (All Branches)" },
    { id: "sub-18", name: "Data Structures", sectionId: "year-2", semester: "Semester 3", semesterNumber: 3, code: "BCS301", credits: 4, branch: "B. Tech CSE (Core, AI & ML, Data Science, Cyber Security)" },
    { id: "sub-19", name: "Computer Organization & Architecture", sectionId: "year-2", semester: "Semester 3", semesterNumber: 3, code: "BCS302", credits: 4, branch: "B. Tech CSE (Core, AI & ML, Data Science, Cyber Security)" },
    { id: "sub-20", name: "Discrete Structures & Theory of Logic", sectionId: "year-2", semester: "Semester 3", semesterNumber: 3, code: "BCS303", credits: 3, branch: "B. Tech CSE (Core, AI & ML, Data Science, Cyber Security)" },
    { id: "sub-21", name: "Technical Communication", sectionId: "year-2", semester: "Semester 3", semesterNumber: 3, code: "BAS301", credits: 3, branch: "B. Tech CSE (Core, AI & ML, Data Science, Cyber Security)" },
    { id: "sub-22", name: "Mathematics-III / Science Based Open Elective", sectionId: "year-2", semester: "Semester 3", semesterNumber: 3, code: "BAS303 / BOE301", credits: 4, branch: "B. Tech CSE (Core, AI & ML, Data Science, Cyber Security)" },
    { id: "sub-23", name: "Cyber Security / Python Programming", sectionId: "year-2", semester: "Semester 3", semesterNumber: 3, code: "BCC301 / BCC302", credits: 2, branch: "B. Tech CSE (Core, AI & ML, Data Science, Cyber Security)" },
    { id: "sub-24", name: "Data Structures Lab", sectionId: "year-2", semester: "Semester 3", semesterNumber: 3, code: "BCS351", credits: 1, branch: "B. Tech CSE (Core, AI & ML, Data Science, Cyber Security)" },
    { id: "sub-25", name: "Computer Organization Lab", sectionId: "year-2", semester: "Semester 3", semesterNumber: 3, code: "BCS352", credits: 1, branch: "B. Tech CSE (Core, AI & ML, Data Science, Cyber Security)" },
    { id: "sub-26", name: "Web Designing Workshop", sectionId: "year-2", semester: "Semester 3", semesterNumber: 3, code: "BCS353", credits: 1, branch: "B. Tech CSE (Core, AI & ML, Data Science, Cyber Security)" },
    { id: "sub-27", name: "Operating Systems", sectionId: "year-2", semester: "Semester 4", semesterNumber: 4, code: "BCS401", credits: 4, branch: "B. Tech CSE (Core, AI & ML, Data Science, Cyber Security)" },
    { id: "sub-28", name: "Theory of Automata & Formal Languages", sectionId: "year-2", semester: "Semester 4", semesterNumber: 4, code: "BCS402", credits: 4, branch: "B. Tech CSE (Core, AI & ML, Data Science, Cyber Security)" },
    { id: "sub-29", name: "Object-Oriented Programming with Java", sectionId: "year-2", semester: "Semester 4", semesterNumber: 4, code: "BCS403", credits: 3, branch: "B. Tech CSE (Core, AI & ML, Data Science, Cyber Security)" },
    { id: "sub-30", name: "Universal Human Values & Professional Ethics", sectionId: "year-2", semester: "Semester 4", semesterNumber: 4, code: "BVE401", credits: 3, branch: "B. Tech CSE (Core, AI & ML, Data Science, Cyber Security)" },
    { id: "sub-31", name: "Mathematics IV (PDE, Probability and Statistics)", sectionId: "year-2", semester: "Semester 4", semesterNumber: 4, code: "BAS403", credits: 4, branch: "B. Tech CSE (Core, AI & ML, Data Science, Cyber Security)" },
    { id: "sub-32", name: "Python Programming / Cyber Security", sectionId: "year-2", semester: "Semester 4", semesterNumber: 4, code: "BCC401 / BCC402", credits: 2, branch: "B. Tech CSE (Core, AI & ML, Data Science, Cyber Security)" },
    { id: "sub-33", name: "Operating Systems Lab", sectionId: "year-2", semester: "Semester 4", semesterNumber: 4, code: "BCS451", credits: 1, branch: "B. Tech CSE (Core, AI & ML, Data Science, Cyber Security)" },
    { id: "sub-34", name: "Java Programming Lab", sectionId: "year-2", semester: "Semester 4", semesterNumber: 4, code: "BCS452", credits: 1, branch: "B. Tech CSE (Core, AI & ML, Data Science, Cyber Security)" },
    { id: "sub-35", name: "Cyber Security Workshop", sectionId: "year-2", semester: "Semester 4", semesterNumber: 4, code: "BCS453", credits: 1, branch: "B. Tech CSE (Core, AI & ML, Data Science, Cyber Security)" },
    { id: "sub-36", name: "Database Management System", sectionId: "year-3", semester: "Semester 5", semesterNumber: 5, code: "BCS501", credits: 4, branch: "B. Tech CSE (Core, AI & ML, Data Science, Cyber Security)" },
    { id: "sub-37", name: "Web Technology", sectionId: "year-3", semester: "Semester 5", semesterNumber: 5, code: "BCS502", credits: 4, branch: "B. Tech CSE Core / B. Tech CSE Data Science" },
    { id: "sub-38", name: "Web & Database Security", sectionId: "year-3", semester: "Semester 5", semesterNumber: 5, code: "BCCS501", credits: 4, branch: "B. Tech CSE Cyber Security" },
    { id: "sub-39", name: "Design and Analysis of Algorithm", sectionId: "year-3", semester: "Semester 5", semesterNumber: 5, code: "BCS503", credits: 4, branch: "B. Tech CSE (Core, AI & ML, Data Science, Cyber Security)" },
    { id: "sub-40", name: "Data Analytics (Dept Elective-I)", sectionId: "year-3", semester: "Semester 5", semesterNumber: 5, code: "BCS052 / BCCS051", credits: 3, branch: "B. Tech CSE Core / B. Tech CSE Data Science" },
    { id: "sub-41", name: "Data Forensics (Dept Elective-I)", sectionId: "year-3", semester: "Semester 5", semesterNumber: 5, code: "BCCS052", credits: 3, branch: "B. Tech CSE Cyber Security" },
    { id: "sub-42", name: "Machine Learning Techniques (Dept Elective-II)", sectionId: "year-3", semester: "Semester 5", semesterNumber: 5, code: "BCDS055 / KCS055", credits: 3, branch: "B. Tech CSE AI & ML" },
    { id: "sub-43", name: "Ethical Hacking (Dept Elective-II)", sectionId: "year-3", semester: "Semester 5", semesterNumber: 5, code: "BCCS054", credits: 3, branch: "B. Tech CSE Cyber Security" },
    { id: "sub-44", name: "Database Management System Lab", sectionId: "year-3", semester: "Semester 5", semesterNumber: 5, code: "BCS551", credits: 1, branch: "B. Tech CSE (All Branches)" },
    { id: "sub-45", name: "Web Technology Lab", sectionId: "year-3", semester: "Semester 5", semesterNumber: 5, code: "BCS552", credits: 1, branch: "B. Tech CSE (Core, Data Science, AI & ML)" },
    { id: "sub-46", name: "Design and Analysis of Algorithm Lab", sectionId: "year-3", semester: "Semester 5", semesterNumber: 5, code: "BCS553", credits: 1, branch: "B. Tech CSE (All Branches)" },
    { id: "sub-47", name: "Software Engineering", sectionId: "year-3", semester: "Semester 6", semesterNumber: 6, code: "BCS601", credits: 4, branch: "B. Tech CSE Core / B. Tech CSE AI & ML / B. Tech CSE Data Science" },
    { id: "sub-48", name: "Cryptography & Network Security", sectionId: "year-3", semester: "Semester 6", semesterNumber: 6, code: "BCCS601", credits: 4, branch: "B. Tech CSE Cyber Security" },
    { id: "sub-49", name: "Computer Networks", sectionId: "year-3", semester: "Semester 6", semesterNumber: 6, code: "BCS603", credits: 4, branch: "B. Tech CSE (All Branches)" },
    { id: "sub-50", name: "Mobile & Wireless Security (Dept Elective-III)", sectionId: "year-3", semester: "Semester 6", semesterNumber: 6, code: "BCCS061", credits: 3, branch: "B. Tech CSE Cyber Security" },
    { id: "sub-51", name: "Big Data Analytics (Dept Elective-III)", sectionId: "year-3", semester: "Semester 6", semesterNumber: 6, code: "BCDS062 / BCS061", credits: 3, branch: "B. Tech CSE Core / B. Tech CSE Data Science" },
    { id: "sub-52", name: "Constitution of India / Essence of Indian Traditional Knowledge", sectionId: "year-3", semester: "Semester 6", semesterNumber: 6, code: "BNC601 / BNC602", credits: "Audit (Non-Credit)", branch: "B. Tech CSE (All Branches)" },
    { id: "sub-53", name: "Software Engineering Lab", sectionId: "year-3", semester: "Semester 6", semesterNumber: 6, code: "BCS651", credits: 1, branch: "B. Tech CSE Core / B. Tech CSE Data Science" },
    { id: "sub-54", name: "Cryptography and Network Security Lab", sectionId: "year-3", semester: "Semester 6", semesterNumber: 6, code: "BCCS651", credits: 1, branch: "B. Tech CSE Cyber Security" },
    { id: "sub-55", name: "Computer Networks Lab", sectionId: "year-3", semester: "Semester 6", semesterNumber: 6, code: "BCS653", credits: 1, branch: "B. Tech CSE (All Branches)" },
    { id: "sub-56", name: "Project Management & Entrepreneurship / Rural Development", sectionId: "year-4", semester: "Semester 7", semesterNumber: 7, code: "KHU701 / KHU702 / BAS701", credits: 3, branch: "B. Tech CSE (All Branches)" },
    { id: "sub-57", name: "Artificial Intelligence / Deep Learning", sectionId: "year-4", semester: "Semester 7", semesterNumber: 7, code: "KCS071 / BAI701", credits: 3, branch: "B. Tech CSE Core / B. Tech CSE AI & ML" },
    { id: "sub-58", name: "Cloud Computing (Dept Elective-IV)", sectionId: "year-4", semester: "Semester 7", semesterNumber: 7, code: "KCS713", credits: 3, branch: "B. Tech CSE Core / B. Tech CSE Data Science" },
    { id: "sub-59", name: "Information Security Risk Management (Dept Elective-IV)", sectionId: "year-4", semester: "Semester 7", semesterNumber: 7, code: "BCCS071", credits: 3, branch: "B. Tech CSE Cyber Security" },
    { id: "sub-60", name: "Open Elective-II", sectionId: "year-4", semester: "Semester 7", semesterNumber: 7, code: "KOE074 / BOE071", credits: 3, branch: "B. Tech CSE (All Branches)" },
    { id: "sub-61", name: "Departmental Elective Lab", sectionId: "year-4", semester: "Semester 7", semesterNumber: 7, code: "KCS751A / BAI751", credits: 1, branch: "B. Tech CSE (All Branches)" },
    { id: "sub-62", name: "Mini Project or Internship Assessment", sectionId: "year-4", semester: "Semester 7", semesterNumber: 7, code: "KCS752 / BCS752", credits: 2, branch: "B. Tech CSE (All Branches)" },
    { id: "sub-63", name: "Project Phase-I", sectionId: "year-4", semester: "Semester 7", semesterNumber: 7, code: "KCS753 / BCS753", credits: 4, branch: "B. Tech CSE (All Branches)" },
    { id: "sub-64", name: "Open Elective-III", sectionId: "year-4", semester: "Semester 8", semesterNumber: 8, code: "KOE085 / BOE081", credits: 3, branch: "B. Tech CSE (All Branches)" },
    { id: "sub-65", name: "Open Elective-IV", sectionId: "year-4", semester: "Semester 8", semesterNumber: 8, code: "KOE090 / BOE088", credits: 3, branch: "B. Tech CSE (All Branches)" },
    { id: "sub-66", name: "Major Project Phase-II", sectionId: "year-4", semester: "Semester 8", semesterNumber: 8, code: "KCS851 / BCS851", credits: 9, branch: "B. Tech CSE (All Branches)" }
  ];

  /*
   * DEMO ENTRIES: these files only demonstrate PDF preview and downloads.
   * Replace or remove them when you add your own study material.
   * Categories: notes | assignments | previous-papers | other
   */
  const resources = [
    {
      id: 'demo-maths-notes', subjectId: 'sub-01', title: 'DEMO — Calculus and Linear Algebra Notes',
      category: 'notes', fileName: 'demo-maths-notes.pdf', filePath: 'assets/pdf/notes/demo-maths-notes.pdf',
      fileType: 'pdf', description: 'Sample PDF used to test the in-page preview and download buttons.', date: '2026-11-05'
    },
    {
      id: 'demo-maths-assignment', subjectId: 'sub-01', title: 'DEMO — Calculus and Linear Algebra Assignment',
      category: 'assignments', fileName: 'demo-maths-assignment.docx', filePath: 'assets/documents/docx/demo-maths-assignment.docx',
      fileType: 'docx', description: 'Sample Word document used to test assignment filtering and downloads.', date: '2026-11-05'
    },
    {
      id: 'demo-maths-paper', subjectId: 'sub-01', title: 'DEMO — Calculus and Linear Algebra Previous Paper',
      category: 'previous-papers', fileName: 'demo-maths-previous-paper.pdf', filePath: 'assets/pdf/previous-papers/demo-maths-previous-paper.pdf',
      fileType: 'pdf', description: 'Sample question paper layout. Replace with a verified previous-year paper.', date: '2026-11-05'
    },
    {
      id: 'demo-other-reference', subjectId: 'sub-01', title: 'DEMO — General Reference Sheet',
      category: 'other', fileName: 'demo-other-reference.pdf', filePath: 'assets/pdf/demo-other-reference.pdf',
      fileType: 'pdf', description: 'Sample item to verify the Other category filter.', date: '2026-11-05'
    }
  ];

  window.HUB_CONFIG = {
    siteName: 'Student Hub',
    /* Replace this with your exact https://forms.gle/... or Google Forms URL. */
    googleFormUrl: 'https://forms.gle/sYUbtXzsWjQaAkoHA'
  };
  window.HUB_SEED_DATA = { sections, subjects, resources };
  window.HUB_UTILS = {
    escapeHtml(value = '') {
      return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
    },
    categoryLabel(value) {
      return ({ all: 'All resources', notes: 'Notes', assignments: 'Assignments', 'previous-papers': 'Previous papers', other: 'Other' })[value] || 'Other';
    },
    formatDate(value) {
      const date = new Date(`${value}T00:00:00`);
      return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
    },
    formatSize(bytes) {
      if (!Number.isFinite(bytes) || bytes <= 0) return '';
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
      return `${(bytes / 1048576).toFixed(1)} MB`;
    },
    fileExtension(name = '') {
      const parts = String(name).split('.');
      return parts.length > 1 ? parts.pop().toUpperCase() : 'FILE';
    }
  };
})();
