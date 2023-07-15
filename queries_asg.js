const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'password',
  port: 5432,
})

const redis = require("redis");

(async () => {
  redisClient = redis.createClient();

  redisClient.on("error", (error) => console.error(`Error : ${error}`));

  await redisClient.connect();
})();

const getAccounts = (request, response) => {
  const { username, auth_id } = request.body;
    pool.query('SELECT * FROM account WHERE username = $1 AND auth_id = $2', [username, auth_id], (error, results) => {
      if (results.rows[0] && results.rows[0].id ) {
        console.log('results', results.rows[0]);
        response.status(200).json(results.rows)
      }
      else{
        response.status(400).json({ error: "invalid username"});
        return;
      }   
  });
}

function input_validation(request){
  const { username, auth_id, msg, to, from } = request.body;
  let response = {};
  if(!auth_id)
  {
    response.is_valid = false;
    response.message = "";
    response.error = "auth_id parameter is missing";
    return response;
  } 
  if(!username)
  {
    response.is_valid = false;
    response.message = "";
    response.error = "username parameter is missing";
    return response;
  } 
  if(!to)
  {
    response.is_valid = false;
    response.message = "";
    response.error = "to parameter is missing";
    return response;
  }
  if(!from)
  {
    response.is_valid = false;
    response.message = "";
    response.error = "from parameter is missing";
    return response;
  }    
  if(to.length <= 6 || to.length >= 16)
  {
    response.is_valid = false;
    response.message = "";
    response.error = "To parameter is Invalid (string length not valid)";
    return response;
  }    
  if(from.length <= 6 || from.length >= 16)
  {
    response.is_valid = false;
    response.message = "";
    response.error = "from parameter is Invalid (string length not valid)";
    return response;
  }   
  response.is_valid = true;
  return response;
}

const inboundSMS = (request, response) => {
  const { username, auth_id, msg, to, from } = request.body;
  try{
    // input validation
    const validate = input_validation(request);
    if(validate.is_valid == false)
    {
      response.status(400).json({message: validate.message, error: validate.error});
      return;
    }
    // authenticate the user with username & auth_id credentials
    pool.query('SELECT * FROM account WHERE username = $1 AND auth_id = $2', [username, auth_id], (error, results) => {
    // pool.query('SELECT auth_id, id FROM account WHERE username = $1 AND auth_id = $2', [username, auth_id], (error, results) => {
        if (!results.rows[0] || !results.rows[0].id) {
          response.status(403).json({message: "", error: "Invalid username and auth_id"});
          return;
        }
        const acc_id = results.rows[0].id;
        pool.query('SELECT P.number, P.account_id FROM phone_number P INNER JOIN account A ON P.account_id = A.id where P.number =$1', [to], async (error2, results2) => {
          if (error2) {
            response.status(403).json({message: "", error: "parameter To is invalid"});
            return;
          }
          if(results2.rows[0] != null && results2.rows[0].account_id == acc_id)
          {
            // check if the msg text has STOP
            if(msg.includes("STOP"))
            {
              // check the from number in cache, if its not present add the from and to pair in cache
              const cacheResults = await redisClient.get(from);
              if (cacheResults) {
                console.log('Found entry in cache');
              } else {
                await redisClient.set(from, to, {'EX':14400});
                console.log('adding entry in cache');
              }
            }
            response.status(200).json({message: "inbound sms ok", error: ""});
          }  
          else
          {
            response.status(403).json({message: "", error: "parameter To is invalid"});
            return;
          }
        });
    });
  }
  catch(err){
    response.status(400).json({error: err});
    return;
  }
}

const outboundSMS = async (request, response) => {
  const { username, auth_id, msg, to, from } = request.body;
  try{
    // input validation
    const validate = input_validation(request);
    if(validate.is_valid == false)
    {
      response.status(400).json({message: validate.message, error: validate.error});
      return;
    }
    // checking in (STOP)cache if the to & from pair exists 
    const cacheResults = await redisClient.get(from);
    if (cacheResults && cacheResults == to) {
      console.log('Found entry of to & from pair in cache');
      response.status(400).json({message: "", error: "sms from <from> to <to> blocked by STOP request parameter is missing"});
      return;
    } 
      // authenticate the user with username & auth_id credentials
    pool.query('SELECT auth_id, id FROM account WHERE username = $1 AND auth_id = $2', [username, auth_id], (error, results) => {
        if (!results.rows[0] || !results.rows[0].id) {
          response.status(403).json({message: "", error: "Invalid username and auth_id"});
          return;
        }
        const acc_id = results.rows[0].id;
        pool.query('SELECT P.number, P.account_id FROM phone_number P INNER JOIN account A ON P.account_id = A.id where P.number =$1', [from], async (error2, results2) => {
          if (error2) {
            response.status(403).json({message: "", error: "parameter From is invalid"});
            return;
          }
          if(results2.rows[0] != null && results2.rows[0].account_id == acc_id)
          {
            // to maintain the count of requests coming from a "from" number, the key string will look like "from:441224980087"
            let str = "from:";
            str = str.concat(from);
            const RequestCount = await redisClient.get(str);
            if (RequestCount) {
              console.log('cache results: count: ', RequestCount)
              
              if(RequestCount<=50)
                await redisClient.set(str, Number(RequestCount)+1);
              else
              {
                response.status(400).json({message: "", error: "limit reached for from parameter"});
                return;
              }  
            } else {
                await redisClient.set(str, 1, {'EX':86400});
                console.log('adding entry in cache');
            }
            response.status(200).json({message: "outbound sms ok", error: ""});
          }  
          else
          {
            response.status(403).json({message: "", error: "parameter From is invalid"});
            return;
          }
        });
    });
  }
  catch(err){
    response.status(400).json({error: err});
    return;
  }
}

module.exports = {
  getAccounts,
  inboundSMS,
  outboundSMS
}