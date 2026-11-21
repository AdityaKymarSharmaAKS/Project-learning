(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const data = window.HUB_SEED_DATA;
  const utils = window.HUB_UTILS;

  document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initYear();
    initGoogleFormLinks();
    initHome();
    initSubjects();
    initSubjectDetails();

    if (typeof window.HubStaticAudit === 'function') {
      const audit = window.HubStaticAudit();
      if (!audit.ok) console.warn('Student Hub content needs attention:', audit.errors);
      else console.info(`Student Hub content checked: ${audit.sections} sections, ${audit.subjects} subjects, ${audit.resources} resources.`);
    }
  });

  function initNavigation() {
    const menuButton = $('.menu-toggle');
    const nav = $('.main-nav');
    if (!menuButton || !nav) return;

    menuButton.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.textContent = isOpen ? '×' : '☰';
    });

    $$('.main-nav a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.textContent = '☰';
    }));

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.textContent = '☰';
      }
    });
  }

  function initYear() {
    $$('[data-year]').forEach(node => { node.textContent = String(new Date().getFullYear()); });
  }

  function initGoogleFormLinks() {
    const formUrl = window.HUB_CONFIG?.googleFormUrl || 'https://forms.google.com/';
    $$('[data-google-form]').forEach(link => {
      link.href = formUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    });
  }

  function initHome() {
    if (document.body.dataset.page !== 'home') return;
    const resources = data.resources;
    const sectionsHost = $('#home-sections');
    const tones = ['purple', 'blue', 'green', 'orange'];

    $$('[data-stat="semesters"]').forEach(node => { node.textContent = '8'; });
    $$('[data-stat="subjects"]').forEach(node => { node.textContent = data.subjects.length; });
    $$('[data-stat="resources"]').forEach(node => { node.textContent = resources.length; });

    if (sectionsHost) {
      const semesters = Array.from({ length: 8 }, (_, index) => index + 1);
      sectionsHost.innerHTML = semesters.map((semesterNumber, index) => {
        const semesterSubjects = data.subjects.filter(subject => Number(subject.semesterNumber) === semesterNumber);
        const subjectIds = semesterSubjects.map(subject => subject.id);
        const resourceCount = resources.filter(resource => subjectIds.includes(resource.subjectId)).length;
        const academicYear = Math.ceil(semesterNumber / 2);
        return `<a class="section-tile" href="subjects.html?semester=${semesterNumber}">
          <div class="section-tile-top"><span class="section-symbol ${tones[index % tones.length]}">${index + 1}</span><span class="section-arrow">↗</span></div>
          <h3>Semester ${semesterNumber}</h3><p>Year ${academicYear} · ${semesterSubjects.length} subjects · ${resourceCount} resources</p>
        </a>`;
      }).join('');
    }
  }

  function initSubjects() {
    if (document.body.dataset.page !== 'subjects') return;
    const search = $('#subject-search');
    const semesterSelect = $('#semester-filter');
    const list = $('#subject-list');
    const count = $('#result-count');
    const empty = $('#empty-state');
    const clear = () => {
      search.value = '';
      semesterSelect.value = 'all';
      render();
      search.focus();
    };

    semesterSelect.innerHTML = '<option value="all">All semesters</option>' + Array.from({ length: 8 }, (_, index) => index + 1)
      .map(number => `<option value="${number}">Semester ${number}</option>`).join('');
    const selectedSemester = new URLSearchParams(window.location.search).get('semester') || 'all';
    if (Array.from(semesterSelect.options).some(option => option.value === selectedSemester)) semesterSelect.value = selectedSemester;

    function render() {
      const query = search.value.trim().toLowerCase();
      const selected = semesterSelect.value;
      const matches = data.subjects.filter(subject => {
        const section = data.sections.find(item => item.id === subject.sectionId);
        const text = `${subject.name} ${subject.code || ''} ${subject.credits ?? ''} ${subject.branch || ''} ${subject.semester} ${section?.name || ''}`.toLowerCase();
        return (selected === 'all' || String(subject.semesterNumber) === selected) && (!query || text.includes(query));
      });

      count.textContent = String(matches.length);
      list.innerHTML = matches.map((subject, index) => subjectCard(subject, index)).join('');
      empty.classList.toggle('hidden', matches.length > 0);
    }

    function subjectCard(subject, index) {
      const section = data.sections.find(item => item.id === subject.sectionId);
      const resourceCount = data.resources.filter(resource => resource.subjectId === subject.id).length;
      const tones = ['', 'tone-1', 'tone-2', 'tone-3'];
      const symbols = ['⌘', '▤', '◈', '◇'];
      const creditLabel = typeof subject.credits === 'number' ? `${subject.credits} ${subject.credits === 1 ? 'credit' : 'credits'}` : subject.credits;
      return `<a class="subject-card" href="subject-details.html?id=${encodeURIComponent(subject.id)}">
        <div class="subject-card-top"><span class="subject-card-icon ${tones[index % tones.length]}">${symbols[index % symbols.length]}</span><span class="subject-section-tag">${utils.escapeHtml(section?.name || 'Other')}</span></div>
        <h3>${utils.escapeHtml(subject.name)}</h3>
        <p class="subject-course-meta">${utils.escapeHtml(subject.code)} · ${utils.escapeHtml(creditLabel)}</p>
        <p class="subject-branch">${utils.escapeHtml(subject.branch)}</p>
        <div class="subject-card-bottom"><span>${utils.escapeHtml(subject.semester)}</span><b>${resourceCount} resources ↗</b></div>
      </a>`;
    }

    search.addEventListener('input', render);
    semesterSelect.addEventListener('change', render);
    $('#clear-filter').addEventListener('click', clear);
    $('#empty-clear').addEventListener('click', clear);
    document.addEventListener('keydown', event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        search.focus();
      }
    });
    render();
  }

  function initSubjectDetails() {
    if (document.body.dataset.page !== 'subject-details') return;
    const params = new URLSearchParams(window.location.search);
    const subject = data.subjects.find(item => item.id === params.get('id'));
    const heading = $('#subject-heading');
    const resourceList = $('#resource-list');
    const empty = $('#resource-empty');
    const tabs = $$('.resource-tab');
    const dialog = $('#pdf-preview-dialog');
    const frame = $('#pdf-preview-frame');
    const closeButton = $('#pdf-preview-close');
    const fallbackLink = $('#pdf-preview-fallback');
    let activeFilter = 'all';

    if (!subject) {
      $('#breadcrumb-subject').textContent = 'Not found';
      heading.innerHTML = '<div class="empty-state"><h3>Subject not found</h3><p>This subject may have been removed or the link is incorrect.</p><a class="button button-primary" href="subjects.html">Browse subjects</a></div>';
      resourceList.innerHTML = '';
      empty.classList.add('hidden');
      tabs.forEach(tab => { tab.disabled = true; });
      return;
    }

    const section = data.sections.find(item => item.id === subject.sectionId);
    const subjectResources = data.resources.filter(resource => resource.subjectId === subject.id);
    $('#breadcrumb-subject').textContent = subject.name;
    const creditLabel = typeof subject.credits === 'number' ? `${subject.credits} ${subject.credits === 1 ? 'credit' : 'credits'}` : subject.credits;
    heading.innerHTML = `<div class="subject-detail-head"><span class="detail-icon">⌘</span><div><div class="eyebrow eyebrow-dark">${utils.escapeHtml(section?.name || 'SUBJECT')}</div><h1>${utils.escapeHtml(subject.name)}</h1><div class="detail-meta"><span>${utils.escapeHtml(subject.semester)}</span><span>Code: ${utils.escapeHtml(subject.code)}</span><span>${utils.escapeHtml(creditLabel)}</span><span>${utils.escapeHtml(subject.branch)}</span><span>${subjectResources.length} resources</span></div></div></div>`;

    function renderResources() {
      const filtered = activeFilter === 'all' ? subjectResources : subjectResources.filter(resource => resource.category === activeFilter);
      const countNode = $('#resource-count');
      if (countNode) countNode.textContent = `${filtered.length} ${filtered.length === 1 ? 'file' : 'files'}`;
      resourceList.innerHTML = filtered.map(resource => resourceCard(resource)).join('');
      empty.classList.toggle('hidden', filtered.length > 0);
      if (!filtered.length) {
        $('#resource-empty-title').textContent = activeFilter === 'all' ? 'No resources here yet' : `No ${utils.categoryLabel(activeFilter).toLowerCase()} yet`;
        $('#resource-empty-copy').textContent = activeFilter === 'all'
          ? 'Study material for this subject will appear here after it is added to the content file.'
          : `No ${utils.categoryLabel(activeFilter).toLowerCase()} have been added for this subject yet.`;
      }
    }

    function resourceCard(resource) {
      const ext = utils.fileExtension(resource.fileName);
      const isDoc = ['DOCX', 'DOC'].includes(ext);
      const isPdf = ext === 'PDF';
      const isImage = ['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP', 'BMP', 'SVG', 'TIF', 'TIFF', 'AVIF', 'HEIC'].includes(ext);
      const iconClass = isDoc ? 'doc' : '';
      const path = utils.escapeHtml(resource.filePath);
      const previewAction = isPdf
        ? `<button class="resource-open" type="button" data-preview-resource="${utils.escapeHtml(resource.id)}">Preview</button>`
        : isImage ? `<a class="resource-open" href="${path}" target="_blank" rel="noopener noreferrer">View</a>` : '';
      return `<article class="resource-row">
        <span class="resource-file-icon ${iconClass}">${utils.escapeHtml(ext)}</span>
        <div class="resource-info"><h3>${utils.escapeHtml(resource.title)}</h3><p>${utils.escapeHtml(resource.fileName)}${resource.date ? ` · ${utils.escapeHtml(utils.formatDate(resource.date))}` : ''}</p>${resource.description ? `<p>${utils.escapeHtml(resource.description)}</p>` : ''}</div>
        <span class="resource-category">${utils.escapeHtml(utils.categoryLabel(resource.category))}</span>
        <div class="resource-actions">${previewAction}<a href="${path}" download="${utils.escapeHtml(resource.fileName)}" data-download-resource="${utils.escapeHtml(resource.id)}">Download</a></div>
      </article>`;
    }

    tabs.forEach(tab => tab.addEventListener('click', () => {
      activeFilter = tab.dataset.resourceFilter;
      tabs.forEach(item => {
        const isActive = item === tab;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-pressed', String(isActive));
      });
      renderResources();
    }));

    resourceList.addEventListener('click', event => {
      const button = event.target.closest('[data-preview-resource]');
      if (!button) return;
      const resource = subjectResources.find(item => item.id === button.dataset.previewResource);
      if (resource) openPdfPreview(resource);
    });

    function openPdfPreview(resource) {
      frame.src = resource.filePath;
      frame.title = `${resource.title} PDF preview`;
      fallbackLink.href = resource.filePath;
      fallbackLink.download = resource.fileName;
      fallbackLink.textContent = `Download ${resource.fileName}`;
      $('#pdf-preview-title').textContent = resource.title;
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else window.open(resource.filePath, '_blank', 'noopener,noreferrer');
    }

    function closePreview() {
      if (dialog.open) dialog.close();
      frame.src = 'about:blank';
    }
    closeButton.addEventListener('click', closePreview);
    dialog.addEventListener('click', event => { if (event.target === dialog) closePreview(); });
    dialog.addEventListener('close', () => { frame.src = 'about:blank'; });
    renderResources();
  }
})();
