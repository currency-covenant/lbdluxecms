import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_digital_products_status" AS ENUM('draft', 'published');
    CREATE TYPE "public"."enum__digital_products_v_version_status" AS ENUM('draft', 'published');

    CREATE TABLE "digital_products" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL,
      "slug" varchar,
      "generate_slug" boolean DEFAULT true,
      "short_description" varchar,
      "description" jsonb,
      "cover_image_id" integer,
      "price" numeric NOT NULL,
      "currency" varchar DEFAULT 'USD' NOT NULL,
      "polar_checkout_link" varchar NOT NULL,
      "badge" varchar,
      "featured" boolean DEFAULT false,
      "order" numeric DEFAULT 0,
      "published_at" timestamp(3) with time zone,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "_status" "enum_digital_products_status" DEFAULT 'draft'
    );

    CREATE TABLE "digital_products_gallery" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "image_id" integer
    );

    CREATE TABLE "_digital_products_v" (
      "id" serial PRIMARY KEY NOT NULL,
      "parent_id" integer,
      "version_title" varchar,
      "version_slug" varchar,
      "version_generate_slug" boolean DEFAULT true,
      "version_short_description" varchar,
      "version_description" jsonb,
      "version_cover_image_id" integer,
      "version_price" numeric,
      "version_currency" varchar DEFAULT 'USD',
      "version_polar_checkout_link" varchar,
      "version_badge" varchar,
      "version_featured" boolean DEFAULT false,
      "version_order" numeric DEFAULT 0,
      "version_published_at" timestamp(3) with time zone,
      "version_updated_at" timestamp(3) with time zone,
      "version_created_at" timestamp(3) with time zone,
      "version__status" "enum__digital_products_v_version_status" DEFAULT 'draft',
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "latest" boolean
    );

    CREATE TABLE "_digital_products_v_version_gallery" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "image_id" integer
    );

    ALTER TABLE "digital_products" ADD CONSTRAINT "digital_products_cover_image_id_media_id_fk"
      FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "digital_products_gallery" ADD CONSTRAINT "digital_products_gallery_parent_id_digital_products_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."digital_products"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "digital_products_gallery" ADD CONSTRAINT "digital_products_gallery_image_id_media_id_fk"
      FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "_digital_products_v" ADD CONSTRAINT "_digital_products_v_parent_id_digital_products_id_fk"
      FOREIGN KEY ("parent_id") REFERENCES "public"."digital_products"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_digital_products_v" ADD CONSTRAINT "_digital_products_v_version_cover_image_id_media_id_fk"
      FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "_digital_products_v_version_gallery" ADD CONSTRAINT "_digital_products_v_version_gallery_parent_id__digital_products_v_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."_digital_products_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_digital_products_v_version_gallery" ADD CONSTRAINT "_digital_products_v_version_gallery_image_id_media_id_fk"
      FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "digital_products_id" integer;

    CREATE INDEX "digital_products_cover_image_idx" ON "digital_products" USING btree ("cover_image_id");
    CREATE UNIQUE INDEX "digital_products_slug_idx" ON "digital_products" USING btree ("slug");
    CREATE INDEX "digital_products_updated_at_idx" ON "digital_products" USING btree ("updated_at");
    CREATE INDEX "digital_products_created_at_idx" ON "digital_products" USING btree ("created_at");
    CREATE INDEX "digital_products__status_idx" ON "digital_products" USING btree ("_status");

    CREATE INDEX "digital_products_gallery_order_idx" ON "digital_products_gallery" USING btree ("_order");
    CREATE INDEX "digital_products_gallery_parent_id_idx" ON "digital_products_gallery" USING btree ("_parent_id");

    CREATE INDEX "_digital_products_v_parent_idx" ON "_digital_products_v" USING btree ("parent_id");
    CREATE INDEX "_digital_products_v_version_version_slug_idx" ON "_digital_products_v" USING btree ("version_slug");
    CREATE INDEX "_digital_products_v_version_version_cover_image_idx" ON "_digital_products_v" USING btree ("version_cover_image_id");
    CREATE INDEX "_digital_products_v_version_version_updated_at_idx" ON "_digital_products_v" USING btree ("version_updated_at");
    CREATE INDEX "_digital_products_v_version_version_created_at_idx" ON "_digital_products_v" USING btree ("version_created_at");
    CREATE INDEX "_digital_products_v_version_version__status_idx" ON "_digital_products_v" USING btree ("version__status");
    CREATE INDEX "_digital_products_v_created_at_idx" ON "_digital_products_v" USING btree ("created_at");
    CREATE INDEX "_digital_products_v_updated_at_idx" ON "_digital_products_v" USING btree ("updated_at");
    CREATE INDEX "_digital_products_v_latest_idx" ON "_digital_products_v" USING btree ("latest");

    CREATE INDEX "_digital_products_v_version_gallery_order_idx" ON "_digital_products_v_version_gallery" USING btree ("_order");
    CREATE INDEX "_digital_products_v_version_gallery_parent_id_idx" ON "_digital_products_v_version_gallery" USING btree ("_parent_id");

    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_digital_products_fk"
      FOREIGN KEY ("digital_products_id") REFERENCES "public"."digital_products"("id") ON DELETE cascade ON UPDATE no action;
    CREATE INDEX "payload_locked_documents_rels_digital_products_id_idx"
      ON "payload_locked_documents_rels" USING btree ("digital_products_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_digital_products_fk";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_digital_products_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "digital_products_id";
    DROP TABLE "_digital_products_v_version_gallery" CASCADE;
    DROP TABLE "_digital_products_v" CASCADE;
    DROP TABLE "digital_products_gallery" CASCADE;
    DROP TABLE "digital_products" CASCADE;
    DROP TYPE IF EXISTS "public"."enum__digital_products_v_version_status";
    DROP TYPE IF EXISTS "public"."enum_digital_products_status";
  `)
}