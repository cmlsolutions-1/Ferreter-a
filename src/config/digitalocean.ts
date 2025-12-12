import { S3Client } from "@aws-sdk/client-s3";
import { envs } from "./envs";

export const spacesClient = new S3Client({
  region: "us-east-1", 
  endpoint: envs.SPACES_ENDPOINT,
  credentials: {
    accessKeyId: envs.SPACES_KEY!,
    secretAccessKey: envs.SPACES_SECRET!,
  },
});