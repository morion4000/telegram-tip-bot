const axios = require('axios');

module.exports = class Webdchain {
  constructor(
    url = 'https://webdchain.io',
    api_url = 'https://webdchain.io:2053'
  ) {
    this.url = url;
    this.api_url = api_url;
  }

  encode_address(address) {
    return encodeURIComponent(address);
  }

  get_block_url_by_hash(hash) {
    return `${this.url}/block/${hash}`;
  }

  async make_request(url) {
    console.log(`Making request to ${url}`);

    const response = await axios.get(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    return response.data;
  }

  get_transactions(address) {
    return this.make_request(
      `${this.api_url}/address-txs?address=${this.encode_address(address)}`
    );
  }

  get_chain() {
    return this.make_request(`${this.api_url}/chain`);
  }

  get_blocks_by_height(start, end) {
    if (!end) {
      end = start + 1;
    }

    return this.make_request(
      `${this.api_url}/blocks?start=${start}&end=${end}`
    );
  }

  async get_block_by_height(height) {
    const [block] = await this.get_blocks_by_height(height, height + 1);

    return block;
  }

  async get_height() {
    const chain = await this.get_chain();

    return chain.height;
  }
};
