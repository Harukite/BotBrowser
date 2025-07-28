const crypto = require("crypto");
const fs = require("fs");

(async () => {
  let profileContent = await fs.promises.readFile(
    "chrome135_mac_arm64.json",
    "utf-8"
  );
  const profileObj = JSON.parse(profileContent);
  profileContent = JSON.stringify(profileObj);

  // Згенеруйте випадковий aeskey і зашифруйте Profile
  const aesKey = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);
  const aesKeyInfo = aesKey.toString("hex") + "|" + iv.toString("hex");
  console.log("aesKeyInfo", aesKeyInfo);

  const aesCipher = crypto.createCipheriv("aes-256-cbc", aesKey, iv);
  let aesEncryptedProfile = aesCipher.update(profileContent, "utf8", "base64");
  aesEncryptedProfile += aesCipher.final("base64");

  // Шифрує aesKey за допомогою RSA.
  const rsaPrivateKey = await fs.promises.readFile("privateKey.pem", "utf-8");
  const rsaEncryptedAESInfo = crypto
    .privateEncrypt(
      { key: rsaPrivateKey, passphrase: "" },
      Buffer.from(aesKeyInfo)
    )
    .toString("base64");

  await fs.promises.writeFile(
    "chrome135_mac_arm64.enc",
    JSON.stringify({
      key: rsaEncryptedAESInfo,
      profile: aesEncryptedProfile,
    })
  );
})();
