import { hashPassword, generateAuthSecret } from "../lib/auth/password";

/**
 * Löwen Defence® Credentials & Security Helper
 * Generates secure ADMIN_PASSWORD_HASH and AUTH_SECRET.
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

  let passwordArg = args.find((a) => !a.startsWith("--"));
  if (!passwordArg) {
    passwordArg = "admin";
    console.log("ℹ️  Пароль не вказано в аргументах. Згенеровано хеш для стандартного пароля 'admin'.");
    console.log("   Щоб створити хеш для власного пароля, виконайте:");
    console.log("   npm run hash-password -- ВашНовийПароль123\n");
  } else {
    console.log(`ℹ️  Генерація хешу для вказаного пароля: '${passwordArg}'\n`);
  }

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
  console.log("======================================================\n");
}

if (
  process.argv[1]?.endsWith("generate-credentials.ts") ||
  process.argv[1]?.endsWith("generate-credentials.js")
) {
  main();
}
