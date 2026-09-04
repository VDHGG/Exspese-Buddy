import { PayOS } from '@payos/node';

const clientId = process.env.PAYOS_CLIENT_ID;
const apiKey = process.env.PAYOS_API_KEY;
const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

let payos = null;

if (clientId && apiKey && checksumKey) {
  payos = new PayOS({
    clientId,
    apiKey,
    checksumKey,
  });
} else {
  console.warn('⚠️ payOS credentials missing in environment variables.');
}

export default payos;
