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

function cache(to, from) {
  const key = from;

  client.get(key).then(reply => {
    
    if (reply) {
      // res.send(JSON.parse(reply));
      return true;
    }
    else {
        client.set(from, to, {'EX':14400});
        return false;
    }
  }).catch(err=>{
    console.log(err);
  });
}


const getAccounts = (request, response) => {
    pool.query('SELECT * FROM account', (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows)
    })
  }

  const inboundSMS = (request, response) => {
    const { username, auth_id, msg, to, from } = request.body;
    try{
      // input validation
        if(!auth_id)
        {
          response.status(400).json({message: "", error: "auth_id parameter is missing"});
          return;
        } 
        if(!username)
        {
          response.status(400).json({message: "", error: "username parameter is missing"});
          return;
        } 
        if(!to)
        {
          response.status(400).json({message: "", error: "To parameter is missing"});
          return;
        } 
        if(!from)
        {
          response.status(400).json({message: "", error: "from parameter is missing"});
          return;
        } 

        if(to.length <= 6 || to.length >= 16)
        {
          response.status(400).json({message: "", error: "To parameter is Invalid"});
          return;
        } 
        if(from.length <= 6 || from.length >= 16)
        {
          response.status(400).json({message: "", error: "From parameter is Invalid"});
          return;
        } 
        // authenticate the user with valid username & auth_id  
        pool.query('SELECT auth_id, id FROM account WHERE username = $1', [username], (error, results) => {
            if (error) {
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
                // check if the text has STOP
                if(msg.includes("STOP"))
                {
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
      response.status(400).msg("Error Encountered");
      return;
    }
  }

  const outboundSMS = async (request, response) => {
    const { username, auth_id, msg, to, from } = request.body;
    try{
      if(!to)
      {
        response.status(400).json({message: "", error: "To parameter is missing"});
        return;
      } 
      if(!from)
      {
        response.status(400).json({message: "", error: "from parameter is missing"});
        return;
      } 
      const cacheResults = await redisClient.get(from);
      if (cacheResults && cacheResults == to) {
        console.log('Found entry of to & from pair in cache');
        response.status(400).json({message: "", error: "sms from <from> to <to> blocked by STOP request parameter is missing"});
        return;
      } 

      // input validation
        if(!auth_id)
        {
          response.status(400).json({message: "", error: "auth_id parameter is missing"});
          return;
        } 
        if(!username)
        {
          response.status(400).json({message: "", error: "username parameter is missing"});
          return;
        } 

        if(to.length <= 6 || to.length >= 16)
        {
          response.status(400).json({message: "", error: "To parameter is Invalid"});
          return;
        } 
        if(from.length <= 6 || from.length >= 16)
        {
          response.status(400).json({message: "", error: "From parameter is Invalid"});
          return;
        } 
        // authenticate the user with valid username & auth_id  
        pool.query('SELECT auth_id, id FROM account WHERE username = $1', [username], (error, results) => {
            if (error) {
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
                // check if the text has STOP
                let str = "from:";
                str = str.concat(from);
                const cacheResults = await redisClient.get(str);
                if (cacheResults) {
                  console.log('cache results: count: ', cacheResults)
                  if(cacheResults<=50)
                    await redisClient.set(str, Number(cacheResults)+1);
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
      response.status(400).msg("Error Encountered");
      return;
    }
  }

  module.exports = {
    getAccounts,
    inboundSMS,
    outboundSMS
  }