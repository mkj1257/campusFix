/**
 * CampusFix - Campus Issue Reporting & Tracking Dashboard
 *
 * Design System: Manrope (Headlines) + Hanken Grotesk (Body/Labels)
 * Colors: Primary #0F4C81, Secondary #64748B, Tertiary #F8FAFC, Neutral #1E293B
 * Storage: Browser localStorage
 */

// ==========================================
// 1. GLOBAL CONSTANTS & STORAGE KEYS
// ==========================================
const STORAGE_KEY = 'campus_issues';
const UPVOTED_KEYS = 'campus_upvoted_ids';

let isAdminMode = false;
let currentAdminUser = '';
let currentViewMode = 'active';
let issuesData = [];
let upvotedSet = new Set();

// ==========================================
// 2. SAMPLE SEED DATA
// ==========================================
const SAMPLE_ISSUES = [
    {
        id: 'issue-1',
        category: 'Wi-Fi/IT',
        location: 'Central Library, 2nd Floor Study Room',
        description: 'Wi-Fi access point (AP-04) keeps dropping connection every 10 minutes during peak study hours.',
        urgency: 'High',
        status: 'In Progress',
        upvotes: 34,
        timestamp: Date.now() - (1000 * 60 * 45)
    },
    {
        id: 'issue-2',
        category: 'Classroom/Lab',
        location: 'Science Block B, Room 302',
        description: 'Water leaking from overhead ceiling panel directly onto student lab benches and electrical sockets.',
        urgency: 'High',
        status: 'Pending',
        upvotes: 21,
        timestamp: Date.now() - (1000 * 60 * 180)
    },
    {
        id: 'issue-3',
        category: 'Sanitation',
        location: 'Student Union Center, 1st Floor Restroom',
        description: 'Automatic hand soap dispenser broken and paper towel refill needed.',
        urgency: 'Medium',
        status: 'Pending',
        upvotes: 12,
        timestamp: Date.now() - (1000 * 60 * 60 * 14)
    },
    {
        id: 'issue-4',
        category: 'Electricity',
        location: 'Engineering Hall 101',
        description: 'Flickering LED ceiling tube lights in Row 4 causing eye strain during lectures.',
        urgency: 'Low',
        status: 'Resolved',
        upvotes: 8,
        timestamp: Date.now() - (1000 * 60 * 60 * 36)
    }
];

// ==========================================
// 3. INIT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initStorage();
    setupEventListeners();
    renderFeed();
});

// ==========================================
// 4. LOCALSTORAGE
// ==========================================
function initStorage() {
    try {
        const storedIssues = localStorage.getItem(STORAGE_KEY);
        const storedUpvotes = localStorage.getItem(UPVOTED_KEYS);
        if (storedUpvotes) upvotedSet = new Set(JSON.parse(storedUpvotes));
        if (storedIssues) {
            issuesData = JSON.parse(storedIssues);
        } else {
            issuesData = SAMPLE_ISSUES;
            saveIssuesToStorage();
        }
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        issuesData = SAMPLE_ISSUES;
    }
}

function saveIssuesToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(issuesData));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        showToast('Failed to save to browser storage.', 'error');
    }
}

function saveUpvotesToStorage() {
    try {
        localStorage.setItem(UPVOTED_KEYS, JSON.stringify(Array.from(upvotedSet)));
    } catch (error) {
        console.error('Error saving upvotes:', error);
    }
}

// ==========================================
// 5. EVENT LISTENERS
// ==========================================
function setupEventListeners() {
    document.getElementById('issue-form')?.addEventListener('submit', handleFormSubmit);

    const descTextarea = document.getElementById('issue-description');
    const charCounter = document.getElementById('char-counter');
    if (descTextarea && charCounter) {
        descTextarea.addEventListener('input', (e) => {
            charCounter.textContent = `${e.target.value.length}/200`;
        });
    }

    document.getElementById('view-active-btn')?.addEventListener('click', () => {
        currentViewMode = 'active';
        renderFeed();
    });
    document.getElementById('view-resolved-btn')?.addEventListener('click', () => {
        currentViewMode = 'resolved';
        renderFeed();
    });

    document.getElementById('header-login-btn')?.addEventListener('click', () => {
        if (isAdminMode) handleAdminLogout();
        else openAdminLoginModal();
    });

    document.getElementById('admin-logout-btn')?.addEventListener('click', handleAdminLogout);
    document.getElementById('admin-login-form')?.addEventListener('submit', handleAdminLoginSubmit);
    document.getElementById('close-modal-btn')?.addEventListener('click', closeAdminLoginModal);
    document.getElementById('cancel-login-btn')?.addEventListener('click', closeAdminLoginModal);

    document.getElementById('sort-filter')?.addEventListener('change', renderFeed);
    document.getElementById('category-filter')?.addEventListener('change', renderFeed);
    document.getElementById('search-input')?.addEventListener('input', renderFeed);
    document.getElementById('reset-data-btn')?.addEventListener('click', handleResetDemoData);
}

// ==========================================
// 6. AUTH
// ==========================================
function openAdminLoginModal() {
    const modal = document.getElementById('admin-login-modal');
    const idInput = document.getElementById('admin-id-input');
    const passwordInput = document.getElementById('admin-password-input');
    if (modal) {
        if (idInput) idInput.value = '';
        if (passwordInput) passwordInput.value = '';
        modal.classList.remove('hidden');
        idInput?.focus();
    }
}

function closeAdminLoginModal() {
    document.getElementById('admin-login-modal')?.classList.add('hidden');
}

function handleAdminLoginSubmit(e) {
    e.preventDefault();
    const username = document.getElementById('admin-id-input')?.value.trim() || '';
    const password = document.getElementById('admin-password-input')?.value.trim() || '';

    if (!username) { showToast('Please enter your username.', 'error'); return; }
    if (!password) { showToast('Please enter your password.', 'error'); return; }

    isAdminMode = true;
    currentAdminUser = username;
    closeAdminLoginModal();
    updateAdminModeUI();
    renderFeed();
    showToast(`Logged in as "${escapeHTML(currentAdminUser)}"`, 'success');
}

function handleAdminLogout() {
    isAdminMode = false;
    currentAdminUser = '';
    updateAdminModeUI();
    renderFeed();
    showToast('Logged out of Staff mode.', 'info');
}

// ==========================================
// 7. CORE ISSUE LOGIC
// ==========================================
function handleFormSubmit(e) {
    e.preventDefault();
    const categorySelect = document.getElementById('issue-category');
    const locationInput = document.getElementById('issue-location');
    const descTextarea = document.getElementById('issue-description');
    const urgencyRadio = document.querySelector('input[name="issue-urgency"]:checked');

    if (!categorySelect.value || !locationInput.value.trim() || !descTextarea.value.trim() || !urgencyRadio) {
        showToast('Please fill out all required fields.', 'error');
        return;
    }

    const newIssue = {
        id: 'issue-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        category: categorySelect.value,
        location: locationInput.value.trim(),
        description: descTextarea.value.trim(),
        urgency: urgencyRadio.value,
        status: 'Pending',
        upvotes: 0,
        timestamp: Date.now()
    };

    issuesData.unshift(newIssue);
    saveIssuesToStorage();
    issueFormReset();
    currentViewMode = 'active';
    renderFeed();
    showToast('Campus issue reported successfully!', 'success');
}

function issueFormReset() {
    document.getElementById('issue-form').reset();
    document.getElementById('char-counter').textContent = '0/200';
    const mediumRadio = document.querySelector('input[name="issue-urgency"][value="Medium"]');
    if (mediumRadio) mediumRadio.checked = true;
}

function handleUpvote(issueId) {
    const issue = issuesData.find(item => item.id === issueId);
    if (!issue) return;

    if (upvotedSet.has(issueId)) {
        issue.upvotes = Math.max(0, issue.upvotes - 1);
        upvotedSet.delete(issueId);
        showToast('Upvote removed', 'info');
    } else {
        issue.upvotes += 1;
        upvotedSet.add(issueId);
        showToast('Thank you for upvoting!', 'success');
    }

    saveIssuesToStorage();
    saveUpvotesToStorage();
    renderFeed();
}

function handleStatusUpdate(issueId, newStatus) {
    if (!isAdminMode) {
        showToast('Please log in to update issue status.', 'error');
        openAdminLoginModal();
        return;
    }
    const issue = issuesData.find(item => item.id === issueId);
    if (!issue) return;
    issue.status = newStatus;
    saveIssuesToStorage();
    renderFeed();
    showToast(`Status → "${newStatus}" by ${escapeHTML(currentAdminUser)}`, 'success');
}

function handleDeleteIssue(issueId) {
    if (!isAdminMode) return;
    if (!confirm('Are you sure you want to delete this issue?')) return;
    issuesData = issuesData.filter(item => item.id !== issueId);
    upvotedSet.delete(issueId);
    saveIssuesToStorage();
    saveUpvotesToStorage();
    renderFeed();
    showToast('Issue deleted.', 'info');
}

function handleResetDemoData() {
    if (confirm('Reset all issues to default sample dataset?')) {
        issuesData = JSON.parse(JSON.stringify(SAMPLE_ISSUES));
        upvotedSet.clear();
        saveIssuesToStorage();
        saveUpvotesToStorage();
        currentViewMode = 'active';
        renderFeed();
        showToast('Dashboard reset to demo data.', 'info');
    }
}

// ==========================================
// 8. RENDER
// ==========================================
function renderFeed() {
    const feedContainer = document.getElementById('issues-feed');
    const emptyState = document.getElementById('empty-state');
    const viewTitle = document.getElementById('view-title');
    const viewSubtitle = document.getElementById('view-subtitle');
    const btnViewActive = document.getElementById('view-active-btn');
    const btnViewResolved = document.getElementById('view-resolved-btn');
    const navActiveCount = document.getElementById('nav-active-count');
    const navResolvedCount = document.getElementById('nav-resolved-count');

    if (!feedContainer) return;

    const searchVal = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
    const categoryVal = document.getElementById('category-filter')?.value || 'ALL';
    const sortVal = document.getElementById('sort-filter')?.value || 'newest';

    const totalActiveCount = issuesData.filter(i => i.status !== 'Resolved').length;
    const totalResolvedCount = issuesData.filter(i => i.status === 'Resolved').length;

    if (navActiveCount) navActiveCount.textContent = totalActiveCount;
    if (navResolvedCount) navResolvedCount.textContent = totalResolvedCount;

    // Tab styling
    if (btnViewActive && btnViewResolved) {
        if (currentViewMode === 'active') {
            btnViewActive.className = 'px-3.5 py-1.5 rounded-lg text-xs font-bold font-body transition-all flex items-center space-x-1.5 bg-primary-500 text-white';
            btnViewResolved.className = 'px-3.5 py-1.5 rounded-lg text-xs font-bold font-body transition-all flex items-center space-x-1.5 text-secondary-200 hover:text-white hover:bg-neutral-400/40';
        } else {
            btnViewActive.className = 'px-3.5 py-1.5 rounded-lg text-xs font-bold font-body transition-all flex items-center space-x-1.5 text-secondary-200 hover:text-white hover:bg-neutral-400/40';
            btnViewResolved.className = 'px-3.5 py-1.5 rounded-lg text-xs font-bold font-body transition-all flex items-center space-x-1.5 bg-primary-500 text-white';
        }
    }

    // Filter
    let filteredIssues = issuesData.filter(issue => {
        const matchesMode = currentViewMode === 'active'
            ? issue.status !== 'Resolved'
            : issue.status === 'Resolved';
        const matchesSearch = !searchVal ||
            issue.location.toLowerCase().includes(searchVal) ||
            issue.description.toLowerCase().includes(searchVal) ||
            issue.category.toLowerCase().includes(searchVal);
        const matchesCategory = categoryVal === 'ALL' || issue.category === categoryVal;
        return matchesMode && matchesSearch && matchesCategory;
    });

    // Sort
    filteredIssues.sort((a, b) => {
        if (sortVal === 'newest') return b.timestamp - a.timestamp;
        if (sortVal === 'upvotes') return b.upvotes - a.upvotes;
        if (sortVal === 'urgency') {
            const w = { 'High': 3, 'Medium': 2, 'Low': 1 };
            return w[b.urgency] - w[a.urgency];
        }
        return 0;
    });

    // Title
    if (currentViewMode === 'active') {
        if (viewTitle) viewTitle.innerHTML = `<span>Active Campus Dashboard</span><span id="feed-count-badge" class="bg-primary-50 text-primary-500 text-xs px-2.5 py-0.5 rounded-full font-bold border border-primary-200 font-body">${filteredIssues.length}</span>`;
        if (viewSubtitle) viewSubtitle.textContent = 'Showing new and in-progress maintenance issues requiring attention';
    } else {
        if (viewTitle) viewTitle.innerHTML = `<span>Resolved Problems Archive</span><span id="feed-count-badge" class="bg-green-50 text-green-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-green-200 font-body">${filteredIssues.length}</span>`;
        if (viewSubtitle) viewSubtitle.textContent = 'Showing completed campus repairs and fixed infrastructure';
    }

    // Empty
    if (filteredIssues.length === 0) {
        feedContainer.innerHTML = '';
        if (emptyState) {
            emptyState.classList.remove('hidden');
            const emptyTitle = document.getElementById('empty-title');
            const emptyDesc = document.getElementById('empty-desc');
            const emptyIconBox = document.getElementById('empty-icon-box');
            if (currentViewMode === 'active') {
                if (emptyTitle) emptyTitle.textContent = 'No Active Issues Found';
                if (emptyDesc) emptyDesc.textContent = 'No pending or in-progress issues matching your filters.';
                if (emptyIconBox) emptyIconBox.innerHTML = '<i class="fa-solid fa-circle-check text-green-500"></i>';
            } else {
                if (emptyTitle) emptyTitle.textContent = 'No Resolved Issues Found';
                if (emptyDesc) emptyDesc.textContent = 'No campus issues have been marked as resolved yet.';
                if (emptyIconBox) emptyIconBox.innerHTML = '<i class="fa-solid fa-box-archive text-secondary-400"></i>';
            }
        }
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    feedContainer.innerHTML = '';
    filteredIssues.forEach(issue => {
        feedContainer.appendChild(createIssueCardDOM(issue));
    });
}

function createIssueCardDOM(issue) {
    const card = document.createElement('div');
    const isResolved = issue.status === 'Resolved';

    card.className = `bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md card-transition space-y-4 ${
        isResolved ? 'border-green-200/80' : 'border-primary-100/60'
    }`;

    const categoryStyles = {
        'Classroom/Lab': 'bg-primary-50 text-primary-600 border-primary-200',
        'Wi-Fi/IT': 'bg-blue-50 text-blue-700 border-blue-200',
        'Sanitation': 'bg-teal-50 text-teal-800 border-teal-200',
        'Electricity': 'bg-amber-50 text-amber-800 border-amber-200',
        'Other': 'bg-secondary-50 text-secondary-700 border-secondary-200'
    };

    const categoryIcons = {
        'Classroom/Lab': 'fa-chalkboard-user',
        'Wi-Fi/IT': 'fa-wifi',
        'Sanitation': 'fa-broom',
        'Electricity': 'fa-bolt',
        'Other': 'fa-wrench'
    };

    const urgencyStyles = {
        'Low': 'bg-green-50 text-green-700 border-green-200',
        'Medium': 'bg-amber-50 text-amber-700 border-amber-200',
        'High': 'bg-red-50 text-red-700 border-red-200'
    };

    const statusStyles = {
        'Pending': 'bg-amber-50 text-amber-800 border-amber-300',
        'In Progress': 'bg-primary-50 text-primary-700 border-primary-300',
        'Resolved': 'bg-green-50 text-green-800 border-green-300'
    };

    const statusIcons = {
        'Pending': 'fa-clock',
        'In Progress': 'fa-spinner fa-spin-pulse',
        'Resolved': 'fa-circle-check'
    };

    const isUpvoted = upvotedSet.has(issue.id);

    card.innerHTML = `
        <!-- Header: Badges & Time -->
        <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center space-x-2">
                <span class="text-[11px] font-bold px-2.5 py-1 rounded-lg border font-body ${categoryStyles[issue.category] || categoryStyles['Other']} flex items-center space-x-1.5">
                    <i class="fa-solid ${categoryIcons[issue.category] || 'fa-tag'}"></i>
                    <span>${issue.category}</span>
                </span>
                <span class="text-[11px] font-bold px-2.5 py-1 rounded-lg border font-body ${urgencyStyles[issue.urgency] || urgencyStyles['Medium']} flex items-center space-x-1">
                    ${issue.urgency === 'High' && !isResolved ? '<span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping mr-0.5"></span>' : ''}
                    <span>${issue.urgency} Urgency</span>
                </span>
            </div>
            <span class="text-[11px] font-medium text-secondary-400 flex items-center space-x-1 font-body" title="${new Date(issue.timestamp).toLocaleString()}">
                <i class="fa-regular fa-clock text-[10px]"></i>
                <span>${getRelativeTime(issue.timestamp)}</span>
            </span>
        </div>

        <!-- Location & Description -->
        <div class="space-y-1.5">
            <div class="flex items-center space-x-2 text-neutral-500 font-bold text-[15px]">
                <i class="fa-solid fa-location-dot ${isResolved ? 'text-green-600' : 'text-primary-500'} text-sm"></i>
                <h3 class="font-headline ${isResolved ? 'line-through text-secondary-500 font-semibold' : ''}">${escapeHTML(issue.location)}</h3>
            </div>
            <p class="text-[13px] ${isResolved ? 'text-secondary-400' : 'text-secondary-500'} font-normal leading-relaxed font-body">
                ${escapeHTML(issue.description)}
            </p>
        </div>

        <!-- Footer: Upvote & Status -->
        <div class="pt-3 border-t border-secondary-100 flex flex-wrap items-center justify-between gap-3">
            <button onclick="handleUpvote('${issue.id}')" class="group flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all font-body ${
                isUpvoted
                ? 'bg-primary-50 border-primary-300 text-primary-600'
                : 'bg-tertiary border-secondary-200 text-secondary-500 hover:bg-secondary-50 hover:text-neutral-500'
            }">
                <i class="fa-solid fa-thumbs-up ${isUpvoted ? 'text-primary-500 scale-110' : 'text-secondary-400 group-hover:text-secondary-600'} transition-transform"></i>
                <span>Upvote</span>
                <span class="px-1.5 py-0.5 rounded-md ${isUpvoted ? 'bg-primary-200 text-primary-800' : 'bg-secondary-100 text-secondary-700'} text-[11px] font-extrabold">${issue.upvotes}</span>
            </button>

            <div class="flex items-center space-x-2">
                <span class="text-[10px] uppercase font-bold tracking-widest text-secondary-400 font-body">Status:</span>
                <span class="text-[11px] font-extrabold px-3 py-1 rounded-xl border font-body ${statusStyles[issue.status]} flex items-center space-x-1.5">
                    <i class="fa-solid ${statusIcons[issue.status]}"></i>
                    <span>${issue.status}</span>
                </span>
            </div>
        </div>

        <!-- Staff Controls -->
        ${isAdminMode ? `
        <div class="mt-3 pt-3 border-t-2 border-dashed border-primary-200 bg-primary-50/50 -mx-5 -mb-5 p-4 rounded-b-2xl flex flex-wrap items-center justify-between gap-2">
            <span class="text-xs font-bold text-primary-800 flex items-center space-x-1 font-body">
                <i class="fa-solid fa-user-gear text-primary-600"></i>
                <span>Staff Controls:</span>
            </span>
            <div class="flex items-center space-x-2">
                ${issue.status !== 'In Progress' && issue.status !== 'Resolved' ? `
                    <button onclick="handleStatusUpdate('${issue.id}', 'In Progress')" class="btn-secondary px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors flex items-center space-x-1 font-body">
                        <i class="fa-solid fa-spinner text-[10px]"></i>
                        <span>In Progress</span>
                    </button>
                ` : ''}
                ${issue.status !== 'Resolved' ? `
                    <button onclick="handleStatusUpdate('${issue.id}', 'Resolved')" class="px-2.5 py-1 bg-green-700 hover:bg-green-800 text-white border-2 border-green-700 hover:border-green-800 rounded-lg text-[11px] font-bold transition-colors flex items-center space-x-1 font-body">
                        <i class="fa-solid fa-check text-[10px]"></i>
                        <span>Resolved</span>
                    </button>
                ` : ''}
                ${issue.status === 'Resolved' ? `
                    <button onclick="handleStatusUpdate('${issue.id}', 'Pending')" class="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white border-2 border-amber-600 hover:border-amber-700 rounded-lg text-[11px] font-bold transition-colors flex items-center space-x-1 font-body">
                        <i class="fa-solid fa-rotate-left text-[10px]"></i>
                        <span>Reopen</span>
                    </button>
                ` : ''}
                <button onclick="handleDeleteIssue('${issue.id}')" title="Delete Issue" class="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 border-2 border-red-200 hover:border-red-300 rounded-lg text-xs font-bold transition-colors">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        </div>
        ` : ''}
    `;

    return card;
}

function updateAdminModeUI() {
    const adminBadge = document.getElementById('admin-badge');
    const adminBanner = document.getElementById('admin-banner');
    const adminUserDisplay = document.getElementById('admin-user-display');
    const logoutBtn = document.getElementById('admin-logout-btn');
    const loginBtnText = document.getElementById('login-btn-text');
    const headerLoginBtn = document.getElementById('header-login-btn');

    if (adminBadge) {
        if (isAdminMode) {
            adminBadge.textContent = `Active: ${currentAdminUser}`;
            adminBadge.className = 'block text-[10px] text-primary-200 font-extrabold tracking-wider truncate max-w-[120px] font-body';
        } else {
            adminBadge.textContent = 'Logged Out';
            adminBadge.className = 'block text-[10px] text-secondary-300 font-medium font-body';
        }
    }

    if (loginBtnText) loginBtnText.textContent = isAdminMode ? 'Logout' : 'Log In';

    if (headerLoginBtn) {
        if (isAdminMode) {
            headerLoginBtn.className = 'btn-outlined px-3.5 py-1.5 rounded-xl text-xs font-bold font-body transition-all flex items-center space-x-1.5 !text-secondary-200 !border-secondary-400 hover:!bg-secondary-500 hover:!text-white';
        } else {
            headerLoginBtn.className = 'btn-primary px-3.5 py-1.5 rounded-xl text-xs font-bold font-body transition-all flex items-center space-x-1.5';
        }
    }

    if (logoutBtn) logoutBtn.classList.toggle('hidden', !isAdminMode);
    if (adminBanner) adminBanner.classList.toggle('hidden', !isAdminMode);
    if (adminUserDisplay) adminUserDisplay.textContent = ` Logged in as Staff (${currentAdminUser}). You can update issue statuses on cards.`;
}

// ==========================================
// 9. HELPERS
// ==========================================
function getRelativeTime(timestamp) {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    const bgColors = {
        'success': 'bg-primary-800/95 text-primary-100 border-primary-600',
        'error': 'bg-red-900/95 text-red-100 border-red-700',
        'info': 'bg-neutral-500/95 text-secondary-100 border-neutral-400'
    };
    const icons = {
        'success': 'fa-circle-check text-green-400',
        'error': 'fa-circle-xmark text-red-400',
        'info': 'fa-circle-info text-primary-300'
    };

    toast.className = `${bgColors[type] || bgColors['info']} px-4 py-3 rounded-xl border shadow-xl text-xs font-semibold flex items-center space-x-2.5 transition-all transform translate-y-2 opacity-0 pointer-events-auto max-w-sm font-body`;
    toast.innerHTML = `<i class="fa-solid ${icons[type] || icons['info']} text-sm"></i><span class="flex-grow">${escapeHTML(message)}</span>`;

    toastContainer.appendChild(toast);
    requestAnimationFrame(() => toast.classList.remove('translate-y-2', 'opacity-0'));

    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
