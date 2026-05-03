// Utilitário para upload de arquivos PDF para o Cloudflare R2
const AWS = require('aws-sdk');
require('dotenv').config();

const s3 = new AWS.S3({
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  endpoint: process.env.R2_ENDPOINT,
  region: 'auto', // Cloudflare ignora a região, mas precisa ser preenchida
  signatureVersion: 'v4',
});

/**
 * Faz upload de um arquivo para o Cloudflare R2
 * @param {Buffer} buffer - Conteúdo do arquivo
 * @param {string} key - Nome do arquivo (ex: comprovantes/arquivo.pdf)
 * @param {string} contentType - Tipo do arquivo (ex: application/pdf)
 * @returns {Promise<string>} - URL pública do arquivo
 */
async function uploadToR2(buffer, key, contentType = 'application/pdf') {
  const params = {
    Bucket: process.env.R2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read',
  };
  await s3.putObject(params).promise();
  // Monta a URL pública
  const url = `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET}/${key}`;
  return url;
}

module.exports = { uploadToR2 };
