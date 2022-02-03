"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20220131222446 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20220131222446 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table "post" rename column "_id" to "id";');
    }
}
exports.Migration20220131222446 = Migration20220131222446;
//# sourceMappingURL=Migration20220131222446.js.map