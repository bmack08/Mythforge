import { DataTypes, Model } from 'sequelize';
import _ from 'lodash';
class Notification extends Model {
    // Static method to add a notification
    static async addNotification(data) {
        if (!data.dismissKey) {
            throw new Error('Dismiss key is required!');
        }
        const defaults = {
            title: '',
            text: '',
            startAt: new Date(),
            stopAt: new Date(),
        };
        const notificationData = _.defaults(data, defaults);
        try {
            const newNotification = await this.create(notificationData);
            return newNotification;
        }
        catch (err) {
            throw new Error(err.message || 'Error saving notification');
        }
    }
    // Static method to delete a notification
    static async deleteNotification(dismissKey) {
        if (!dismissKey) {
            throw new Error('Dismiss key is required!');
        }
        try {
            const deletedNotification = await this.findOne({ where: { dismissKey } });
            if (!deletedNotification) {
                throw new Error('Notification not found');
            }
            await deletedNotification.destroy();
            return deletedNotification;
        }
        catch (err) {
            throw new Error(err.message || 'Error deleting notification');
        }
    }
    // Static method to get all notifications
    static async getAll() {
        try {
            const notifications = await this.findAll();
            return notifications;
        }
        catch (err) {
            throw new Error(err.message || 'Error retrieving notifications');
        }
    }
}
// Initialize the model
const initNotificationModel = (sequelize) => {
    Notification.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        dismissKey: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            defaultValue: '',
            allowNull: false
        },
        text: {
            type: DataTypes.TEXT,
            defaultValue: '',
            allowNull: false
        },
        startAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        },
        stopAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Notification',
        tableName: 'notifications',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['dismissKey']
            }
        ]
    });
    return Notification;
};
export { Notification as model, initNotificationModel };
//# sourceMappingURL=notification.model.js.map