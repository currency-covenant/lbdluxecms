import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_business_cards_logos_position" AS ENUM('banner', 'below');
    CREATE TYPE "public"."enum__business_cards_v_version_logos_position" AS ENUM('banner', 'below');

    CREATE TYPE "public"."enum_business_cards_contact_rows_type" AS ENUM('email','phone','text','website','company','calendar','address','linkedin','twitter','instagram','facebook','youtube','tiktok','github','threads','snapchat','twitch','yelp','paypal','venmo','cashapp','custom');
    CREATE TYPE "public"."enum__business_cards_v_version_contact_rows_type" AS ENUM('email','phone','text','website','company','calendar','address','linkedin','twitter','instagram','facebook','youtube','tiktok','github','threads','snapchat','twitch','yelp','paypal','venmo','cashapp','custom');

    CREATE TYPE "public"."enum_business_cards_contact_rows_icon_type" AS ENUM('auto','custom');
    CREATE TYPE "public"."enum__business_cards_v_version_contact_rows_icon_type" AS ENUM('auto','custom');

    CREATE TABLE IF NOT EXISTS "business_cards_logos" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "image_id" integer NOT NULL,
      "alt" varchar,
      "url" varchar,
      "position" "enum_business_cards_logos_position" DEFAULT 'banner',
      "order" integer
    );

    ALTER TABLE "business_cards_logos"
      ADD CONSTRAINT "business_cards_logos_image_id_media_id_fk"
      FOREIGN KEY ("image_id") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

    ALTER TABLE "business_cards_logos"
      ADD CONSTRAINT "business_cards_logos_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "business_cards"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

    CREATE TABLE IF NOT EXISTS "business_cards_contact_rows" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "type" "enum_business_cards_contact_rows_type" DEFAULT 'custom',
      "label" varchar,
      "value" varchar NOT NULL,
      "url" varchar,
      "icon_type" "enum_business_cards_contact_rows_icon_type" DEFAULT 'auto',
      "icon_id" integer,
      "order" integer
    );

    ALTER TABLE "business_cards_contact_rows"
      ADD CONSTRAINT "business_cards_contact_rows_icon_id_media_id_fk"
      FOREIGN KEY ("icon_id") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

    ALTER TABLE "business_cards_contact_rows"
      ADD CONSTRAINT "business_cards_contact_rows_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "business_cards"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

    CREATE TABLE IF NOT EXISTS "_business_cards_v_version_logos" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "image_id" integer,
      "alt" varchar,
      "url" varchar,
      "position" "enum__business_cards_v_version_logos_position" DEFAULT 'banner',
      "order" integer,
      "_uuid" varchar
    );

    CREATE TABLE IF NOT EXISTS "_business_cards_v_version_contact_rows" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "type" "enum__business_cards_v_version_contact_rows_type" DEFAULT 'custom',
      "label" varchar,
      "value" varchar,
      "url" varchar,
      "icon_type" "enum__business_cards_v_version_contact_rows_icon_type" DEFAULT 'auto',
      "icon_id" integer,
      "order" integer,
      "_uuid" varchar
    );

    UPDATE "business_cards" SET "accent_color" = '#6366f1' WHERE "accent_color" IS NULL OR "accent_color" = '#ffffff';
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "_business_cards_v_version_contact_rows";
    DROP TABLE IF EXISTS "_business_cards_v_version_logos";
    DROP TABLE IF EXISTS "business_cards_contact_rows";
    DROP TABLE IF EXISTS "business_cards_logos";

    DROP TYPE IF EXISTS "public"."enum__business_cards_v_version_contact_rows_icon_type";
    DROP TYPE IF EXISTS "public"."enum__business_cards_v_version_contact_rows_type";
    DROP TYPE IF EXISTS "public"."enum_business_cards_contact_rows_icon_type";
    DROP TYPE IF EXISTS "public"."enum_business_cards_contact_rows_type";
    DROP TYPE IF EXISTS "public"."enum__business_cards_v_version_logos_position";
    DROP TYPE IF EXISTS "public"."enum_business_cards_logos_position";
  `)
}
