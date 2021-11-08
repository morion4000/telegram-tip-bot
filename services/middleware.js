async function route(path, ...middleware) {
  let req = {};
  let result;

  try {
    // TODO: This is running the middleware in parallel. Need to do it sequentially
    result = await Promise.all(middleware.map((fn) => fn(req)));
  } catch (err) {
    console.error(err);
  }

  console.log(result);
}

function check_private_chat(req) {
  req.test = 'a';
}

function tip_command(req) {
  req.b = 'b';

  throw new Error('bleah');
}

function log(req) {
  console.log(req);
}

route('/tip', check_private_chat, tip_command, log);
