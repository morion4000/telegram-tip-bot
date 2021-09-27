const config = require('./../config');
const axios = require('axios');
const mailgun = require('mailgun-js')({
  apiKey: config.mailgun.key,
  domain: config.mailgun.domain,
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const NODE_URL =
  process.env.NODE_URL || 'https://server.webdollarminingpool.com';
const FALLBACK_URL =
  process.env.FALLBACK_URL || 'https://cryptocoingb.ddns.net:8081';
const DELTA = process.env.DELTA || 2;
const SUBJECT = `[ALERT][${NODE_URL}] Node in fork or down`;
const FROM = 'Hostero <no-reply@mg.hostero.eu>';
const AXIOS_TIMEOUT = 3000;

exports.handler = async function (event) {
  try {
    const request_node = await axios.get(NODE_URL, {timeout: AXIOS_TIMEOUT});
    const request_fallback = await axios.get(FALLBACK_URL, {timeout: AXIOS_TIMEOUT});
    const response_node = request_node.data;
    const response_fallback = request_fallback.data;

    if (
      !response_node ||
      !response_node.blocks ||
      !response_node.blocks.length
    ) {
      throw new Error(`Couldn't get blocks for node`);
    }

    if (
      !response_fallback ||
      !response_fallback.blocks ||
      !response_fallback.blocks.length
    ) {
      throw new Error(`Couldn't get blocks for fallback`);
    }

    const node_blocks = response_node.blocks.length;
    const fallback_blocks = response_fallback.blocks.length;
    const delta = Math.abs(node_blocks - fallback_blocks);

    console.log(`${NODE_URL} ${node_blocks}`);
    console.log(`${FALLBACK_URL} ${fallback_blocks}`);
    console.log(`Delta: ${delta}, Threshold: ${DELTA}`);

    if (delta >= DELTA) {
      await mailgun.messages().send({
        from: FROM,
        to: config.admin.email,
        subject: SUBJECT,
        text: `Blocks: ${delta}\n Node: ${NODE_URL}`,
      });
    }
  } catch (error) {
    console.error(error.message);

    await mailgun.messages().send({
      from: FROM,
      to: config.admin.email,
      subject: SUBJECT,
      text: JSON.stringify(error),
    });
  }

  return {
    message: null,
    event,
  };
};
