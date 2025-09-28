// Mythwright Version Model - Content History Tracking & Version Control
import { DataTypes, Model } from 'sequelize';
import { nanoid } from 'nanoid';
import { createHash } from 'crypto';
class Version extends Model {
    // Static method to calculate content hash
    static calculateContentHash(content) {
        return createHash('sha256')
            .update(JSON.stringify(content))
            .digest('hex')
            .substring(0, 16); // Use first 16 characters for brevity
    }
    // Static method to generate semantic version
    static generateSemanticVersion(lastVersion, changeType) {
        const versionParts = lastVersion ? lastVersion.split('.').map(Number) : [0, 0, 0];
        let [major, minor, patch] = versionParts;
        switch (changeType) {
            case 'major':
                major++;
                minor = 0;
                patch = 0;
                break;
            case 'minor':
                minor++;
                patch = 0;
                break;
            case 'patch':
            default:
                patch++;
                break;
        }
        return `${major}.${minor}.${patch}`;
    }
    // Static method to calculate diff between versions
    static calculateDiff(oldContent, newContent) {
        const changes = {
            additions: 0,
            deletions: 0,
            modifications: 0,
            details: []
        };
        try {
            // Simple text-based diff for now
            const oldLines = (oldContent || '').split('\n');
            const newLines = (newContent || '').split('\n');
            const maxLines = Math.max(oldLines.length, newLines.length);
            for (let i = 0; i < maxLines; i++) {
                const oldLine = oldLines[i] || '';
                const newLine = newLines[i] || '';
                if (oldLine && !newLine) {
                    changes.deletions++;
                    changes.details.push({ type: 'deletion', line: i + 1, content: oldLine });
                }
                else if (!oldLine && newLine) {
                    changes.additions++;
                    changes.details.push({ type: 'addition', line: i + 1, content: newLine });
                }
                else if (oldLine !== newLine) {
                    changes.modifications++;
                    changes.details.push({
                        type: 'modification',
                        line: i + 1,
                        old: oldLine,
                        new: newLine
                    });
                }
            }
        }
        catch (error) {
            console.error('Error calculating diff:', error);
        }
        return changes;
    }
    // Static method to get version history for entity
    static async getVersionHistory(entityType, entityId, options = {}) {
        const { limit = 50, offset = 0, includeContent = false } = options;
        const attributes = includeContent ?
            undefined :
            { exclude: ['content', 'fullSnapshot'] };
        return await this.findAll({
            where: { entityType, entityId },
            attributes,
            order: [['versionNumber', 'DESC']],
            limit,
            offset
        });
    }
    // Static method to create version snapshot
    static async createSnapshot(entityType, entityId, content, metadata = {}) {
        const { userId, changeType = 'patch', changeDescription = '', tags = [] } = metadata;
        // Get the last version to calculate version number
        const lastVersion = await this.findOne({
            where: { entityType, entityId },
            order: [['versionNumber', 'DESC']]
        });
        const versionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;
        const semanticVersion = this.generateSemanticVersion(lastVersion?.semanticVersion, changeType);
        const contentHash = this.calculateContentHash(content);
        // Calculate diff if there's a previous version
        let diffSummary = null;
        if (lastVersion && lastVersion.content) {
            diffSummary = this.calculateDiff(lastVersion.content, content);
        }
        // Create the version record
        const version = await this.create({
            entityType,
            entityId,
            versionNumber,
            semanticVersion,
            content,
            contentHash,
            changeType,
            changeDescription,
            diffSummary,
            createdBy: userId,
            tags,
            metadata: {
                contentSize: JSON.stringify(content).length,
                timestamp: new Date(),
                ...metadata
            }
        });
        return version;
    }
    // Instance method to restore this version
    async restoreVersion() {
        // This would be implemented by the calling service
        // to actually restore the content to the target entity
        return {
            entityType: this.entityType,
            entityId: this.entityId,
            content: this.content,
            version: this.versionNumber,
            restoredAt: new Date()
        };
    }
    // Instance method to compare with another version
    async compareWith(otherVersionId) {
        const otherVersion = await Version.findByPk(otherVersionId);
        if (!otherVersion) {
            throw new Error('Version not found for comparison');
        }
        if (this.entityType !== otherVersion.entityType ||
            this.entityId !== otherVersion.entityId) {
            throw new Error('Cannot compare versions from different entities');
        }
        const diff = Version.calculateDiff(otherVersion.content, this.content);
        return {
            fromVersion: otherVersion.versionNumber,
            toVersion: this.versionNumber,
            fromDate: otherVersion.createdAt,
            toDate: this.createdAt,
            diff,
            summary: `${diff.additions} additions, ${diff.deletions} deletions, ${diff.modifications} modifications`
        };
    }
    // Instance method to generate changelog entry
    generateChangelogEntry() {
        const changeIcons = {
            major: '🚀',
            minor: '✨',
            patch: '🐛',
            hotfix: '🔥'
        };
        const icon = changeIcons[this.changeType] || '📝';
        const date = this.createdAt.toISOString().split('T')[0];
        let entry = `## ${icon} Version ${this.semanticVersion} (${date})\n\n`;
        if (this.changeDescription) {
            entry += `${this.changeDescription}\n\n`;
        }
        if (this.diffSummary) {
            const { additions, deletions, modifications } = this.diffSummary;
            if (additions > 0)
                entry += `- ✅ ${additions} additions\n`;
            if (modifications > 0)
                entry += `- 🔄 ${modifications} modifications\n`;
            if (deletions > 0)
                entry += `- ❌ ${deletions} deletions\n`;
            entry += '\n';
        }
        if (this.tags && this.tags.length > 0) {
            entry += `**Tags:** ${this.tags.join(', ')}\n\n`;
        }
        return entry;
    }
    // Instance method to validate version integrity
    validateIntegrity() {
        const errors = [];
        const warnings = [];
        // Check content hash
        const calculatedHash = Version.calculateContentHash(this.content);
        if (this.contentHash !== calculatedHash) {
            errors.push('Content hash mismatch - data may be corrupted');
        }
        // Check version sequence
        if (this.versionNumber < 1) {
            errors.push('Version number must be positive');
        }
        // Check semantic version format
        const semverRegex = /^\d+\.\d+\.\d+$/;
        if (!semverRegex.test(this.semanticVersion)) {
            warnings.push('Semantic version format should be X.Y.Z');
        }
        // Check content size
        if (this.content && JSON.stringify(this.content).length > 10 * 1024 * 1024) {
            warnings.push('Version content is very large (>10MB)');
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
}
// Initialize the Version model
const initVersionModel = (sequelize) => {
    Version.init({
        id: {
            type: DataTypes.STRING(12),
            primaryKey: true,
            defaultValue: () => nanoid(12),
            allowNull: false
        },
        // Entity Reference
        entityType: {
            type: DataTypes.ENUM,
            values: ['project', 'chapter', 'section', 'encounter', 'statblock', 'magicitem', 'npc', 'template'],
            allowNull: false,
            comment: 'Type of entity this version belongs to'
        },
        entityId: {
            type: DataTypes.STRING(12),
            allowNull: false,
            comment: 'ID of the entity this version belongs to'
        },
        // Version Information
        versionNumber: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1
            },
            comment: 'Sequential version number (1, 2, 3, ...)'
        },
        semanticVersion: {
            type: DataTypes.STRING(20),
            allowNull: false,
            comment: 'Semantic version (e.g., "1.2.3")'
        },
        // Content Snapshot
        content: {
            type: DataTypes.JSON,
            allowNull: false,
            comment: 'Full content snapshot at this version'
        },
        contentHash: {
            type: DataTypes.STRING(16),
            allowNull: false,
            comment: 'SHA-256 hash of content for integrity checking'
        },
        // Change Information
        changeType: {
            type: DataTypes.ENUM,
            values: ['major', 'minor', 'patch', 'hotfix'],
            defaultValue: 'patch',
            allowNull: false
        },
        changeDescription: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Description of changes made in this version'
        },
        // Diff Information
        diffSummary: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'Summary of changes from previous version'
        },
        // Authorship
        createdBy: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'User ID who created this version'
        },
        // Approval & Review
        reviewStatus: {
            type: DataTypes.ENUM,
            values: ['pending', 'approved', 'rejected', 'auto-approved'],
            defaultValue: 'auto-approved',
            allowNull: false
        },
        reviewedBy: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'User ID who reviewed this version'
        },
        reviewedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        reviewNotes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        // Publishing & Deployment
        isPublished: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        publishedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false,
            comment: 'Whether this is the currently active version'
        },
        // Branching & Merging
        branchName: {
            type: DataTypes.STRING,
            defaultValue: 'main',
            allowNull: false
        },
        parentVersionId: {
            type: DataTypes.STRING(12),
            allowNull: true,
            references: {
                model: 'mythwright_versions',
                key: 'id'
            },
            comment: 'Parent version if this is a branch or merge'
        },
        mergeSourceId: {
            type: DataTypes.STRING(12),
            allowNull: true,
            references: {
                model: 'mythwright_versions',
                key: 'id'
            },
            comment: 'Source version if this is a merge'
        },
        // Backup & Archival
        isBackup: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
            comment: 'Whether this is a backup version'
        },
        backupReason: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Reason for creating backup'
        },
        // Full Snapshot (for major versions)
        fullSnapshot: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'Complete entity state including metadata'
        },
        // Quality & Validation
        validationResults: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {
                isValid: true,
                errors: [],
                warnings: [],
                lastValidated: null
            }
        },
        // Usage & Statistics
        accessCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        restoreCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        // Tags & Categorization
        tags: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
            comment: 'Tags for categorization (feature, bugfix, etc.)'
        },
        // Additional Metadata
        metadata: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {},
            comment: 'Additional version-specific metadata'
        },
        // Retention Policy
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'When this version expires and can be cleaned up'
        },
        retentionPolicy: {
            type: DataTypes.ENUM,
            values: ['permanent', 'long-term', 'medium-term', 'short-term'],
            defaultValue: 'medium-term',
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Version',
        tableName: 'mythwright_versions',
        timestamps: true,
        paranoid: false, // Don't use soft deletes for versions
        indexes: [
            {
                fields: ['entityType', 'entityId']
            },
            {
                fields: ['entityType', 'entityId', 'versionNumber'],
                unique: true
            },
            {
                fields: ['contentHash']
            },
            {
                fields: ['createdBy']
            },
            {
                fields: ['isActive']
            },
            {
                fields: ['isPublished']
            },
            {
                fields: ['branchName']
            },
            {
                fields: ['parentVersionId']
            },
            {
                fields: ['reviewStatus']
            },
            {
                fields: ['retentionPolicy']
            },
            {
                fields: ['expiresAt']
            },
            {
                fields: ['tags']
            }
        ],
        hooks: {
            // Validate content integrity after save
            afterSave: async (version) => {
                if (version.changed('content')) {
                    const validation = version.validateIntegrity();
                    version.validationResults = {
                        ...validation,
                        lastValidated: new Date()
                    };
                    // Save without triggering hooks again
                    await version.save({ hooks: false });
                }
            },
            // Set active version when created
            afterCreate: async (version) => {
                if (version.isActive) {
                    // Deactivate other versions of the same entity
                    await Version.update({ isActive: false }, {
                        where: {
                            entityType: version.entityType,
                            entityId: version.entityId,
                            id: { [sequelize.Sequelize.Op.ne]: version.id }
                        }
                    });
                }
            }
        },
        validate: {
            // Validate version sequence
            validVersionNumber() {
                if (this.versionNumber < 1) {
                    throw new Error('Version number must be positive');
                }
            },
            // Validate semantic version format
            validSemanticVersion() {
                const semverRegex = /^\d+\.\d+\.\d+$/;
                if (!semverRegex.test(this.semanticVersion)) {
                    throw new Error('Semantic version must follow X.Y.Z format');
                }
            },
            // Validate content hash
            validContentHash() {
                if (this.content && this.contentHash) {
                    const calculatedHash = Version.calculateContentHash(this.content);
                    if (this.contentHash !== calculatedHash) {
                        throw new Error('Content hash does not match content');
                    }
                }
            },
            // Validate branch relationships
            validBranchRelationships() {
                if (this.parentVersionId === this.id) {
                    throw new Error('Version cannot be its own parent');
                }
                if (this.mergeSourceId === this.id) {
                    throw new Error('Version cannot merge from itself');
                }
            }
        }
    });
    return Version;
};
export { Version as model, initVersionModel };
//# sourceMappingURL=version.model.js.map