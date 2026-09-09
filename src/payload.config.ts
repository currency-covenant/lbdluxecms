import { postgresAdapter } from "@payloadcms/db-postgres";
import { resendAdapter } from "@payloadcms/email-resend";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";

import { Pages } from "./collections/Pages";
import { Posts } from "./collections/Posts";
import { ShelfItems } from "./collections/ShelfItems";
import { ShelfCategories } from "./collections/ShelfCategories";
import { Authors } from "./collections/Authors";
import { LinksProfile } from "./collections/LinksProfile";
import { ProfileLinks } from "./collections/ProfileLinks";
import { ContentNetwork } from "./collections/ContentNetwork";
import { Media } from "./collections/Media";
import { Categories } from "./collections/Categories";
import Users from "./collections/Users";
import { APIKeys } from "./collections/APIKeys";
import { Webhooks } from "./collections/Webhooks";
import { AuditLogs } from "./collections/AuditLogs";
import { Header } from "./collections/Header";
import { Footer } from "./collections/Footer";
import { Site } from "./globals/Site";
import { s3Storage } from "@payloadcms/storage-s3";
import { plugins } from "./plugins";
import { ecommercePluginConfig } from "./plugins/ecommerce";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// eslint-disable-next-line no-restricted-exports
export default buildConfig({
  admin: {
    user: "users",
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Pages, Posts, ShelfItems, ShelfCategories, Authors, LinksProfile, ProfileLinks, ContentNetwork, Media, Categories, Users, APIKeys, Webhooks, AuditLogs, Header, Footer],
  globals: [Site],
  // db: mongooseAdapter({
  //   url: process.env.DATABASE_URL as string,
  // }),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL,
    },
    push: true,
  }),
  editor: lexicalEditor({}),
  email: resendAdapter({
    defaultFromAddress: process.env.RESEND_FROM_ADDRESS || "noreply@lbdluxe.digital",
    defaultFromName: process.env.RESEND_FROM_NAME || "Lbdluxe",
    apiKey: process.env.RESEND_API_KEY || "",
  }),
  graphQL: {
    schemaOutputFile: path.resolve(dirname, "generated-schema.graphql"),
  },
  secret: process.env.PAYLOAD_SECRET as string,
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  cors: [
    'http://localhost:3000',
    'https://cms.lbdluxe.com',
    ...(process.env.PAYLOAD_PUBLIC_SERVER_URL ? [process.env.PAYLOAD_PUBLIC_SERVER_URL] : []),
    ...(process.env.ALLOWED_ORIGINS?.split(',') || []),
  ],
  csrf: [
    'http://localhost:3000',
    'https://cms.lbdluxe.com',
    ...(process.env.PAYLOAD_PUBLIC_SERVER_URL ? [process.env.PAYLOAD_PUBLIC_SERVER_URL] : []),
    ...(process.env.ALLOWED_ORIGINS?.split(',') || []),
  ],
  plugins: [
    ecommercePluginConfig,
    s3Storage({
      bucket: process.env.S3_BUCKET!,
      config: {
        region: process.env.S3_REGION!,
        endpoint: `https://s3.${process.env.S3_REGION}.amazonaws.com`,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        },
      },
      collections: {
        media: {
          prefix: "media",
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) =>
            `https://s3.${process.env.S3_REGION}.amazonaws.com/${process.env.S3_BUCKET}/${prefix ? prefix + '/' : ''}${filename}`,
        },
      },
    }),
    ...plugins,
  ],
});
