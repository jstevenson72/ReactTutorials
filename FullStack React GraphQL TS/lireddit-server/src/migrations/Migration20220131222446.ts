import { Migration } from '@mikro-orm/migrations';

export class Migration20220131222446 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "post" rename column "_id" to "id";');
  }

}
