import {ColumnDefinitions, MigrationBuilder} from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.noTransaction()
  await pgm.db.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ChangeSourceEnum') THEN
        CREATE TYPE "ChangeSourceEnum" AS ENUM (
          'meeting',
          'task',
          'external'
        );
      END IF;
      CREATE TABLE IF NOT EXISTS "TaskEstimate" (
        "id" INT GENERATED BY DEFAULT AS IDENTITY,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "changeSource" "ChangeSourceEnum" NOT NULL,
        "name" VARCHAR(250) NOT NULL,
        "label" VARCHAR(100) NOT NULL,
        "taskId" VARCHAR(100) NOT NULL,
        "userId" VARCHAR(100) NOT NULL,
        "meetingId" VARCHAR(100),
        "stageId" VARCHAR(100),
        "discussionId" VARCHAR(100),
        "jiraFieldId" VARCHAR(100)
      );
      CREATE INDEX IF NOT EXISTS "idx_TaskEstimate_taskId" ON "TaskEstimate"("taskId");
      CREATE INDEX IF NOT EXISTS "idx_TaskEstimate_meetingId" ON "TaskEstimate"("meetingId");
    END
    $$;
  `)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    DROP TABLE "TaskEstimate";
    DROP TYPE "ChangeSourceEnum";
  `)
}
