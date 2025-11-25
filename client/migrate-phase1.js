#!/usr/bin/env node

/**
 * Phase 1 UI Migration Script
 * Automatically updates all files to use new shared components
 * 
 * Usage: node migrate-phase1.js
 */

const fs = require('fs');
const path = require('path');

// Color codes for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function readFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        log(`Error reading file ${filePath}: ${error.message}`, 'red');
        return null;
    }
}

function writeFile(filePath, content) {
    try {
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    } catch (error) {
        log(`Error writing file ${filePath}: ${error.message}`, 'red');
        return false;
    }
}

// Backup function
function createBackup(filePath) {
    const backupPath = `${filePath}.backup`;
    try {
        fs.copyFileSync(filePath, backupPath);
        return true;
    } catch (error) {
        log(`Error creating backup for ${filePath}: ${error.message}`, 'red');
        return false;
    }
}

// Add import if not exists
function addImports(content, imports) {
    const importLine = `import { ${imports.join(', ')} } from '../../components/shared';`;

    // Check if already imported
    if (content.includes("from '../../components/shared'") || content.includes('from "../../components/shared"')) {
        // Update existing import
        const importRegex = /import\s+{([^}]+)}\s+from\s+['"]\.\.\/\.\.\/components\/shared['"]/;
        const match = content.match(importRegex);

        if (match) {
            const existingImports = match[1].split(',').map(s => s.trim());
            const newImports = [...new Set([...existingImports, ...imports])];
            const updatedImportLine = `import { ${newImports.join(', ')} } from '../../components/shared'`;
            content = content.replace(importRegex, updatedImportLine);
        }
    } else {
        // Add new import after other imports
        const lastImportIndex = content.lastIndexOf('import ');
        if (lastImportIndex !== -1) {
            const nextLineIndex = content.indexOf('\n', lastImportIndex);
            content = content.slice(0, nextLineIndex + 1) + importLine + '\n' + content.slice(nextLineIndex + 1);
        }
    }

    return content;
}

// Replace Spinner with SkeletonLoader
function replaceSpinnerWithSkeleton(content, type = 'card', count = 3) {
    // Pattern 1: <Spinner size="lg" />
    content = content.replace(
        /<div className="flex justify-center items-center h-64">\s*<Spinner size="lg" \/>\s*<\/div>/g,
        `<SkeletonLoader type="${type}" count={${count}} />`
    );

    // Pattern 2: <Spinner /> or <Spinner size="..." />
    content = content.replace(
        /<div className="flex justify-center py-12">\s*<Spinner[^>]*\/>\s*<\/div>/g,
        `<SkeletonLoader type="${type}" count={${count}} />`
    );

    return content;
}

// Replace empty state messages with EmptyState component
function replaceEmptyStates(content, config) {
    const { icon, title, description, actionLabel, action } = config;

    const emptyStateComponent = `<EmptyState
    icon={${icon}}
    title="${title}"
    description="${description}"
    ${actionLabel ? `actionLabel="${actionLabel}"` : ''}
    ${action ? `onAction={${action}}` : ''}
  />`;

    // Replace various empty state patterns
    const patterns = [
        /<div className="[^"]*text-center[^"]*">\s*<p[^>]*>No [^<]+<\/p>\s*<\/div>/g,
        /<div className="card text-center[^"]*">\s*<p[^>]*>[^<]+<\/p>\s*<\/div>/g,
    ];

    patterns.forEach(pattern => {
        content = content.replace(pattern, emptyStateComponent);
    });

    return content;
}

// Replace page headers
function replacePageHeader(content, config) {
    const { title, subtitle, breadcrumbs, hasActions } = config;

    let pageHeaderCode = `<PageHeader
  title="${title}"
  subtitle="${subtitle}"`;

    if (breadcrumbs && breadcrumbs.length > 0) {
        pageHeaderCode += `\n  breadcrumbs={[\n`;
        breadcrumbs.forEach((crumb, index) => {
            pageHeaderCode += `    { label: '${crumb.label}'${crumb.href ? `, href: '${crumb.href}'` : ''} }${index < breadcrumbs.length - 1 ? ',' : ''}\n`;
        });
        pageHeaderCode += `  ]}`;
    }

    if (hasActions) {
        pageHeaderCode += `\n  actions={\n    {/* Keep existing actions */}\n  }`;
    }

    pageHeaderCode += `\n/>`;

    // Replace header patterns
    const headerPattern = /<div[^>]*>\s*<h1[^>]*>[^<]+<\/h1>\s*<p[^>]*>[^<]+<\/p>\s*<\/div>/;
    content = content.replace(headerPattern, pageHeaderCode);

    return content;
}

// Replace status badges
function replaceStatusBadges(content) {
    // Replace custom badge spans with StatusBadge
    content = content.replace(
        /<span className={`[^`]*badge[^`]*\$\{getStatusColor\([^)]+\)\}[^`]*`}>\s*\{[^}]+\}\s*<\/span>/g,
        '<StatusBadge status={status} size="md" />'
    );

    content = content.replace(
        /<span className="badge badge-[^"]*">[^<]*<\/span>/g,
        (match) => {
            // Extract status from the badge
            const statusMatch = match.match(/badge-(\w+)/);
            if (statusMatch) {
                return `<StatusBadge status="${statusMatch[1]}" size="sm" />`;
            }
            return match;
        }
    );

    return content;
}

// Replace avatars
function replaceAvatars(content) {
    // Pattern for img tags that are avatars
    const imgPattern = /<img[^>]*src=\{([^}]+)\}[^>]*alt=\{([^}]+)\}[^>]*className="[^"]*rounded-full[^"]*"[^>]*\/>/g;

    content = content.replace(imgPattern, (match, src, alt) => {
        return `<Avatar src={${src}} name={${alt}} size="lg" />`;
    });

    return content;
}

// File-specific migrations
const fileMigrations = {
    'WorkerDashboard.jsx': (content) => {
        log('  Migrating WorkerDashboard.jsx...', 'blue');

        // Add imports
        content = addImports(content, ['StatCard', 'SkeletonLoader', 'ProgressBar', 'Avatar']);

        // Replace loading state
        content = replaceSpinnerWithSkeleton(content, 'card', 3);

        // Replace avatars
        content = replaceAvatars(content);

        // Replace stat cards (find the stats grid and replace manually is safer)
        log('    Note: StatCard replacement needs manual verification', 'yellow');

        return content;
    },

    'BrowseJobs.jsx': (content) => {
        log('  Migrating BrowseJobs.jsx...', 'blue');

        content = addImports(content, ['PageHeader', 'FilterBar', 'EmptyState', 'SkeletonLoader', 'StatusBadge']);
        content = replaceSpinnerWithSkeleton(content, 'card', 6);
        content = replaceStatusBadges(content);

        // Replace empty state
        content = replaceEmptyStates(content, {
            icon: 'FiBriefcase',
            title: 'No jobs available',
            description: 'There are no jobs matching your criteria.',
            actionLabel: 'Clear Filters',
            action: '() => setFilters({ search: \'\', category: \'\', experienceLevel: \'\' })'
        });

        return content;
    },

    'MyApplications.jsx': (content) => {
        log('  Migrating MyApplications.jsx...', 'blue');

        content = addImports(content, ['PageHeader', 'EmptyState', 'SkeletonLoader', 'StatusBadge', 'StatCard']);
        content = replaceSpinnerWithSkeleton(content, 'card', 6);
        content = replaceStatusBadges(content);

        return content;
    },

    'AssignedJobs.jsx': (content) => {
        log('  Migrating AssignedJobs.jsx...', 'blue');

        content = addImports(content, ['PageHeader', 'EmptyState', 'SkeletonLoader', 'StatusBadge']);
        content = replaceSpinnerWithSkeleton(content, 'card', 4);
        content = replaceStatusBadges(content);

        return content;
    },

    'JobDetails.jsx': (content) => {
        log('  Migrating JobDetails.jsx...', 'blue');

        content = addImports(content, ['PageHeader', 'SkeletonLoader', 'StatusBadge', 'Avatar', 'Modal']);
        content = replaceSpinnerWithSkeleton(content, 'card', 2);
        content = replaceStatusBadges(content);
        content = replaceAvatars(content);

        return content;
    },

    'MyReviews.jsx': (content) => {
        log('  Migrating MyReviews.jsx...', 'blue');

        content = addImports(content, ['PageHeader', 'SkeletonLoader', 'EmptyState', 'StatCard']);
        content = replaceSpinnerWithSkeleton(content, 'card', 4);

        return content;
    },

    'CompanyDashboard.jsx': (content) => {
        log('  Migrating CompanyDashboard.jsx...', 'blue');

        content = addImports(content, ['StatCard', 'SkeletonLoader', 'PageHeader']);
        content = replaceSpinnerWithSkeleton(content, 'stat', 4);

        return content;
    },

    'CompanyProfile.jsx': (content) => {
        log('  Migrating CompanyProfile.jsx...', 'blue');

        content = addImports(content, ['PageHeader', 'SkeletonLoader', 'Avatar', 'ProgressBar']);
        content = replaceSpinnerWithSkeleton(content, 'profile', 3);
        content = replaceAvatars(content);

        return content;
    },

    'MyJobs.jsx': (content) => {
        log('  Migrating MyJobs.jsx...', 'blue');

        content = addImports(content, ['PageHeader', 'EmptyState', 'SkeletonLoader', 'StatusBadge']);
        content = replaceSpinnerWithSkeleton(content, 'card', 6);
        content = replaceStatusBadges(content);

        return content;
    },

    'PostJob.jsx': (content) => {
        log('  Migrating PostJob.jsx...', 'blue');

        content = addImports(content, ['PageHeader']);

        return content;
    },

    'JobApplications.jsx': (content) => {
        log('  Migrating JobApplications.jsx...', 'blue');

        content = addImports(content, ['PageHeader', 'SkeletonLoader', 'EmptyState', 'StatusBadge', 'Avatar', 'ActionDropdown']);
        content = replaceSpinnerWithSkeleton(content, 'list', 5);
        content = replaceAvatars(content);

        return content;
    },

    'Submissions.jsx': (content) => {
        log('  Migrating Submissions.jsx...', 'blue');

        content = addImports(content, ['PageHeader', 'SkeletonLoader', 'EmptyState', 'StatusBadge', 'Modal', 'ConfirmModal']);
        content = replaceSpinnerWithSkeleton(content, 'card', 4);
        content = replaceStatusBadges(content);

        return content;
    },

    'AdminDashboard.jsx': (content) => {
        log('  Migrating AdminDashboard.jsx...', 'blue');

        content = addImports(content, ['StatCard', 'SkeletonLoader', 'DataTable', 'PageHeader']);
        content = replaceSpinnerWithSkeleton(content, 'stat', 4);

        return content;
    },

    'PendingApprovals.jsx': (content) => {
        log('  Migrating PendingApprovals.jsx...', 'blue');

        content = addImports(content, ['PageHeader', 'SkeletonLoader', 'EmptyState', 'StatusBadge', 'Avatar', 'ActionDropdown']);
        content = replaceSpinnerWithSkeleton(content, 'list', 8);
        content = replaceAvatars(content);

        return content;
    },

    'AllUsers.jsx': (content) => {
        log('  Migrating AllUsers.jsx...', 'blue');

        content = addImports(content, ['PageHeader', 'DataTable', 'StatusBadge', 'ActionDropdown']);
        content = replaceSpinnerWithSkeleton(content, 'table', 1);
        content = replaceStatusBadges(content);

        return content;
    },

    'ManageJobs.jsx': (content) => {
        log('  Migrating ManageJobs.jsx...', 'blue');

        content = addImports(content, ['PageHeader', 'SkeletonLoader', 'EmptyState', 'StatusBadge', 'DataTable', 'ActionDropdown', 'Modal']);
        content = replaceSpinnerWithSkeleton(content, 'table', 1);
        content = replaceStatusBadges(content);

        return content;
    },

    'Conversations.jsx': (content) => {
        log('  Migrating Conversations.jsx...', 'blue');

        content = addImports(content, ['EmptyState', 'SkeletonLoader', 'Avatar', 'PageHeader']);
        content = replaceSpinnerWithSkeleton(content, 'list', 8);
        content = replaceAvatars(content);

        return content;
    },

    'Chat.jsx': (content) => {
        log('  Migrating Chat.jsx...', 'blue');

        content = addImports(content, ['Avatar']);
        content = replaceAvatars(content);

        return content;
    },
};

// Main migration function
function migrateFile(filePath) {
    const fileName = path.basename(filePath);

    if (!fileMigrations[fileName]) {
        log(`  Skipping ${fileName} (no migration defined)`, 'yellow');
        return false;
    }

    // Create backup
    if (!createBackup(filePath)) {
        log(`  Failed to create backup for ${fileName}`, 'red');
        return false;
    }

    // Read file
    let content = readFile(filePath);
    if (!content) {
        return false;
    }

    // Apply migration
    try {
        content = fileMigrations[fileName](content);
    } catch (error) {
        log(`  Error during migration: ${error.message}`, 'red');
        return false;
    }

    // Write file
    if (writeFile(filePath, content)) {
        log(`  ✓ Successfully migrated ${fileName}`, 'green');
        return true;
    }

    return false;
}

// Find all files to migrate
function findFiles(baseDir, category) {
    const fullPath = path.join(baseDir, category);

    try {
        const files = fs.readdirSync(fullPath);
        return files
            .filter(file => file.endsWith('.jsx'))
            .map(file => path.join(fullPath, file));
    } catch (error) {
        log(`Error reading directory ${fullPath}: ${error.message}`, 'red');
        return [];
    }
}

// Main execution
function main() {
    log('\n===========================================', 'bright');
    log('  Phase 1 UI Migration Script', 'bright');
    log('===========================================\n', 'bright');

    const baseDir = path.join(__dirname, 'src', 'pages');

    // Check if directory exists
    if (!fs.existsSync(baseDir)) {
        log(`Error: Pages directory not found at ${baseDir}`, 'red');
        log('Please run this script from your client directory.', 'yellow');
        process.exit(1);
    }

    const categories = ['worker', 'company', 'admin', 'messages'];
    let totalFiles = 0;
    let successCount = 0;

    categories.forEach(category => {
        log(`\nMigrating ${category} pages...`, 'bright');
        const files = findFiles(baseDir, category);

        files.forEach(filePath => {
            totalFiles++;
            if (migrateFile(filePath)) {
                successCount++;
            }
        });
    });

    // Summary
    log('\n===========================================', 'bright');
    log('  Migration Summary', 'bright');
    log('===========================================', 'bright');
    log(`Total files processed: ${totalFiles}`, 'blue');
    log(`Successfully migrated: ${successCount}`, 'green');
    log(`Failed: ${totalFiles - successCount}`, 'red');

    if (successCount === totalFiles) {
        log('\n✓ All files migrated successfully!', 'green');
        log('\nBackup files created with .backup extension.', 'yellow');
        log('Please test your application and remove backups if everything works.', 'yellow');
    } else {
        log('\n⚠ Some files failed to migrate. Please check the errors above.', 'yellow');
    }

    log('\n===========================================\n', 'bright');
}

// Run the script
main();