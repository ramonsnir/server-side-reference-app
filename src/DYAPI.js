const request = require('request-promise-native');

const demoApiKey = 'e0deafb4085369452bf09ed067ebe5151ccfdc585ccc3dbd00af6e703c0e664c';

async function choose(userId, sessionId, context, placements) {
  return (await request({
    method: 'POST',
    url: 'https://dy-api.com/v2/serve/user/choose',
    headers: {
      'DY-API-Key': process.env.DY_API_KEY || demoApiKey,
      'Content-Type': 'application/json',
    },
    body: {
      user: {
        id: userId,
      },
      sessionId,
      selector: {
        names: placements,
      },
      context,
    },
    json: true,
  })).choices.reduce((response, choice) => {
    if (choice.type === 'RECS_DECISION') {
      choice.slots = choice.variations[0].payload.data.slots;
    }
    response[choice.name] = choice;
    return response;
  }, {});
}

async function generateJwt(userId) {
  return request({
    url: 'https://dy-api.com/v2/generate-token',
    method: 'POST',
    headers: {
      'DY-API-Key': process.env.DY_API_KEY || demoApiKey,
    },
    body: {
      source: 'client',
      userId,
    },
    json: true,
  });
}

module.exports = {
  choose,
  generateJwt,
};
