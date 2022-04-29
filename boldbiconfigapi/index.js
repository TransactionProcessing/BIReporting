var express = require('express');
const { Deta } = require('deta');

//const deta = Deta('a0f24j3l_A1MprbKkdpA4Z1iijKG6TJYpdT7oXAZB');
const deta = Deta(process.env.DETA_PROJECT_KEY);// No need to provide a key if running in a micro
const boldBIConfigDatabase = deta.Base('boldBIconfig');  // access your DB

var app = express();

app.use(express.json());

app.post('/boldBI/connectionString', async function(req,res)
{      
  // create the new config entry object
  var configEntry = {
      serverName: req.body.serverName,
      databaseName: req.body.databaseName,
      username: req.body.username,
      password: req.body.password,
      commandTimeout: req.body.commandTimeout
  };

  // TODO: extend to > 1 email address
  // Now create the database entity
  var configDatabaseEntity = {
      // Fake a composite key (TODO: move to method)
      key: req.body.datasourceId + "|" + req.body.emailAddress,
      data: configEntry
  }

  // Write to the database
  const insertedEntity = await boldBIConfigDatabase.put(configDatabaseEntity);

  // return a success (created)
  res.status(201).send();   
});

app.get('/boldBI/connectionString', async function(req,res)
{  
    // parse the request
    //requiredParams
    //datasourceName
    //datasourceId
    //customIdentity
    //identityType
    
    var key = req.headers['customidentity'];

    // Do a lookup to get the config required
    var config = await boldBIConfigDatabase.get(key);

    if (config == null)
    {
        res.status(404).send("No config found for key " + key);
        return;
    }

    // build a response
    var responseObject =     {
        Status: true,
        Message: "Success",
        Data: {
                DataSource: config.data.serverName,
                InitialCatalog: config.data.databaseName,
                Username: config.data.username,
                Password: config.data.password,
                IntegratedSecurity: "false",
                AdvancedSettings: "",
                CommandTimeout: config.data.commandTimeout
        }
      };

    // send the response  
    res.status(200).send(responseObject);
});

module.exports = app;    

// Note: these 2 lines needed for local debugging only
//const port = 1337;
//app.listen(port, () => console.log(`Hello world app listening on port ${port}!`));