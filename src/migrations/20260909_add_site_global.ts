import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "site" (
      "id" serial PRIMARY KEY NOT NULL,
      "site_name" varchar NOT NULL,
      "default_title" varchar,
      "default_description" varchar,
      "site_url" varchar,
      "links_url" varchar,
      "og_image_id" integer,
      "theme_color" varchar,
      "newsletter_heading" varchar,
      "newsletter_subtitle" varchar,
      "newsletter_placeholder" varchar,
      "newsletter_button_label" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE "site_socials" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL,
      "url" varchar NOT NULL
    );

    ALTER TABLE "site" ADD CONSTRAINT "site_og_image_id_media_id_fk"
      FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "site_socials" ADD CONSTRAINT "site_socials_parent_id_site_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "site_id" integer;

    CREATE INDEX "site_og_image_idx" ON "site" USING btree ("og_image_id");
    CREATE INDEX "site_updated_at_idx" ON "site" USING btree ("updated_at");
    CREATE INDEX "site_created_at_idx" ON "site" USING btree ("created_at");

    CREATE INDEX "site_socials_parent_idx" ON "site_socials" USING btree ("_parent_id");

    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_site_fk"
      FOREIGN KEY ("site_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;
    CREATE INDEX "payload_locked_documents_rels_site_id_idx"
      ON "payload_locked_documents_rels" USING btree ("site_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_site_fk";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_site_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "site_id";
    DROP TABLE "site_socials" CASCADE;
    DROP TABLE "site" CASCADE;
  `)
}