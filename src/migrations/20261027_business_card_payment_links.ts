import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_business_cards_payment_links_type" AS ENUM('cashapp', 'paypal', 'venmo', 'skype');
    CREATE TYPE "public"."enum__business_cards_v_version_payment_links_type" AS ENUM('cashapp', 'paypal', 'venmo', 'skype');

    CREATE TYPE "public"."enum_business_cards_payment_links_icon_type" AS ENUM('auto', 'custom');
    CREATE TYPE "public"."enum__business_cards_v_version_payment_links_icon_type" AS ENUM('auto', 'custom');

    CREATE TABLE IF NOT EXISTS "business_cards_payment_links" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "type" "enum_business_cards_payment_links_type" DEFAULT 'cashapp',
      "value" varchar NOT NULL,
      "url" varchar,
      "label" varchar,
      "icon_type" "enum_business_cards_payment_links_icon_type" DEFAULT 'auto',
      "icon_id" integer,
      "order" integer
    );

    ALTER TABLE "business_cards_payment_links"
      ADD CONSTRAINT "business_cards_payment_links_icon_id_media_id_fk"
      FOREIGN KEY ("icon_id") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

    ALTER TABLE "business_cards_payment_links"
      ADD CONSTRAINT "business_cards_payment_links_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "business_cards"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

    CREATE TABLE IF NOT EXISTS "_business_cards_v_version_payment_links" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "type" "enum__business_cards_v_version_payment_links_type" DEFAULT 'cashapp',
      "value" varchar,
      "url" varchar,
      "label" varchar,
      "icon_type" "enum__business_cards_v_version_payment_links_icon_type" DEFAULT 'auto',
      "icon_id" integer,
      "order" integer,
      "_uuid" varchar
    );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "_business_cards_v_version_payment_links";
    DROP TABLE IF EXISTS "business_cards_payment_links";

    DROP TYPE IF EXISTS "public"."enum__business_cards_v_version_payment_links_icon_type";
    DROP TYPE IF EXISTS "public"."enum__business_cards_v_version_payment_links_type";
    DROP TYPE IF EXISTS "public"."enum_business_cards_payment_links_icon_type";
    DROP TYPE IF EXISTS "public"."enum_business_cards_payment_links_type";
  `)
}
