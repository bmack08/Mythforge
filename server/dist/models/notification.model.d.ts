declare class Notification extends Model<any, any> {
    static addNotification(data: any): Promise<Notification>;
    static deleteNotification(dismissKey: any): Promise<Notification>;
    static getAll(): Promise<Notification[]>;
    constructor(values?: import("sequelize").Optional<any, string> | undefined, options?: import("sequelize").BuildOptions);
}
export function initNotificationModel(sequelize: any): typeof Notification;
import { Model } from 'sequelize';
export { Notification as model };
//# sourceMappingURL=notification.model.d.ts.map