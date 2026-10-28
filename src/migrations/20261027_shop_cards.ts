import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_shop_cards_status" AS ENUM('draft', 'published');
    CREATE TYPE "public"."enum__shop_cards_v_version_status" AS ENUM('draft', 'published');

    CREATE TYPE "public"."enum_shop_cards_shape" AS ENUM('cube', 'octahedron', 'tetrahedron', 'pyramid', 'prism', 'globe');
    CREATE TYPE "public"."enum__shop_cards_v_version_shape" AS ENUM('cube', 'octahedron', 'tetrahedron', 'pyramid', 'prism', 'globe');

    CREATE TABLE "shop_cards" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL,
      "badge" varchar,
      "description" varchar,
      "url" varchar NOT NULL,
      "url_label" varchar,
      "shape" "enum_shop_cards_shape" DEFAULT 'cube',
      "hue_offset" numeric DEFAULT 0,
      "order" numeric DEFAULT 0,
      "published_at" timestamp(3) with time zone,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "_status" "enum_shop_cards_status" DEFAULT 'draft'
    );

    CREATE TABLE "_shop_cards_v" (
      "id" serial PRIMARY KEY NOT NULL,
      "parent_id" integer,
      "version_title" varchar,
      "version_badge" varchar,
      "version_description" varchar,
      "version_url" varchar,
      "version_url_label" varchar,
      "version_shape" "enum__shop_cards_v_version_shape" DEFAULT 'cube',
      "version_hue_offset" numeric DEFAULT 0,
      "version_order" numeric DEFAULT 0,
      "version_published_at" timestamp(3) with time zone,
      "version_updated_at" timestamp(3) with time zone,
      "version_created_at" timestamp(3) with time zone,
      "version__status" "enum__shop_cards_v_version_status" DEFAULT 'draft',
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "latest" boolean
    );

    ALTER TABLE "_shop_cards_v" ADD CONSTRAINT "_shop_cards_v_parent_id_shop_cards_id_fk"
      FOREIGN KEY ("parent_id") REFERENCES "public"."shop_cards"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "shop_cards_id" integer;

    CREATE INDEX "shop_cards_updated_at_idx" ON "shop_cards" USING btree ("updated_at");
    CREATE INDEX "shop_cards_created_at_idx" ON "shop_cards" USING btree ("created_at");
    CREATE INDEX "shop_cards__status_idx" ON "shop_cards" USING btree ("_status");
    CREATE INDEX "shop_cards_order_idx" ON "shop_cards" USING btree ("order");

    CREATE INDEX "_shop_cards_v_parent_idx" ON "_shop_cards_v" USING btree ("parent_id");
    CREATE INDEX "_shop_cards_v_version_version_updated_at_idx" ON "_shop_cards_v" USING btree ("version_updated_at");
    CREATE INDEX "_shop_cards_v_version_version_created_at_idx" ON "_shop_cards_v" USING btree ("version_created_at");
    CREATE INDEX "_shop_cards_v_version_version__status_idx" ON "_shop_cards_v" USING btree ("version__status");
    CREATE INDEX "_shop_cards_v_created_at_idx" ON "_shop_cards_v" USING btree ("created_at");
    CREATE INDEX "_shop_cards_v_updated_at_idx" ON "_shop_cards_v" USING btree ("updated_at");
    CREATE INDEX "_shop_cards_v_latest_idx" ON "_shop_cards_v" USING btree ("latest");

    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_shop_cards_fk"
      FOREIGN KEY ("shop_cards_id") REFERENCES "public"."shop_cards"("id") ON DELETE cascade ON UPDATE no action;
    CREATE INDEX "payload_locked_documents_rels_shop_cards_id_idx"
      ON "payload_locked_documents_rels" USING btree ("shop_cards_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_shop_cards_fk";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_shop_cards_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "shop_cards_id";
    DROP TABLE "_shop_cards_v" CASCADE;
    DROP TABLE "shop_cards" CASCADE;
    DROP TYPE IF EXISTS "public"."enum__shop_cards_v_version_shape";
    DROP TYPE IF EXISTS "public"."enum__shop_cards_v_version_status";
    DROP TYPE IF EXISTS "public"."enum_shop_cards_shape";
    DROP TYPE IF EXISTS "public"."enum_shop_cards_status";
  `)
}
