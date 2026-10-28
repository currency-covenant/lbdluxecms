import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- accent color (new)
    ALTER TABLE "shop_cards" ADD COLUMN IF NOT EXISTS "accent_color" varchar DEFAULT '#6366f1';
    ALTER TABLE "_shop_cards_v" ADD COLUMN IF NOT EXISTS "version_accent_color" varchar DEFAULT '#6366f1';
    ALTER TABLE "shop_cards" ADD COLUMN IF NOT EXISTS "image_id" integer;
    ALTER TABLE "_shop_cards_v" ADD COLUMN IF NOT EXISTS "version_image_id" integer;

    ALTER TABLE "shop_cards"
      ADD CONSTRAINT "shop_cards_image_id_media_id_fk"
      FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_shop_cards_v"
      ADD CONSTRAINT "_shop_cards_v_version_image_id_media_id_fk"
      FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

    CREATE INDEX IF NOT EXISTS "shop_cards_accent_color_idx" ON "shop_cards" USING btree ("accent_color");
    CREATE INDEX IF NOT EXISTS "shop_cards_image_idx" ON "shop_cards" USING btree ("image_id");

    -- seed sensible accents (matching the original cyan/crimson look)
    UPDATE "shop_cards" SET "accent_color" = '#22d3ee' WHERE "url" = 'https://shop.lbdluxe.com';
    UPDATE "shop_cards" SET "accent_color" = '#f43f5e' WHERE "url" = 'https://shop.currencycovenant.com';

    -- drop the now-dead shape columns + enums
    ALTER TABLE "shop_cards" DROP COLUMN IF EXISTS "shape";
    ALTER TABLE "shop_cards" DROP COLUMN IF EXISTS "hue_offset";
    ALTER TABLE "_shop_cards_v" DROP COLUMN IF EXISTS "version_shape";
    ALTER TABLE "_shop_cards_v" DROP COLUMN IF EXISTS "version_hue_offset";

    DROP TYPE IF EXISTS "public"."enum_shop_cards_shape";
    DROP TYPE IF EXISTS "public"."enum__shop_cards_v_version_shape";
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_shop_cards_shape" AS ENUM('cube', 'octahedron', 'tetrahedron', 'pyramid', 'prism', 'globe');
    CREATE TYPE "public"."enum__shop_cards_v_version_shape" AS ENUM('cube', 'octahedron', 'tetrahedron', 'pyramid', 'prism', 'globe');

    ALTER TABLE "shop_cards" ADD COLUMN IF NOT EXISTS "shape" "enum_shop_cards_shape" DEFAULT 'cube';
    ALTER TABLE "shop_cards" ADD COLUMN IF NOT EXISTS "hue_offset" numeric DEFAULT 0;
    ALTER TABLE "_shop_cards_v" ADD COLUMN IF NOT EXISTS "version_shape" "enum__shop_cards_v_version_shape" DEFAULT 'cube';
    ALTER TABLE "_shop_cards_v" ADD COLUMN IF NOT EXISTS "version_hue_offset" numeric DEFAULT 0;

    ALTER TABLE "shop_cards" DROP COLUMN IF EXISTS "image_id";
    ALTER TABLE "_shop_cards_v" DROP COLUMN IF EXISTS "version_image_id";
    ALTER TABLE "shop_cards" DROP COLUMN IF EXISTS "accent_color";
    ALTER TABLE "_shop_cards_v" DROP COLUMN IF EXISTS "version_accent_color";

    ALTER TABLE "shop_cards" DROP CONSTRAINT IF EXISTS "shop_cards_image_id_media_id_fk";
    ALTER TABLE "_shop_cards_v" DROP CONSTRAINT IF EXISTS "_shop_cards_v_version_image_id_media_id_fk";
    DROP INDEX IF EXISTS "shop_cards_image_idx";
    DROP INDEX IF EXISTS "shop_cards_accent_color_idx";
  `)
}
