declare namespace _default {
    export { connect };
    export { disconnect };
    export { getSequelize };
}
export default _default;
declare function connect(config: any): Promise<Sequelize>;
declare function disconnect(): Promise<void>;
declare function getSequelize(): any;
import { Sequelize } from 'sequelize';
//# sourceMappingURL=database.d.ts.map