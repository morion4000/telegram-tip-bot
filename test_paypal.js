const paypal = require('@paypal/checkout-server-sdk');

const config = require('./config');

let environment = new paypal.core.LiveEnvironment(
  config.paypal.client_id,
  config.paypal.client_secret
);
let client = new paypal.core.PayPalHttpClient(environment);

let captureOrder = async function (orderId) {
  request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});
  // Call API with your client and get a response for your call
  let response = await client.execute(request);
  console.log(`Response: ${JSON.stringify(response)}`);
  // If call returns body in response, you can get the deserialized version from the result attribute of the response.
  console.log(`Capture: ${JSON.stringify(response.result)}`);
};

async function getOrder(orderId) {
  let request = new paypal.orders.OrdersGetRequest(orderId);
  let response = await client.execute(request);
  console.log('Status Code: ' + response.statusCode);
  console.log('Status: ' + response.result.status);
  console.log('Order ID: ' + response.result.id);
  console.log('Intent: ' + response.result.intent);
  console.log('Links: ');
  response.result.links.forEach((item, index) => {
    let rel = item.rel;
    let href = item.href;
    let method = item.method;
    let message = `\t${rel}: ${href}\tCall Type: ${method}`;
    console.log(message);
  });
  console.log(
    `Gross Amount: ${response.result.purchase_units[0].amount.currency_code} ${response.result.purchase_units[0].amount.value}`
  );
  // To toggle print the whole body comment/uncomment the below line
  console.log(JSON.stringify(response.result, null, 4));
}

//getOrder('2V465831J0712315T');
//captureOrder('9GS43101BF4755608');
