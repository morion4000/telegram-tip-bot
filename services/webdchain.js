const axios = require('axios');

module.exports = class Webdchain {
  constructor(base_url = 'https://webdchain.io:2053') {
    this.base_url = base_url;
  }

  encode_address(address) {
    return encodeURIComponent(address);
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
      `${this.base_url}/address-txs?address=${this.encode_address(address)}`
    );
  }

  get_chain() {
    return this.make_request(`${this.base_url}/chain`);
  }

  get_blocks_by_height(start, end) {
    if (!end) {
      end = start + 1;
    }

    return this.make_request(
      `${this.base_url}/blocks?start=${start}&end=${end}`
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
