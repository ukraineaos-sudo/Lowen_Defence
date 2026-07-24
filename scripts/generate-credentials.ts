import { hashPassword, generateAuthSecret } from "../lib/auth/password";

/**
 * Löwen Defence® Credentials & Security Helper
 * Generates secure ADMIN_PASSWORD_HASH and AUTH_SECRET.
 *
 * Usage:
 *   npm run generate:credentials -- "YourStrongPassword"
 *   npm run generate:credentials -- --secret-only
 */

export { hashPassword, generateAuthSecret };

function main() {
  const args = process.argv.slice(2);
  const isSecretOnly = args.includes("--secret-only");

  console.log("======================================================");
  console.log("  Löwen Defence® — Credentials Generator");
  console.log("======================================================");

  const authSecret = generateAuthSecret();

  if (isSecretOnly) {
    console.log(`\nAUTH_SECRET=${authSecret}\n`);
    console.log("Скопіюйте це значення в налаштування середовища (Environment Variables).\n");
    return;
  }

  const passwordArg = args.find((a) => !a.startsWith("--"));
  if (!passwordArg || passwordArg.length < 8) {
    console.error("\n❌ Вкажіть пароль (мін. 8 символів). Дефолт 'admin' більше не використовується.\n");
    console.error("   npm run generate:credentials -- \"ВашНадійнийПароль123\"\n");
    console.error("   лише AUTH_SECRET: npm run generate:credentials -- --secret-only\n");
    process.exit(1);
  }

  console.log(`ℹ️  Генерація хешу для вказаного пароля (${passwordArg.length} символів)\n`);

  const passwordHash = hashPassword(passwordArg);

  console.log("------------------------------------------------------");
  console.log("СКОПІЮЙТЕ ЦІ ЗМІННІ В VERCEL ENVIRONMENT VARIABLES АБО .ENV:");
  console.log("------------------------------------------------------\n");
  console.log(`ADMIN_USERNAME=admin`);
  console.log(`ADMIN_PASSWORD_HASH=${passwordHash}`);
  console.log(`AUTH_SECRET=${authSecret}`);
  console.log(`MEDIA_BLOB_READ_WRITE_TOKEN=`);
  console.log(`DATA_BLOB_READ_WRITE_TOKEN=`);
  console.log("\n------------------------------------------------------");
  console.log("⚠️  НІКОЛИ не зберігайте відкриті паролі або секрети в Git!");
  console.log("⚠️  Не залишайте пароль 'admin' на продакшені.");
  console.log("======================================================\n");
}

if (
  process.argv[1]?.endsWith("generate-credentials.ts") ||
  process.argv[1]?.endsWith("generate-credentials.js")
) {
  main();
}
