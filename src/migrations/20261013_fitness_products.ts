import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_fitness_products_status" AS ENUM('draft', 'published');
    CREATE TYPE "public"."enum_fitness_products_type" AS ENUM('program', 'supplement', 'peptide');
    CREATE TYPE "public"."enum_fitness_products_currency" AS ENUM('USD', 'EUR', 'GBP');
    CREATE TYPE "public"."enum__fitness_products_v_version_status" AS ENUM('draft', 'published');
    CREATE TYPE "public"."enum__fitness_products_v_version_type" AS ENUM('program', 'supplement', 'peptide');
    CREATE TYPE "public"."enum__fitness_products_v_version_currency" AS ENUM('USD', 'EUR', 'GBP');

    CREATE TABLE "fitness_products" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL,
      "slug" varchar,
      "generate_slug" boolean DEFAULT true,
      "short_description" varchar,
      "description" jsonb,
      "cover_image_id" integer,
      "type" "enum_fitness_products_type" DEFAULT 'program' NOT NULL,
      "price" numeric NOT NULL,
      "currency" "enum_fitness_products_currency" DEFAULT 'USD' NOT NULL,
      "polar_checkout_link" varchar,
      "coming_soon" boolean DEFAULT false,
      "badge" varchar,
      "featured" boolean DEFAULT false,
      "order" numeric DEFAULT 0,
      "age_restricted" boolean DEFAULT false,
      "available_regions" varchar DEFAULT 'US',
      "shipping_note" varchar,
      "disclaimer" jsonb,
      "published_at" timestamp(3) with time zone,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "_status" "enum_fitness_products_status" DEFAULT 'draft'
    );

    CREATE TABLE "fitness_products_gallery" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "image_id" integer
    );

    CREATE TABLE "_fitness_products_v" (
      "id" serial PRIMARY KEY NOT NULL,
      "parent_id" integer,
      "version_title" varchar,
      "version_slug" varchar,
      "version_generate_slug" boolean DEFAULT true,
      "version_short_description" varchar,
      "version_description" jsonb,
      "version_cover_image_id" integer,
      "version_type" "enum__fitness_products_v_version_type" DEFAULT 'program',
      "version_price" numeric,
      "version_currency" "enum__fitness_products_v_version_currency" DEFAULT 'USD',
      "version_polar_checkout_link" varchar,
      "version_coming_soon" boolean DEFAULT false,
      "version_badge" varchar,
      "version_featured" boolean DEFAULT false,
      "version_order" numeric DEFAULT 0,
      "version_age_restricted" boolean DEFAULT false,
      "version_available_regions" varchar DEFAULT 'US',
      "version_shipping_note" varchar,
      "version_disclaimer" jsonb,
      "version_published_at" timestamp(3) with time zone,
      "version_updated_at" timestamp(3) with time zone,
      "version_created_at" timestamp(3) with time zone,
      "version__status" "enum__fitness_products_v_version_status" DEFAULT 'draft',
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "latest" boolean
    );

    CREATE TABLE "_fitness_products_v_version_gallery" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "image_id" integer
    );

    ALTER TABLE "fitness_products" ADD CONSTRAINT "fitness_products_cover_image_id_media_id_fk"
      FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "fitness_products_gallery" ADD CONSTRAINT "fitness_products_gallery_parent_id_fitness_products_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."fitness_products"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "fitness_products_gallery" ADD CONSTRAINT "fitness_products_gallery_image_id_media_id_fk"
      FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "_fitness_products_v" ADD CONSTRAINT "_fitness_products_v_parent_id_fitness_products_id_fk"
      FOREIGN KEY ("parent_id") REFERENCES "public"."fitness_products"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_fitness_products_v" ADD CONSTRAINT "_fitness_products_v_version_cover_image_id_media_id_fk"
      FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "_fitness_products_v_version_gallery" ADD CONSTRAINT "_fitness_products_v_version_gallery_parent_id__fitness_products_v_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."_fitness_products_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_fitness_products_v_version_gallery" ADD CONSTRAINT "_fitness_products_v_version_gallery_image_id_media_id_fk"
      FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "fitness_products_id" integer;

    CREATE INDEX "fitness_products_cover_image_idx" ON "fitness_products" USING btree ("cover_image_id");
    CREATE UNIQUE INDEX "fitness_products_slug_idx" ON "fitness_products" USING btree ("slug");
    CREATE INDEX "fitness_products_updated_at_idx" ON "fitness_products" USING btree ("updated_at");
    CREATE INDEX "fitness_products_created_at_idx" ON "fitness_products" USING btree ("created_at");
    CREATE INDEX "fitness_products__status_idx" ON "fitness_products" USING btree ("_status");

    CREATE INDEX "fitness_products_gallery_order_idx" ON "fitness_products_gallery" USING btree ("_order");
    CREATE INDEX "fitness_products_gallery_parent_id_idx" ON "fitness_products_gallery" USING btree ("_parent_id");

    CREATE INDEX "_fitness_products_v_parent_idx" ON "_fitness_products_v" USING btree ("parent_id");
    CREATE INDEX "_fitness_products_v_version_version_slug_idx" ON "_fitness_products_v" USING btree ("version_slug");
    CREATE INDEX "_fitness_products_v_version_version_cover_image_idx" ON "_fitness_products_v" USING btree ("version_cover_image_id");
    CREATE INDEX "_fitness_products_v_version_version_updated_at_idx" ON "_fitness_products_v" USING btree ("version_updated_at");
    CREATE INDEX "_fitness_products_v_version_version_created_at_idx" ON "_fitness_products_v" USING btree ("version_created_at");
    CREATE INDEX "_fitness_products_v_version_version__status_idx" ON "_fitness_products_v" USING btree ("version__status");
    CREATE INDEX "_fitness_products_v_created_at_idx" ON "_fitness_products_v" USING btree ("created_at");
    CREATE INDEX "_fitness_products_v_updated_at_idx" ON "_fitness_products_v" USING btree ("updated_at");
    CREATE INDEX "_fitness_products_v_latest_idx" ON "_fitness_products_v" USING btree ("latest");

    CREATE INDEX "_fitness_products_v_version_gallery_order_idx" ON "_fitness_products_v_version_gallery" USING btree ("_order");
    CREATE INDEX "_fitness_products_v_version_gallery_parent_id_idx" ON "_fitness_products_v_version_gallery" USING btree ("_parent_id");

    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_fitness_products_fk"
      FOREIGN KEY ("fitness_products_id") REFERENCES "public"."fitness_products"("id") ON DELETE cascade ON UPDATE no action;
    CREATE INDEX "payload_locked_documents_rels_fitness_products_id_idx"
      ON "payload_locked_documents_rels" USING btree ("fitness_products_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_fitness_products_fk";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_fitness_products_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "fitness_products_id";
    DROP TABLE "_fitness_products_v_version_gallery" CASCADE;
    DROP TABLE "_fitness_products_v" CASCADE;
    DROP TABLE "fitness_products_gallery" CASCADE;
    DROP TABLE "fitness_products" CASCADE;
    DROP TYPE IF EXISTS "public"."enum__fitness_products_v_version_currency";
    DROP TYPE IF EXISTS "public"."enum__fitness_products_v_version_type";
    DROP TYPE IF EXISTS "public"."enum__fitness_products_v_version_status";
    DROP TYPE IF EXISTS "public"."enum_fitness_products_currency";
    DROP TYPE IF EXISTS "public"."enum_fitness_products_type";
    DROP TYPE IF EXISTS "public"."enum_fitness_products_status";
  `)
}
