import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_business_cards_social_links_platform" ADD VALUE IF NOT EXISTS 'snapchat';
    ALTER TYPE "public"."enum_business_cards_social_links_platform" ADD VALUE IF NOT EXISTS 'twitch';
    ALTER TYPE "public"."enum_business_cards_social_links_platform" ADD VALUE IF NOT EXISTS 'yelp';
    ALTER TYPE "public"."enum_business_cards_social_links_platform" ADD VALUE IF NOT EXISTS 'calendly';
    ALTER TYPE "public"."enum__business_cards_v_version_social_links_platform" ADD VALUE IF NOT EXISTS 'snapchat';
    ALTER TYPE "public"."enum__business_cards_v_version_social_links_platform" ADD VALUE IF NOT EXISTS 'twitch';
    ALTER TYPE "public"."enum__business_cards_v_version_social_links_platform" ADD VALUE IF NOT EXISTS 'yelp';
    ALTER TYPE "public"."enum__business_cards_v_version_social_links_platform" ADD VALUE IF NOT EXISTS 'calendly';

    ALTER TABLE "business_cards" ADD COLUMN "department" varchar;
    ALTER TABLE "business_cards" ADD COLUMN "headline" varchar;
    ALTER TABLE "business_cards" ADD COLUMN "company_logo_id" integer;
    ALTER TABLE "business_cards" ADD COLUMN "company_url" varchar;
    ALTER TABLE "business_cards" ADD COLUMN "calendar_url" varchar;

    CREATE TABLE IF NOT EXISTS "business_cards_accreditations" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL
    );

    ALTER TABLE "_business_cards_v" ADD COLUMN "version_department" varchar;
    ALTER TABLE "_business_cards_v" ADD COLUMN "version_headline" varchar;
    ALTER TABLE "_business_cards_v" ADD COLUMN "version_company_logo_id" integer;
    ALTER TABLE "_business_cards_v" ADD COLUMN "version_company_url" varchar;
    ALTER TABLE "_business_cards_v" ADD COLUMN "version_calendar_url" varchar;

    CREATE TABLE IF NOT EXISTS "_business_cards_v_version_accreditations" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar,
      "_uuid" varchar
    );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "_business_cards_v_version_accreditations";
    ALTER TABLE "_business_cards_v" DROP COLUMN IF EXISTS "version_calendar_url";
    ALTER TABLE "_business_cards_v" DROP COLUMN IF EXISTS "version_company_url";
    ALTER TABLE "_business_cards_v" DROP COLUMN IF EXISTS "version_company_logo_id";
    ALTER TABLE "_business_cards_v" DROP COLUMN IF EXISTS "version_headline";
    ALTER TABLE "_business_cards_v" DROP COLUMN IF EXISTS "version_department";

    DROP TABLE IF EXISTS "business_cards_accreditations";
    ALTER TABLE "business_cards" DROP COLUMN IF EXISTS "calendar_url";
    ALTER TABLE "business_cards" DROP COLUMN IF EXISTS "company_url";
    ALTER TABLE "business_cards" DROP COLUMN IF EXISTS "company_logo_id";
    ALTER TABLE "business_cards" DROP COLUMN IF EXISTS "headline";
    ALTER TABLE "business_cards" DROP COLUMN IF EXISTS "department";
  `)
}
